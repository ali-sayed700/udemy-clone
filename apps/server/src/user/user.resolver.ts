import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // @Mutation(() => User, { description: 'Create a new user' })
  // async createUser(
  //   @Args('createUserInput') createUserInput: CreateUserInput,
  // ): Promise<User> {
  //   return this.userService.create(createUserInput);
  // }

  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [User], { name: 'users', description: 'Get all users' })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Roles(UserRole.Instructor, UserRole.Admin, UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => User, { name: 'user', description: 'Get user by ID' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: { req: { user: { userId: string; role?: string } } },
  ): Promise<User> {
    const { userId, role } = context.req.user;
    return this.userService.findOneForUser(id, userId, role);
  }

  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => User, { name: 'userByEmail', description: 'Get user by email' })
  async findByEmail(@Args('email') email: string): Promise<User> {
    return this.userService.findByEmail(email);
  }

  @Roles(UserRole.Instructor, UserRole.Admin, UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => User, { description: 'Update user' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @Context() context: { req: { user: { userId: string; role?: string } } },
  ): Promise<User> {
    const { userId, role } = context.req.user;
    return this.userService.updateForUser(
      updateUserInput._id,
      updateUserInput,
      userId,
      role,
    );
  }

  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => User, { description: 'Delete user' })
  async removeUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.remove(id);
  }
}
