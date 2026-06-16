import { InputType, Field } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreateLectureInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  videoUrl: string;

  // @Field()
  // @IsNotEmpty()
  // @IsMongoId()
  // courseId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  duration: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  freePreview?: boolean;
}
