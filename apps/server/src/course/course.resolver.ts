import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CourseService } from './course.service';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { QueryArgs } from 'src/utils/queryInput.dt';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';

export interface GraphqlContext {
  req: {
    user: {
      userId: string;
      role?: string;
    };
  };
}

@Resolver(() => CourseEntity)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Instructor)
  @Mutation(() => CourseEntity, { description: 'Create a new course' })
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
    @Context() context: GraphqlContext,
  ): Promise<CourseEntity> {
    const { userId } = context.req.user;

    return this.courseService.create(createCourseInput, userId);
  }

  @Query(() => [CourseEntity], {
    name: 'courses',
    description: 'Get all courses',
  })
  async findAll(
    @Args('queryReq', { nullable: true }) queryReq: QueryArgs,
  ): Promise<CourseEntity[]> {
    return this.courseService.findAll(queryReq || {});
  }

  @Query(() => CourseEntity, {
    name: 'course',
    description: 'Get course by ID',
  })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CourseEntity> {
    return this.courseService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Instructor)
  @Query(() => [CourseEntity], {
    name: 'coursesByInstructor',
    description: 'Get courses by instructor ID from context',
  })
  async findByInstructor(
    @Context() context: GraphqlContext,
  ): Promise<CourseEntity[]> {
    const { userId, role } = context.req.user;
    if (role === UserRole.Admin) {
      return this.courseService.findAll({});
    }
    return this.courseService.findByInstructor(userId);
  }

  @Roles(UserRole.Admin, UserRole.Instructor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CourseEntity, { description: 'Update course' })
  async updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @Context() context: GraphqlContext,
  ): Promise<CourseEntity> {
    const { userId, role } = context.req.user;
    return this.courseService.update(
      updateCourseInput._id,
      updateCourseInput,
      userId,
      role,
    );
  }

  @Roles(UserRole.Admin, UserRole.Instructor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CourseEntity, { description: 'Delete course' })
  async removeCourse(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GraphqlContext,
  ): Promise<CourseEntity> {
    const { userId, role } = context.req.user;
    return this.courseService.remove(id, userId, role);
  }
}
