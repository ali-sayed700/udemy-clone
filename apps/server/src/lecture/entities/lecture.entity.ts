import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

@ObjectType()
@Schema({ timestamps: true })
export class Lecture {
  @Field(() => ID)
  @Transform(({ value }: { value: ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: ObjectId;

  @Prop({ required: true })
  @Field()
  title: string;

  @Prop({ required: true })
  @Field()
  videoUrl: string;

  @Prop({ type: String })
  @Field(() => String)
  duration: string;

  @Prop({ type: Boolean, default: false })
  @Field()
  freePreview: boolean;

  // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  // @Field(() => CourseEntity)
  // courseId: CourseEntity;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);
