import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user';
import { Category } from './category';
import { TourCategory } from './tour-category';
import { Flow } from './flows';
import { FoodCategory } from './food_categories';
import { TourFoodCategory } from './tours-food_categories';

@Table({ tableName: 'tours' })
export class Tour extends Model<Tour> {
  @Column({ allowNull: false })
  title: string;

  @Column({ allowNull: false })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  photos: string[];

  @Column({ allowNull: false })
  isAccommodation: boolean;

  @Column({ allowNull: false })
  address: string;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  authorId: number;

  @Column({ allowNull: false, validate: { min: 1 } })
  duration: number;

  @Column({ allowNull: false })
  city: string;

  @Column({
    allowNull: false,
    defaultValue: false,
  })
  isActive: boolean;

  @BelongsTo(() => User)
  author: User;

  @BelongsToMany(() => Category, () => TourCategory)
  categories: Category[];

  @HasMany(() => Flow)
  flows: Flow[];

  @BelongsToMany(() => FoodCategory, () => TourFoodCategory)
  foodCategories: FoodCategory[];
}
