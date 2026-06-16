import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseProgressService } from './course-progress.service';
import { CourseProgressResolver } from './course-progress.resolver';
import {
  CourseProgress,
  CourseProgressSchema,
} from './entities/course-progress.entity';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { CourseEntity, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: CourseEntity.name, schema: CourseSchema },
    ]),
    EnrollmentModule,
  ],
  providers: [CourseProgressResolver, CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
