import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment } from './entities/enrollment.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(CourseEntity.name) private courseModel: Model<CourseEntity>,
  ) {}

  async enroll(
    userId: string,
    courseId: string,
    paymentMethod: string,
    paymentId: string,
    amount: number,
  ): Promise<Enrollment> {
    // Check if already enrolled
    const existing = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    if (existing) {
      throw new ConflictException('User is already enrolled in this course');
    }

    const enrollment = new this.enrollmentModel({
      user: userId,
      course: courseId,
      paymentMethod,
      paymentId,
      amount,
    });

    const saved = await enrollment.save();

    // Increment studentCount on course and add user to students array
    await this.courseModel.findByIdAndUpdate(courseId, {
      $inc: { studentCount: 1 },
      $addToSet: { students: userId },
    });

    return this.enrollmentModel
      .findById(saved._id)
      .populate(['user', 'course'])
      .exec() as Promise<Enrollment>;
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ user: userId, status: 'active' })
      .populate('user')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor lectures',
        },
      })
      .exec();
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ course: courseId, status: 'active' })
      .populate(['user', 'course'])
      .exec();
  }

  async findByCourseForUser(
    courseId: string,
    userId: string,
    role?: UserRole | string,
  ): Promise<Enrollment[]> {
    if (role !== UserRole.Admin) {
      const course = await this.courseModel
        .findById(courseId)
        .select('instructor')
        .exec();

      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      if (course.instructor?.toString() !== userId) {
        throw new ForbiddenException(
          'You can only view students in your own courses',
        );
      }
    }

    return this.findByCourse(courseId);
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
      status: 'active',
    });
    return !!enrollment;
  }

  async countByCourse(courseId: string): Promise<number> {
    return this.enrollmentModel.countDocuments({
      course: courseId,
      status: 'active',
    });
  }
}
