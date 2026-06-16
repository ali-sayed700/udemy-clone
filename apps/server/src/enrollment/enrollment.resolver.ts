import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ObjectType, Field } from '@nestjs/graphql';
import { CourseIdArgs } from '../shared/dto/course-id.args';
import { EnrollInCourseArgs } from './dto/enroll-in-course.args';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

export interface GraphqlContext {
  req: {
    user: {
      userId: string;
      role?: string;
    };
  };
}

@ObjectType()
class IsEnrolledResponse {
  @Field()
  enrolled: boolean;
}

@Resolver(() => Enrollment)
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Enrollment, {
    description: 'Enroll in a course after payment',
  })
  async enrollInCourse(
    @Args() { courseId, paymentMethod, paymentId, amount }: EnrollInCourseArgs,
    @Context() context: GraphqlContext,
  ): Promise<Enrollment> {
    const { userId } = context.req.user;
    return this.enrollmentService.enroll(
      userId,
      courseId,
      paymentMethod,
      paymentId,
      amount,
    );
  }

  @Roles(UserRole.Admin, UserRole.Instructor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [Enrollment], {
    name: 'myEnrollments',
    description: 'Get courses the current user is enrolled in',
  })
  async myEnrollments(
    @Context() context: GraphqlContext,
  ): Promise<Enrollment[]> {
    const { userId } = context.req.user;
    return this.enrollmentService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Enrollment], {
    name: 'courseEnrollments',
    description: 'Get students enrolled in a specific course',
  })
  async courseEnrollments(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ): Promise<Enrollment[]> {
    const { userId, role } = context.req.user;
    return this.enrollmentService.findByCourseForUser(courseId, userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => IsEnrolledResponse, {
    name: 'isEnrolled',
    description: 'Check if current user is enrolled in a course',
  })
  async isEnrolled(
    @Args() { courseId }: CourseIdArgs,
    @Context() context: GraphqlContext,
  ): Promise<IsEnrolledResponse> {
    const { userId } = context.req.user;
    const enrolled = await this.enrollmentService.isEnrolled(userId, courseId);
    return { enrolled };
  }
}
