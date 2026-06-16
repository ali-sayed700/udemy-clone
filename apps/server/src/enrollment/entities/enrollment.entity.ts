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

export enum PaymentMethod {
  Stripe = 'stripe',
  Paypal = 'paypal',
}
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

export enum EnrollmentStatus {
  Active = 'active',
  Refunded = 'refunded',
}
registerEnumType(EnrollmentStatus, { name: 'EnrollmentStatus' });

@Schema({ timestamps: true })
@ObjectType()
export class Enrollment {
  @Field(() => ID)
  @Transform(({ value }: { value: Types.ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  @Field(() => User)
  user: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'CourseEntity',
    required: true,
  })
  @Field(() => CourseEntity)
  course: Types.ObjectId;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  @Field(() => String)
  paymentMethod: PaymentMethod;

  @Prop({ required: true })
  @Field()
  paymentId: string;

  @Prop({ required: true })
  @Field(() => Float)
  amount: number;

  @Prop({
    type: String,
    enum: EnrollmentStatus,
    default: EnrollmentStatus.Active,
  })
  @Field(() => String)
  status: EnrollmentStatus;

  @Prop({ default: Date.now })
  @Field()
  enrolledAt: Date;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
