import { CreateLectureInput } from './create-lecture.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLectureInput extends PartialType(CreateLectureInput) {
  @Field()
  id: string;
}
