import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { SignInValid } from './dto/signInValid.dto';
import { AuthJwtPayload } from './types/auth.jwt.payload';
import { JwtUser } from './types/jwt.user';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserInput: CreateUserInput): Promise<User> {
    const { email, password } = createUserInput;

    // Check if user exists by email
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user

    const newUser = new this.userModel({
      ...createUserInput,
      password: hashedPassword,
      role: UserRole.Student,
    });

    return newUser.save();
  }
  async validateLocalUser({ email, password }: SignInValid) {
    const user = await this.userModel.findOne({ email });

    if (!user || !user.password) {
      throw new UnauthorizedException('password or email is incorrect');
    }

    const passwordMatched = bcrypt.compareSync(password, user.password);

    if (!passwordMatched)
      throw new UnauthorizedException('password or email is incorrect');

    return user;
  }

  async generateToken(userId: string) {
    const payload: AuthJwtPayload = {
      sub: {
        userId,
      },
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES',
      ) as `${number}d`,
    });
    return { accessToken, refreshToken };
  }

  async login(user: User) {
    this.logger.log(`User login: ${user.userName} (${user._id.toString()})`);

    const { accessToken, refreshToken } = await this.generateToken(
      user._id.toString(),
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, { hashedRefreshToken });

    return {
      userId: user._id.toString(),
      role: user.role,
      accessToken,
      refreshToken,
      userName: user.userName,
      avatar: user.avatar,
    };
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: null,
    });
    return true;
  }

  async refreshToken(userId: string, rt: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);
    if (!rtMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const { accessToken, refreshToken } = await this.generateToken(userId);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { hashedRefreshToken });

    return {
      userId: user._id.toString(),
      role: user.role,
      accessToken,
      refreshToken,
      userName: user.userName,
      avatar: user.avatar,
    };
  }

  // using in strategy
  async validateJwtUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const jwtUser: JwtUser = {
      userId: user._id.toString(),
      role: user.role,
      userName: user.userName,
      avatar: user.avatar,
    };
    return jwtUser;
  }

  // async validateGoogleUser(googleUser: GoogleUserDto): Promise<User> {
  //   const { email, firstName, lastName, picture, googleId, password } =
  //     googleUser;

  //   // Check if user exists by googleId
  //   let user = await this.userModel.findOne({ googleId });
  //   if (user) return user;

  //   // Check if user exists by email (to merge accounts)
  //   user = await this.userModel.findOne({ email });
  //   if (user) {
  //     if (!user.googleId) {
  //       user.googleId = googleId;
  //       await user.save();
  //     }
  //     return user;
  //   }

  //   // Create new user
  //   const newUser = new this.userModel({
  //     email,
  //     userName: `${firstName} ${lastName}`.trim(),
  //     role: 'student',
  //     googleId,
  //     avatar: picture,
  //     password,
  //   });

  //   return await newUser.save();
  // }

  async validateGoogleUser(googleUser: CreateUserInput) {
    this.logger.debug(`Validating Google user: ${googleUser.email}`);

    const user = await this.userModel.findOne({
      email: googleUser.email,
    });
    if (user) {
      const { ...authUser } = user;
      return authUser;
    }

    const dbUser = new this.userModel(googleUser);

    this.logger.debug(`Created new DB user for Google auth: ${dbUser.email}`);

    return await dbUser.save();
    // const user = await this.userModel.findOne({ email: googleUser.email });
    // if (user) return user;
    // return await this.userModel.create(googleUser);
  }
}
