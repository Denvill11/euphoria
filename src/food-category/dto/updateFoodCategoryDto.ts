import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateFoodCategoryDto {
  @ApiProperty({
    description: 'Название категории еды',
    example: 'Вегетарианская',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Описание категории еды',
    example: 'Блюда, не содержащие продуктов животного происхождения',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Изображение категории еды',
    required: false
  })
  image?: Express.Multer.File;
} 