import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './entities/cart.entity';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private enrollmentService: EnrollmentService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartModel
      .findOne({ user: userId })
      .populate({
        path: 'items',
        populate: {
          path: 'instructor',
        },
      })
      .exec();

    if (!cart) {
      cart = await new this.cartModel({ user: userId, items: [] }).save();
    }
    return cart;
  }

  async addItem(userId: string, courseId: string): Promise<Cart> {
    // Check if enrolled
    const isEnrolled = await this.enrollmentService.isEnrolled(
      userId,
      courseId,
    );
    if (isEnrolled) {
      throw new ConflictException('You are already enrolled in this course');
    }

    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      const newCart = new this.cartModel({ user: userId, items: [courseId] });
      await newCart.save();
      return this.getCart(userId);
    }

    // Check if already in cart
    if (
      (cart.items as Types.ObjectId[]).some((id) => id.toString() === courseId)
    ) {
      throw new ConflictException('Course already in cart');
    }

    (cart.items as Types.ObjectId[]).push(new Types.ObjectId(courseId));
    await cart.save();
    return this.getCart(userId);
  }

  async removeItem(userId: string, courseId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = (cart.items as Types.ObjectId[]).filter(
      (id) => id.toString() !== courseId,
    );
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate({ user: userId }, { items: [] });
  }
}
