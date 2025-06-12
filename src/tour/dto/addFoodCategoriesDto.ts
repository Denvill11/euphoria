import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AddFoodCategoriesDto {
  @ApiProperty({
    description: 'Массив ID категорий еды',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  foodCategoryIds: number[];
} 