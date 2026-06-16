import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CourseEntity } from '../../course/entities/course.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Schema({ timestamps: true })
@ObjectType()
export class CourseProgress {
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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  })
  @Field(() => Lecture)
  lecture: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  @Field()
  viewed: boolean;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  viewedDate: Date | null;

  @Prop({ type: Boolean, default: false })
  @Field()
  completed: boolean;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  completedDate: Date | null;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const CourseProgressSchema =
  SchemaFactory.createForClass(CourseProgress);

// Unique: one progress record per user-lecture pair
CourseProgressSchema.index(
  { user: 1, course: 1, lecture: 1 },
  { unique: true, background: true },
);
