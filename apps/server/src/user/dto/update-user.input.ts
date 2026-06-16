import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  _id: string;

  @IsOptional()
  @IsEnum(UserRole)
  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}
