import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDTO {
  @ApiProperty({
    description: 'Название категории',
    example: 'Морская кухня',
    required: false
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Описание категории',
    example: 'Блюда из морепродуктов и рыбы',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

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
