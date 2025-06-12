import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FoodCategory } from 'sequelize/models/food_categories';
import { CreateFoodCategoryDto } from './dto/createFoodCategoryDto';
import { UpdateFoodCategoryDto } from './dto/updateFoodCategoryDto';
import { Errors } from 'src/helpers/constants/errorMessages';

@Injectable()
export class FoodCategoryService {
  constructor(
    @InjectModel(FoodCategory) private readonly foodData: typeof FoodCategory,
  ) {}

  async getFoodCategories(params: {
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { search = '', limit = 10, offset = 0 } = params;

    const queryOptions: any = {
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      order: [['name', 'ASC']],
      limit,
      offset,
    };

    const { rows, count } = await this.foodData.findAndCountAll(queryOptions);

    return {
      data: rows,
      total: count,
      limit,
      offset,
    };
  }

  async getFoodCategoryById(id: number): Promise<FoodCategory> {
    const category = await this.foodData.findByPk(id);
    if (!category) {
      throw new NotFoundException(Errors.foodCategoryNotFound);
    }
    return category;
  }

  async createFoodCategory(
    createFoodCategoryDto: CreateFoodCategoryDto,
    file: Express.Multer.File,
  ): Promise<FoodCategory> {
    const { name, description } = createFoodCategoryDto;
    return await this.foodData.create({
      name,
      description,
      imagePath: file.path,
    } as FoodCategory);
  }

  async updateFoodCategory(
    id: number,
    updateFoodCategoryDto: UpdateFoodCategoryDto,
    file?: Express.Multer.File,
  ): Promise<FoodCategory> {
    const category = await this.getFoodCategoryById(id);
    
    const { name, description } = updateFoodCategoryDto;
    const updateData: Partial<FoodCategory> = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (file) updateData.imagePath = file.path;

    await category.update(updateData);
    return category;
  }

  async deleteFoodCategory(id: number): Promise<void> {
    const category = await this.getFoodCategoryById(id);
    await category.destroy();
  }
}
