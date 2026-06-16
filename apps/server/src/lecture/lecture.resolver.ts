import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { LectureService } from './lecture.service';
import { Lecture } from './entities/lecture.entity';
import { CreateLectureInput } from './dto/create-lecture.input';
import { UpdateLectureInput } from './dto/update-lecture.input';

@Resolver(() => Lecture)
export class LectureResolver {
  constructor(private readonly lectureService: LectureService) {}

  @Mutation(() => Lecture)
  async createLecture(
    @Args('createLectureInput') createLectureInput: CreateLectureInput,
  ): Promise<Lecture> {
    return this.lectureService.create(createLectureInput);
  }

  @Query(() => [Lecture], { name: 'lectures' })
  async findAll() {
    return this.lectureService.findAll();
  }

  @Query(() => Lecture, { name: 'lecture' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.lectureService.findOne(id);
  }

  @Mutation(() => Lecture)
  async updateLecture(
    @Args('updateLectureInput') updateLectureInput: UpdateLectureInput,
  ) {
    return this.lectureService.update(
      updateLectureInput.id,
      updateLectureInput,
    );
  }

  @Mutation(() => Lecture)
  async removeLecture(@Args('id', { type: () => String }) id: string) {
    return this.lectureService.remove(id);
  }
}
