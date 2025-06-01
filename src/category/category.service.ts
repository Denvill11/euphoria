import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from 'sequelize/models/category';
import { CreateCategoryDTO } from './dto/createCategoryDTO';
import { UpdateCategoryDTO } from './dto/updateCategoryDTO';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private readonly categoryRepo: typeof Category,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDTO,
    file: Express.Multer.File,
  ): Promise<Category> {
    const newCategory = {
      ...createCategoryDto,
      iconPath: file.path,
    };
    const category = await this.categoryRepo.create(newCategory as Category);
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepo.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDTO,
    file: Express.Multer.File,
  ): Promise<Category> {
    const category = await this.categoryRepo.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (file.path) {
      updateCategoryDto.iconPath = file.path;
    }

    await category.update(updateCategoryDto);
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepo.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await category.destroy();
  }
}
