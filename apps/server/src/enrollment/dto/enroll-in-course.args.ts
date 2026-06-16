import { ArgsType, Field, Float, ID } from '@nestjs/graphql';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PaymentMethod } from '../entities/enrollment.entity';

@ArgsType()
export class EnrollInCourseArgs {
  @Field(() => ID)
  @IsMongoId()
  courseId: string;

  @Field()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field()
  @IsString()
  @MinLength(1)
  paymentId: string;

  @Field(() => Float)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  amount: number;
}
