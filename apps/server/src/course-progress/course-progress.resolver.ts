import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CourseProgressService } from './course-progress.service';
import { CourseProgress } from './entities/course-progress.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CourseLectureArgs } from '../shared/dto/course-lecture.args';
import { CourseIdArgs } from '../shared/dto/course-id.args';
import { CourseCompletionStatsArgs } from './dto/course-completion-stats.args';

export interface GraphqlContext {
  req: {
    user: {
      userId: string;
      role?: string;
    };
  };
}

@ObjectType()
class CompletionStats {
  @Field(() => Int)
  percentage: number;
}

@ObjectType()
class CourseStatusResponse {
  @Field()
  courseId: string;

  @Field()
  status: string;

  @Field(() => Int)
  percentage: number;

  @Field(() => Int)
  viewedCount: number;

  @Field(() => Int)
  completedCount: number;

  @Field(() => Int)
  totalLectures: number;
}

@Resolver(() => CourseProgress)
export class CourseProgressResolver {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CourseProgress, {
    description: 'Mark a lecture as viewed',
  })
  async markLectureViewed(
    @Args() { courseId, lectureId }: CourseLectureArgs,
    @Context() context: GraphqlContext,
  ): Promise<CourseProgress> {
    const { userId } = context.req.user;
    return this.courseProgressService.markLectureViewed(
      userId,
      courseId,
      lectureId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CourseProgress, {
    description: 'Mark a lecture as completed',
  })
  async markLectureCompleted(
    @Args() { courseId, lectureId }: CourseLectureArgs,
    @Context() context: GraphqlContext,
  ): Promise<CourseProgress> {
    const { userId } = context.req.user;
    return this.courseProgressService.markLectureCompleted(
      userId,
      courseId,
      lectureId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [CourseProgress], {
    name: 'myCourseProgress',
    description: 'Get progress for a specific course',
  })
  async myCourseProgress(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ): Promise<CourseProgress[]> {
    const { userId } = context.req.user;
    return this.courseProgressService.getCourseProgress(userId, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => CompletionStats, {
    name: 'courseCompletionStats',
    description: 'Get completion percentage for a course',
  })
  async courseCompletionStats(
    @Args() { courseId, totalLectures }: CourseCompletionStatsArgs,
    @Context() context: GraphqlContext,
  ): Promise<CompletionStats> {
    const { userId } = context.req.user;
    const percentage =
      await this.courseProgressService.getCourseCompletionPercentage(
        userId,
        courseId,
        totalLectures,
      );
    return { percentage };
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => CourseStatusResponse, {
    name: 'courseStatus',
    description:
      'Get overall course status (not_started, in_progress, completed)',
  })
  async courseStatus(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ): Promise<CourseStatusResponse> {
    const { userId } = context.req.user;
    return this.courseProgressService.getUserCourseStatus(userId, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [CourseStatusResponse], {
    name: 'allMyCoursesStatus',
    description: 'Get status for all enrolled courses',
  })
  async allMyCoursesStatus(
    @Context() context: GraphqlContext,
  ): Promise<CourseStatusResponse[]> {
    const { userId } = context.req.user;
    return this.courseProgressService.getAllCoursesStatus(userId);
  }
}
