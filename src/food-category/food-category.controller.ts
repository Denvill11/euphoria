import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FoodCategoryService } from './food-category.service';
import { CreateFoodCategoryDto } from './dto/createFoodCategoryDto';
import { UpdateFoodCategoryDto } from './dto/updateFoodCategoryDto';
import { Admin } from 'src/helpers/guards/admin.guard';
import { ImageUpload } from 'src/helpers/decorators/image-upload.decorator';

@ApiTags('food-categories')
@Controller('food-categories')
export class FoodCategoryController {
  constructor(private readonly foodCategoriesService: FoodCategoryService) {}

  @ApiOperation({ summary: 'Получить список категорий еды' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество записей на странице' })
  @ApiQuery({ name: 'offset', required: false, description: 'Смещение от начала списка' })
  @Get()
  async getFoodCategories(
    @Query('search') search?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.foodCategoriesService.getFoodCategories({
      search,
      limit,
      offset,
    });
  }

  @ApiOperation({ summary: 'Получить категорию еды по ID' })
  @Get(':id')
  async getFoodCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.foodCategoriesService.getFoodCategoryById(id);
  }

  @ApiOperation({ summary: 'Создать новую категорию еды (только для администраторов)' })
  @ApiBearerAuth()
  @UseGuards(Admin)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ImageUpload({ singleFile: true, fieldName: 'image' })
  async createFoodCategory(
    @Body() createFoodCategoryDto: CreateFoodCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.foodCategoriesService.createFoodCategory(createFoodCategoryDto, file);
  }

  @ApiOperation({ summary: 'Обновить категорию еды (только для администраторов)' })
  @ApiBearerAuth()
  @UseGuards(Admin)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ImageUpload({ singleFile: true, fieldName: 'image' })
  async updateFoodCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFoodCategoryDto: UpdateFoodCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.foodCategoriesService.updateFoodCategory(
      id,
      updateFoodCategoryDto,
      file,
    );
  }

  @ApiOperation({ summary: 'Удалить категорию еды (только для администраторов)' })
  @ApiBearerAuth()
  @UseGuards(Admin)
  @Delete(':id')
  async deleteFoodCategory(@Param('id', ParseIntPipe) id: number) {
    return this.foodCategoriesService.deleteFoodCategory(id);
  }
}
