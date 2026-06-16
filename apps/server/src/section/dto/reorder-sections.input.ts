import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsArray } from 'class-validator';

@InputType()
export class ReorderSectionsInput {
  @Field(() => ID)
  @IsMongoId()
  courseId: string;

  @Field(() => [ID])
  @IsArray()
  @IsMongoId({ each: true })
  sectionIds: string[];
}
