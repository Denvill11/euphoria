import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { Errors } from '../../constants/errorMessages'
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  surname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: Errors.smallPassword })
  @Transform(({ value }) => value.trim())
  password: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  patronymic?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  avatarPath?: string;
}