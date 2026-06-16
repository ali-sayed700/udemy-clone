import {
  ObjectType,
  Field,
  ID,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CourseEntity } from '../../course/entities/course.entity';

export enum OrderStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum OrderPaymentMethod {
  Stripe = 'stripe',
  Paypal = 'paypal',
}
registerEnumType(OrderPaymentMethod, { name: 'OrderPaymentMethod' });

@Schema({ timestamps: true })
@ObjectType()
export class Order {
  @Field(() => ID)
  @Transform(({ value }: { value: Types.ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  @Field(() => User)
  user: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CourseEntity' }],
    required: true,
  })
  @Field(() => [CourseEntity])
  courses: Types.ObjectId[];

  @Prop({ type: String, enum: OrderPaymentMethod, required: true })
  @Field(() => String)
  paymentMethod: OrderPaymentMethod;

  @Prop({ required: true })
  @Field()
  paymentId: string;

  @Prop({ required: true })
  @Field(() => Float)
  totalAmount: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.Pending,
  })
  @Field(() => String)
  status: OrderStatus;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Index on paymentId for idempotency checks
OrderSchema.index({ paymentId: 1 }, { unique: true });
