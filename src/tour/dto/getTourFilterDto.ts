import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsNumber, IsDate, IsArray } from 'class-validator';

export class GetTourFilterDto {
  @ApiPropertyOptional({ description: 'Номер страницы', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество элементов на странице', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Поиск по названию тура', example: 'Горный тур' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Фильтр по наличию проживания' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAccommodation?: boolean;

  @ApiPropertyOptional({ 
    description: 'ID категорий тура',
    example: '1,2,3',
    type: [Number]
  })
  @IsOptional()
  @Transform(({ value }) => value ? value.split(',').map(Number) : undefined)
  @IsArray()
  categoryIds?: number[];

  @ApiPropertyOptional({ 
    description: 'ID категорий еды',
    example: '1,2,3',
    type: [Number]
  })
  @IsOptional()
  @Transform(({ value }) => value ? value.split(',').map(Number) : undefined)
  @IsArray()
  foodCategoryIds?: number[];

  @ApiPropertyOptional({ 
    description: 'Дата начала',
    example: '2024-03-01'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Дата окончания',
    example: '2024-03-31'
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Фильтр по городу', example: 'Москва' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Минимальная продолжительность (в днях)', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationFrom?: number;

  @ApiPropertyOptional({ description: 'Максимальная продолжительность (в днях)', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationTo?: number;

  @ApiPropertyOptional({ description: 'Показать только мои туры' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCreatedByMe?: boolean;
} 