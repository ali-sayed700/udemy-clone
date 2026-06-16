import { ArgsType, Field, ID, Int } from '@nestjs/graphql';
import { IsInt, IsMongoId, Min } from 'class-validator';

@ArgsType()
export class CourseCompletionStatsArgs {
  @Field(() => ID)
  @IsMongoId()
  courseId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  totalLectures: number;
}
