import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@ArgsType()
export class CourseLectureArgs {
  @Field(() => ID)
  @IsMongoId()
  courseId: string;

  @Field(() => ID)
  @IsMongoId()
  lectureId: string;
}
