import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtUser } from '../types/jwt.user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext<{ req: { user: JwtUser } }>().req.user;

    if (!user) return false;
    if (user.role === UserRole.Admin) return true;

    const hasRequiredRoles = requiredRoles.some((role) => user.role === role);
    return hasRequiredRoles;
  }
}
