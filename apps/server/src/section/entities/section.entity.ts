import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Section {
  @Field(() => ID)
  @Transform(({ value }: { value: ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: ObjectId;

  @Prop({ required: true })
  @Field()
  title: string;

  @Prop({ type: Number, default: 0 })
  @Field(() => Int)
  order: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lecture' }] })
  @Field(() => [Lecture], { nullable: 'itemsAndList' })
  lectures: MongooseSchema.Types.ObjectId[];

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
