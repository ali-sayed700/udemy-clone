import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lecture } from './entities/lecture.entity';
import { CreateLectureInput } from './dto/create-lecture.input';
import { UpdateLectureInput } from './dto/update-lecture.input';
// import { CourseEntity } from '../course/entities/course.entity';

@Injectable()
export class LectureService {
  constructor(
    @InjectModel(Lecture.name) private lectureModel: Model<Lecture>,
    // @InjectModel(CourseEntity.name) private courseModel: Model<CourseEntity>,
  ) {}

  async create(createLectureInput: CreateLectureInput): Promise<Lecture> {
    // const course = await this.courseModel.findById(courseId);
    // if (!course) {
    //   throw new NotFoundException('Course not found');
    // }

    const newLecture = new this.lectureModel(createLectureInput);

    const savedLecture = await newLecture.save();

    // await this.courseModel.findByIdAndUpdate(courseId, {
    //   $push: { lectures: savedLecture._id },
    // });

    return savedLecture;
  }

  async findAll(): Promise<Lecture[]> {
    return this.lectureModel.find().exec();
  }

  async findOne(id: string): Promise<Lecture> {
    const lecture = await this.lectureModel.findById(id);

    if (!lecture) {
      throw new NotFoundException(`Lecture #${id} not found`);
    }
    return lecture;
  }

  async update(
    id: string,
    updateLectureInput: UpdateLectureInput,
  ): Promise<Lecture> {
    const updatedLecture = await this.lectureModel
      .findByIdAndUpdate(id, updateLectureInput, { new: true })

      .exec();

    if (!updatedLecture) {
      throw new NotFoundException(`Lecture #${id} not found`);
    }
    return updatedLecture;
  }

  async remove(id: string): Promise<Lecture> {
    const lecture = await this.lectureModel.findById(id);
    if (!lecture) {
      throw new NotFoundException(`Lecture #${id} not found`);
    }

    // // Remove reference from Course
    // await this.courseModel.findByIdAndUpdate(lecture.courseId, {
    //   $pull: { lectures: id },
    // });

    const deletedLecture = await this.lectureModel
      .findByIdAndDelete(id)

      .exec();
    if (!deletedLecture) {
      throw new NotFoundException(`Lecture #${id} not found`);
    }

    return deletedLecture;
  }
}
