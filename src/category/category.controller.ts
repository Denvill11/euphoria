import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Admin } from 'src/helpers/guards/admin.guard';
import { ImageUpload } from 'src/helpers/decorators/image-upload.decorator';
import { CreateCategoryDTO } from './dto/createCategoryDTO';
import { UpdateCategoryDTO } from './dto/updateCategoryDTO';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @ApiBearerAuth()
  @UseGuards(Admin)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ImageUpload({ singleFile: true, fieldName: 'category' })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.createCategory(createCategoryDto, file);
  }

  @ApiBearerAuth()
  @UseGuards(Admin)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ImageUpload({ singleFile: true, fieldName: 'category' })
  async updateCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto, file);
  }

  @ApiBearerAuth()
  @UseGuards(Admin)
  @Delete(':id')
  async deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
