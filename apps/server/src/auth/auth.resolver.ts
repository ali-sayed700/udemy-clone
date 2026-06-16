import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { User } from 'src/user/entities/user.entity';
import { AuthPayload } from './entity/auth-payload';
import { SignInValid } from './dto/signInValid.dto';
import { UseGuards } from '@nestjs/common';
// import { RtGuard } from './guards/rt.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

interface RtRequest extends Request {
  user: {
    sub: { userId: string };
    refreshToken: string;
  };
}

interface JwtRequest extends Request {
  user: {
    userId: string;
  };
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, { description: 'Create a new user' })
  @Throttle({ default: { ttl: 30000, limit: 5 } })
  async Signup(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.authService.signUp(createUserInput);
  }

  @Mutation(() => AuthPayload, { description: 'Login a user' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async signIn(@Args('input') input: SignInValid) {
    const user = await this.authService.validateLocalUser(input);

    return await this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => AuthPayload, { description: 'Refresh access token' })
  async refreshToken(@Context() context: { req: RtRequest }) {
    const req = context.req;
    const userId = req.user.sub.userId;
    const rt = req.user.refreshToken;
    return this.authService.refreshToken(userId, rt);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Logout a user' })
  async logout(@Context() context: { req: JwtRequest }) {
    const req = context.req;
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }
}
