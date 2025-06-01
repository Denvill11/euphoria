import { Module } from '@nestjs/common';
import { FoodCategoryController } from './food-category.controller';
import { FoodCategoryService } from './food-category.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { FoodCategory } from 'sequelize/models/food_categories';

@Module({
  controllers: [FoodCategoryController],
  providers: [FoodCategoryService],
  imports: [SequelizeModule.forFeature([FoodCategory])],
})
export class FoodCategoryModule {}
