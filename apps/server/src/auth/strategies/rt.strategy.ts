import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthJwtPayload } from '../types/auth.jwt.payload';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
          }
          return authHeader.replace('Bearer ', '').trim();
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // Verification in strategy requires the token itself to be passed
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const authorization = req.get('authorization');
    if (!authorization)
      throw new UnauthorizedException('Refresh token malformed');

    const refreshToken = authorization.replace('Bearer', '').trim();

    if (!refreshToken)
      throw new UnauthorizedException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
