import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Tour } from './tour';
import { Category } from './category';

@Table({ tableName: 'tour_categories', timestamps: false })
export class TourCategory extends Model<TourCategory> {
  @ForeignKey(() => Tour)
  @Column
  tourId: number;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;
}