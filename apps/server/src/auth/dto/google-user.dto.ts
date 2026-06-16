import { IsEmail, IsString, IsOptional } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  avatar?: string;
}
