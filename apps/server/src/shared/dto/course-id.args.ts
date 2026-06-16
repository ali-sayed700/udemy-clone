import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@ArgsType()
export class CourseIdArgs {
  @Field(() => ID)
  @IsMongoId()
  courseId: string;
}
