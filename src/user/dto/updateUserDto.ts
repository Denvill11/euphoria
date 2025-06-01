import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePersonalInfoDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  surname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  patronymic?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  avatarPath?: string;
}
