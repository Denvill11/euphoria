import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards } from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Admin } from 'src/guards/admin.guard';
import { ImageUpload } from 'src/decorators/image-upload.decorator';
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
  @ImageUpload({ singleFile: true, fieldName: 'category' })
  @Post()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
) {
    return this.categoryService.createCategory(createCategoryDto, file);
  }

  @ApiBearerAuth()
  @ImageUpload({ singleFile: true, fieldName: 'category' })
  @Patch(':id')
  @UseGuards(Admin)
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
