import {  
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Tour } from './tour';
import { TourFoodCategory } from './tours-food_categories';

@Table({ tableName: 'food_categories' })
export class FoodCategory extends Model<FoodCategory> {
  @Column({ 
      type: DataType.STRING(80), 
      allowNull: false,
    })
    name: string;

    @Column({
      type: DataType.STRING(250),
      allowNull: false,
    })
    description: string;

    @Column({
      type: DataType.STRING(45),
      allowNull: false
    })
    imagePath: string;

    @BelongsToMany(() => Tour, () => TourFoodCategory)
    tours: Tour[];
}
