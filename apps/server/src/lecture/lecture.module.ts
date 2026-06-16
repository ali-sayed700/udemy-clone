import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LectureService } from './lecture.service';
import { LectureResolver } from './lecture.resolver';
import { Lecture, LectureSchema } from './entities/lecture.entity';
import { CourseEntity, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lecture.name, schema: LectureSchema },
      { name: CourseEntity.name, schema: CourseSchema },
    ]),
  ],
  providers: [LectureResolver, LectureService],
  exports: [LectureService],
})
export class LectureModule {}
