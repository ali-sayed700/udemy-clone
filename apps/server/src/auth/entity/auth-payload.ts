import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { UserRole } from 'src/user/entities/user.entity';
// import { Schema as MongooseSchema } from 'mongoose';

@ObjectType()
export class AuthPayload {
  @Field()
  // userId: MongooseSchema.Types.ObjectId;
  userId: string;

  @Field(() => String)
  role: UserRole;

  @Field()
  accessToken: string;

  @Field()
  userName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  avatar?: string;

  @Field()
  refreshToken: string;
}
