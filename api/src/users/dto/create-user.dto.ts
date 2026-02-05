import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class CreateUserDto {
  @IsOptional()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
