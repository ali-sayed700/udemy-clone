// import { Types } from 'mongoose';
import { UserRole } from '../../user/entities/user.entity';

export type JwtUser = {
  userId: string;
  role: UserRole;
  userName: string;
  avatar: string | undefined;
};
