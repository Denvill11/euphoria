import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { FoodCategory } from './food_categories';
import { Tour } from './tour';

@Table({ tableName: 'tour-food_categories', timestamps: false })
export class TourFoodCategory extends Model<TourFoodCategory> {
  @ForeignKey(() => Tour)
  @Column({ type: DataType.INTEGER })
  tourId: number;

  @ForeignKey(() => FoodCategory)
  @Column({ type: DataType.INTEGER })
  foodCategoryId: number;
}
