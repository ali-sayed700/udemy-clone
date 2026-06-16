import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // async create(createUserInput: CreateUserInput): Promise<User> {
  //   const existingUser = await this.userModel.findOne({
  //     email: createUserInput.email,
  //   });

  //   if (existingUser) {
  //     throw new BadRequestException('User with this email already exists');
  //   }

  //   if (!createUserInput.password) {
  //     throw new BadRequestException('Password is required');
  //   }
  //   const hashedPassword = await bcrypt.hash(createUserInput.password, 10);

  //   const newUser = new this.userModel({
  //     ...createUserInput,
  //     password: hashedPassword,
  //   });

  //   return newUser.save();
  // }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneForUser(
    id: string,
    currentUserId: string,
    role?: UserRole | string,
  ): Promise<User> {
    if (role !== UserRole.Admin && id !== currentUserId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.findOne(id);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(
        updateUserInput.password,
        10,
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserInput, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async updateForUser(
    id: string,
    updateUserInput: UpdateUserInput,
    currentUserId: string,
    role?: UserRole | string,
  ): Promise<User> {
    if (role !== UserRole.Admin && id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (role !== UserRole.Admin) {
      delete updateUserInput.role;
    }

    return this.update(id, updateUserInput);
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
