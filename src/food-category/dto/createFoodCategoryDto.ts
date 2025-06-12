import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFoodCategoryDto {
  @ApiProperty({
    description: 'Название категории еды',
    example: 'Вегетарианская'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание категории еды',
    example: 'Блюда, не содержащие продуктов животного происхождения'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Изображение категории еды'
  })
  image: Express.Multer.File;
} 