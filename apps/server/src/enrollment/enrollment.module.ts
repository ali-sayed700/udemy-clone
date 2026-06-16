import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentResolver } from './enrollment.resolver';
import { Enrollment, EnrollmentSchema } from './entities/enrollment.entity';
import { CourseEntity, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: CourseEntity.name, schema: CourseSchema },
    ]),
  ],
  providers: [EnrollmentResolver, EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
