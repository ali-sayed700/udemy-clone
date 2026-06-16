import { ObjectType, Field, Float, ID, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';
import { Section } from '../../section/entities/section.entity';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

@Schema({ timestamps: true })
@ObjectType()
export class CourseEntity {
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
  description: string;

  @Prop({ required: true })
  @Field(() => Float)
  price: number;

  @Prop({ required: true })
  @Field(() => String)
  objectives: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Field(() => User)
  instructor: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: 'itemsAndList' })
  students: MongooseSchema.Types.ObjectId[];

  @Prop()
  @Field(() => String)
  categories: string;

  @Prop()
  @Field(() => String)
  level: string;

  @Prop()
  @Field(() => String)
  primaryLanguage: string;

  @Prop()
  @Field(() => String, { nullable: true })
  welcomeMessage?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lecture' }] })
  @Field(() => [Lecture], { nullable: 'itemsAndList' })
  lectures: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Section' }] })
  @Field(() => [Section], { nullable: 'itemsAndList' })
  sections: MongooseSchema.Types.ObjectId[];

  @Prop({ required: false })
  @Field({ nullable: true })
  image?: string;

  @Prop({ type: Boolean, default: false })
  @Field()
  isPublished: boolean;

  @Prop({ type: Number, default: 0 })
  @Field(() => Int)
  studentCount: number;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(CourseEntity);
