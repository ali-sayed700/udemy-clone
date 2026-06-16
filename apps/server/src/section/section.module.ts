import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionService } from './section.service';
import { SectionResolver } from './section.resolver';
import { Section, SectionSchema } from './entities/section.entity';
import { CourseEntity, CourseSchema } from '../course/entities/course.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: CourseEntity.name, schema: CourseSchema },
    ]),
  ],
  providers: [SectionResolver, SectionService],
  exports: [SectionService],
})
export class SectionModule {}
