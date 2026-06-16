import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsMongoId,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  // @Field()
  // @IsNotEmpty()
  // @IsMongoId()
  // instructor: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  categories: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  level: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  primaryLanguage: string;

  @Field()
  @IsBoolean()
  isPublished: boolean;

  @Field()
  @IsString()
  welcomeMessage: string;

  @Field(() => [String])
  @IsMongoId({ each: true })
  lectures: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  image?: string;

  @Field()
  @IsString()
  objectives: string;
}
