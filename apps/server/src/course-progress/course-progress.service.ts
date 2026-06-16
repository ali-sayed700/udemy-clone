import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseProgress } from './entities/course-progress.entity';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { CourseEntity } from '../course/entities/course.entity';

export interface CourseStatusInfo {
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentage: number;
  viewedCount: number;
  completedCount: number;
  totalLectures: number;
}

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectModel(CourseProgress.name)
    private progressModel: Model<CourseProgress>,
    @InjectModel(CourseEntity.name)
    private courseModel: Model<CourseEntity>,
    private enrollmentService: EnrollmentService,
  ) {}

  async markLectureViewed(
    userId: string,
    courseId: string,
    lectureId: string,
  ): Promise<CourseProgress> {
    // Verify enrollment
    const isEnrolled = await this.enrollmentService.isEnrolled(
      userId,
      courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('User is not enrolled in this course');
    }

    const progress = await this.progressModel.findOneAndUpdate(
      {
        user: userId,
        course: courseId,
        lecture: lectureId,
      },
      {
        $set: { viewed: true, viewedDate: new Date() },
        $setOnInsert: {
          user: userId,
          course: courseId,
          lecture: lectureId,
        },
      },
      { upsert: true, new: true },
    );

    return this.progressModel
      .findById(progress._id)
      .populate(['user', 'course', 'lecture'])
      .exec() as Promise<CourseProgress>;
  }

  async markLectureCompleted(
    userId: string,
    courseId: string,
    lectureId: string,
  ): Promise<CourseProgress> {
    const isEnrolled = await this.enrollmentService.isEnrolled(
      userId,
      courseId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException('User is not enrolled in this course');
    }

    const progress = await this.progressModel.findOneAndUpdate(
      {
        user: userId,
        course: courseId,
        lecture: lectureId,
      },
      {
        $set: {
          viewed: true,
          viewedDate: new Date(),
          completed: true,
          completedDate: new Date(),
        },
        $setOnInsert: {
          user: userId,
          course: courseId,
          lecture: lectureId,
        },
      },
      { upsert: true, new: true },
    );

    return this.progressModel
      .findById(progress._id)
      .populate(['user', 'course', 'lecture'])
      .exec() as Promise<CourseProgress>;
  }

  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgress[]> {
    return this.progressModel
      .find({ user: userId, course: courseId })
      .populate(['user', 'course', 'lecture'])
      .exec();
  }

  async getCourseCompletionPercentage(
    userId: string,
    courseId: string,
    totalLectures: number,
  ): Promise<number> {
    if (totalLectures === 0) return 0;
    const completedCount = await this.progressModel.countDocuments({
      user: userId,
      course: courseId,
      completed: true,
    });
    return Math.round((completedCount / totalLectures) * 100);
  }

  async getUserCourseStatus(
    userId: string,
    courseId: string,
  ): Promise<CourseStatusInfo> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const totalLectures = course.lectures ? course.lectures.length : 0;

    const viewedCount = await this.progressModel.countDocuments({
      user: userId,
      course: courseId,
      viewed: true,
    });

    const completedCount = await this.progressModel.countDocuments({
      user: userId,
      course: courseId,
      completed: true,
    });

    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    if (totalLectures > 0 && completedCount >= totalLectures) {
      status = 'completed';
    } else if (viewedCount > 0 || completedCount > 0) {
      status = 'in_progress';
    }

    const percentage =
      totalLectures > 0
        ? Math.round((completedCount / totalLectures) * 100)
        : 0;

    return {
      courseId,
      status,
      percentage,
      viewedCount,
      completedCount,
      totalLectures,
    };
  }

  async getAllCoursesStatus(userId: string): Promise<CourseStatusInfo[]> {
    const enrollments = await this.enrollmentService.findByUser(userId);
    const statuses: CourseStatusInfo[] = [];

    for (const enrollment of enrollments) {
      // enrollment.course can be a populated object or an ObjectId
      const courseObj = enrollment.course as
        | { _id: { toString(): string } }
        | { toString(): string };
      const courseId =
        '_id' in courseObj ? courseObj._id.toString() : courseObj.toString();

      const statusInfo = await this.getUserCourseStatus(userId, courseId);
      statuses.push(statusInfo);
    }

    return statuses;
  }

  async initializeCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<void> {
    // Get the course with all lectures
    const course = await this.courseModel.findById(courseId).exec();
    if (!course || !course.lectures || course.lectures.length === 0) {
      return; // No lectures to initialize
    }

    // Check if progress records already exist for this user-course
    const existingCount = await this.progressModel.countDocuments({
      user: userId,
      course: courseId,
    });

    if (existingCount > 0) {
      return; // Already initialized
    }

    // Create progress records for all lectures
    const progressRecords = course.lectures.map((lectureId) => ({
      user: userId,
      course: courseId,
      lecture: lectureId,
      viewed: false,
      viewedDate: null,
      completed: false,
      completedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (progressRecords.length > 0) {
      await this.progressModel.insertMany(progressRecords, { ordered: false });
    }
  }
}
