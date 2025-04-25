import {
  BelongsToMany,
  Column,
  Model,
  Table,
} from 'sequelize-typescript';
import { Tour } from './tour';
import { TourCategory } from './tour-category';

@Table({ tableName: 'categories' })
export class Category extends Model<Category> {
  @Column({ allowNull: false})
  title: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false })
  iconPath: string;

  @BelongsToMany(() => Tour, () => TourCategory)
  tours: Tour[];
}