import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderStatus,
  OrderPaymentMethod,
} from './entities/order.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(CourseEntity.name) private courseModel: Model<CourseEntity>,
  ) {}

  async createOrder(
    userId: string,
    courseIds: string[],
    paymentMethod: string,
    paymentId: string,
    totalAmount: number,
  ): Promise<Order> {
    // Idempotency check: if an order with this paymentId already exists, return it
    const existing = await this.orderModel.findOne({ paymentId });
    if (existing) {
      return this.orderModel
        .findById(existing._id)
        .populate(['user', 'courses'])
        .exec() as Promise<Order>;
    }

    const order = new this.orderModel({
      user: userId,
      courses: courseIds.map((id) => new Types.ObjectId(id)),
      paymentMethod:
        paymentMethod === 'stripe'
          ? OrderPaymentMethod.Stripe
          : OrderPaymentMethod.Paypal,
      paymentId,
      totalAmount,
      status: OrderStatus.Completed,
    });

    const saved = await order.save();
    return this.orderModel
      .findById(saved._id)
      .populate(['user', 'courses'])
      .exec() as Promise<Order>;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .populate(['user', 'courses'])
      .exec();
  }

  async findForDashboard(
    userId: string,
    role?: UserRole | string,
  ): Promise<Order[]> {
    if (role === UserRole.Admin) {
      return this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .populate([
          'user',
          { path: 'courses', populate: { path: 'instructor' } },
        ])
        .exec();
    }

    const courseIds = await this.courseModel
      .find({ instructor: userId })
      .distinct('_id');

    if (courseIds.length === 0) return [];

    const orders = await this.orderModel
      .find({ courses: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .populate(['user', { path: 'courses', populate: { path: 'instructor' } }])
      .exec();

    const instructorCourseIdSet = new Set(courseIds.map((id) => id.toString()));

    return orders.map((order) => {
      const visibleCourses = order.courses.filter((course) => {
        const courseId = course?._id?.toString() ?? course?.toString();
        return instructorCourseIdSet.has(courseId);
      });

      order.courses = visibleCourses;
      return order;
    });
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate(['user', 'courses'])
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async findByIdForUser(
    orderId: string,
    userId: string,
    role?: UserRole | string,
  ): Promise<Order> {
    const order = await this.findById(orderId);
    if (role === UserRole.Admin) return order;

    const orderUserId = order.user?._id?.toString() ?? order.user?.toString();
    if (orderUserId === userId) return order;

    if (role === UserRole.Instructor) {
      const courseIds = await this.courseModel
        .find({ instructor: userId })
        .distinct('_id');
      const ownsOrderedCourse = order.courses.some((course) => {
        const courseId = course?._id?.toString() ?? course?.toString();
        return courseIds.some((id) => id.toString() === courseId);
      });

      if (ownsOrderedCourse) return order;
    }

    throw new ForbiddenException('You are not authorized to view this order');
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .populate(['user', 'courses'])
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }
}
