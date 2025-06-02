import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsNotProfane } from 'src/helpers/pipes/isNotProfine';

class FlowDTO {
  @ApiProperty({
    description: 'Дата начала потока',
    example: '2024-04-01T10:00:00.000Z'
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'Дата окончания потока',
    example: '2024-04-03T18:00:00.000Z'
  })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'Количество участников',
    example: 10,
    minimum: 1
  })
  @Type(() => Number)
  participant: number;

  @ApiProperty({ 
    required: false,
    description: 'Текущая цена',
    example: 5000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentPrice?: number;
}

export class CreateTourDTO {
  @ApiProperty({
    description: 'Название тура',
    example: 'Гастрономический тур по Италии'
  })
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  title: string;

  @ApiProperty({
    description: 'Описание тура',
    example: 'Увлекательное путешествие по кухням Италии'
  })
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  description: string;

  @ApiProperty({
    description: 'Включает ли тур проживание',
    example: true
  })
  @Type(() => Boolean)
  isAccommodation: boolean;

  @ApiProperty({
    description: 'Адрес проведения тура',
    example: 'Via Roma, 1, Milan, Italy'
  })
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  address: string;

  @ApiProperty({
    description: 'Продолжительность тура в днях',
    example: 7,
    minimum: 1
  })
  @Type(() => Number)
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Город проведения тура',
    example: 'Milan',
    minLength: 3,
    maxLength: 25
  })
  @Type(() => String)
  @Length(3, 25)
  @IsNotProfane()
  city: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'ID категорий тура',
    example: [1, 2, 3]
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  categoryIds: number[];

  @ApiProperty({
    type: [FlowDTO],
    description: 'Потоки тура'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowDTO)
  flows: FlowDTO[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    },
    description: 'Фотографии тура',
    name: 'photos'
  })
  photos?: any[];
}
