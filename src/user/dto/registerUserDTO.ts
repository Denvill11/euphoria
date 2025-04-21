import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { Errors } from '../../../constants/errorMessages'

export class RegisterUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: Errors.smallPassword })
  @Transform(({ value }) => value.trim())
  readonly password: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  readonly patronymic?: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  readonly avatarPath?: string;

  @IsBoolean()
  isAdmin?: boolean;
}