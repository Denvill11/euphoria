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
import { Transform } from 'class-transformer';

class FlowDTO {
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty()
  @Type(() => Number)
  participant: number;

  @ApiProperty({ required: false })
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
  @Transform(({ value }) => {
    if (typeof value === 'number') return [value];
    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isNaN(num) ? value : [num];
    }
    return value;
  })
  categoryIds: number[];

  @ApiProperty({
    type: [FlowDTO],
    description: 'Потоки тура'
  })
  @Transform(({ value }) => {
    
    // Для multipart/form-data все приходит как строка
    if (typeof value === 'string') {
      try {
        // Пробуем распарсить JSON строку
        const parsed = JSON.parse(value);
        
        // Преобразуем данные в правильный формат
        const transformFlow = (flow) => {
          const result = {
            startDate: new Date(flow.startDate),
            endDate: new Date(flow.endDate),
            participant: Number(flow.participant),
            currentPrice: flow.currentPrice ? Number(flow.currentPrice) : undefined
          };
          return result;
        };
        
        if (Array.isArray(parsed)) {
          const result = parsed.map(transformFlow);
          return result;
        }
        if (typeof parsed === 'object' && parsed !== null) {
          const result = [transformFlow(parsed)];
          return result;
        }
      } catch (e) {
        console.error('Error parsing flows:', e);
        return [];
      }
    }
    return [];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowDTO)
  flows: FlowDTO[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      format: 'binary'
    },
    description: 'Фотографии тура (максимум 10 файлов, формат: jpg, png)',
    required: false
  })
  photos?: Express.Multer.File[];
}
