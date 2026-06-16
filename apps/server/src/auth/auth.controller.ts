import {
  Controller,
  Get,
  Request,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';

interface CustomAuthRequest extends ExpressRequest {
  user: {
    _doc: User;
  };
}

@Controller('api')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @SkipThrottle()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {
    // Guard redirects to Google
  }

  @SkipThrottle()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleLoginRedirect(
    @Request() req: CustomAuthRequest,
    @Res() res: Response,
  ) {
    this.logger.debug(
      `Google login redirect for user: ${req.user._doc.userName}`,
    );

    const userData = await this.authService.login(req.user._doc);
    this.logger.debug(
      `User data generated for Google login: ${userData.userId}`,
    );

    res.redirect(
      `http://localhost:3000/api/auth/google/redirect?userId=${userData.userId}&name=${userData.userName}&avatar=${userData.avatar}&accessToken=${userData.accessToken}&refreshToken=${userData.refreshToken}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  verify() {
    return 'ok';
  }
}
