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
    const { search = '', limit, offset } = params;

    const queryOptions: any = {
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      order: [['name', 'ASC']],
    };

    // Добавляем limit и offset только если они определены и являются числами
    if (typeof limit === 'number' && !isNaN(limit)) {
      queryOptions.limit = limit;
    }

    if (typeof offset === 'number' && !isNaN(offset)) {
      queryOptions.offset = offset;
    }

    const { rows, count } = await this.foodData.findAndCountAll(queryOptions);

    return {
      data: rows,
      total: count,
      limit: queryOptions.limit || null,
      offset: queryOptions.offset || 0,
    };
  }
}
