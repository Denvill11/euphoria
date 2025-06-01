import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FoodCategory } from 'sequelize/models/food_categories';

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
}
