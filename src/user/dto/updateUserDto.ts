import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePersonalInfoDTO {
  @ApiPropertyOptional({ description: 'Email пользователя' })
  @IsOptional()
  @IsEmail(undefined, { message: 'Некорректный формат email' })
  @IsString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.trim();
  })
  email?: string;

  @ApiPropertyOptional({ description: 'Имя пользователя' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  name?: string;

  @ApiPropertyOptional({ description: 'Фамилия пользователя' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  surname?: string;

  @ApiPropertyOptional({ description: 'Отчество пользователя' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  patronymic?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Файл аватара пользователя',
    name: 'avatar',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim().replace(/^['"]|['"]$/g, ''))
  avatarPath?: string;
}
