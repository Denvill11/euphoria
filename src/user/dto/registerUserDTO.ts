import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { Errors } from '../../../constants/errorMessages'
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly surname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: Errors.smallPassword })
  @Transform(({ value }) => value.trim())
  readonly password: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly patronymic?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly avatarPath?: string;

  @ApiProperty()
  @IsBoolean()
  isAdmin?: boolean;
}