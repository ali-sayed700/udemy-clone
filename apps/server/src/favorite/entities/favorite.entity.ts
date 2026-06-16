import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CourseEntity } from '../../course/entities/course.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Favorite {
  @Field(() => ID)
  _id: string;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Field(() => CourseEntity)
  @Prop({ type: Types.ObjectId, ref: 'CourseEntity', required: true })
  course: Types.ObjectId | CourseEntity;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export type FavoriteDocument = Favorite & Document;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Prevent duplicate favorites for the same user-course pair
FavoriteSchema.index({ user: 1, course: 1 }, { unique: true });
