import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { APIFeatures } from 'src/utils/apiFeatures';
import { UserRole } from 'src/user/entities/user.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(CourseEntity.name) private courseModel: Model<CourseEntity>,
  ) {}

  async create(
    createCourseInput: CreateCourseInput,
    userId: string,
  ): Promise<CourseEntity> {
    const createdCourse = new this.courseModel({
      ...createCourseInput,
      instructor: userId,
    });
    return createdCourse.save();
  }
  // : Promise<Course[]>
  async findAll(queryReq: any): Promise<CourseEntity[]> {
    const apiFeatures = new APIFeatures(
      this.courseModel
        .find()
        .lean()
        .populate([
          'instructor',
          'students',
          'lectures',
          { path: 'sections', populate: 'lectures' },
        ]),
      queryReq,
    )
      .filter()
      .paginate()
      .search()
      .sort()
      .limitFields();

    const courses = (await apiFeatures.mongooseQuery) as CourseEntity[];
    return courses;
  }

  async findOne(id: string): Promise<CourseEntity> {
    const course = await this.courseModel
      .findById(id)
      .populate([
        'instructor',
        'students',
        'lectures',
        { path: 'sections', populate: 'lectures' },
      ])
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async findByInstructor(instructorId: string): Promise<CourseEntity[]> {
    const courses = await this.courseModel
      .find({ instructor: instructorId })
      .populate([
        'instructor',
        'students',
        'lectures',
        { path: 'sections', populate: 'lectures' },
      ])
      .exec();
    return courses;
  }

  async update(
    id: string,
    updateCourseInput: UpdateCourseInput,
    userId?: string,
    role?: UserRole | string,
  ): Promise<CourseEntity> {
    if (userId && role) {
      await this.assertCanManageCourse(id, userId, role);
    }

    const updateData: Partial<UpdateCourseInput> = { ...updateCourseInput };
    delete updateData._id;

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate([
        'instructor',
        'students',
        'lectures',
        { path: 'sections', populate: 'lectures' },
      ])
      .exec();
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return updatedCourse;
  }

  async remove(
    id: string,
    userId?: string,
    role?: UserRole | string,
  ): Promise<CourseEntity> {
    if (userId && role) {
      await this.assertCanManageCourse(id, userId, role);
    }

    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return deletedCourse;
  }

  private async assertCanManageCourse(
    courseId: string,
    userId: string,
    role: UserRole | string,
  ): Promise<void> {
    if (role === UserRole.Admin) return;

    const course = await this.courseModel
      .findById(courseId)
      .select('instructor');
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    if (course.instructor?.toString() !== userId) {
      throw new ForbiddenException('You can only manage your own courses');
    }
  }
}
