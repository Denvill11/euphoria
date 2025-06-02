import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDTO {
  @ApiProperty({
    description: 'Название категории',
    example: 'Морская кухня',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Описание категории',
    example: 'Блюда из морепродуктов и рыбы',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'Иконка категории',
    required: false,
    name: 'category'
  })
  @IsString()
  @IsOptional()
  iconPath?: string;
}
