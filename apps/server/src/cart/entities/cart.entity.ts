import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CourseEntity } from '../../course/entities/course.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Cart {
  @Field(() => ID)
  @Transform(({ value }: { value: Types.ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // User has one cart
  })
  @Field(() => User)
  user: User | Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CourseEntity' }],
    default: [],
  })
  @Field(() => [CourseEntity])
  items: CourseEntity[] | Types.ObjectId[];

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
