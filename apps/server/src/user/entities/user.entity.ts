import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ObjectId } from 'mongodb';
export enum UserRole {
  Admin = 'admin',
  Instructor = 'instructor',
  Student = 'student',
}
registerEnumType(UserRole, { name: 'UserRole' });

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => ID)
  @Transform(({ value }: { value: ObjectId }) => value.toString(), {
    toClassOnly: true,
  })
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  @Field()
  email: string;

  @Prop({ required: true })
  @Field()
  userName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.Student })
  @Field(() => String)
  role: UserRole;

  @Prop({ required: false, unique: true, sparse: true })
  @Field({ nullable: true })
  googleId?: string;

  @Prop()
  @Field({ nullable: true })
  password: string;

  @Prop()
  @Field(() => String, { nullable: true })
  @IsOptional()
  avatar?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  hashedRefreshToken?: string;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
