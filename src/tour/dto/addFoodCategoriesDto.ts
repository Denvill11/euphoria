import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class AddFoodCategoriesDto {
  @ApiProperty({
    description: 'Массив ID категорий еды',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  foodCategoryIds: number[];
} 