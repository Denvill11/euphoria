import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user';

@Table
export class Tour extends Model<Tour> {
  @Column({ allowNull: false})
  title: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ 
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false 
  })
  photos: string[];

  @Column({ allowNull: false })
  isAccommodation: boolean;

  @Column({allowNull: false })
  address: string;
  
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  authorId: number;

  @BelongsTo(() => User)
  author: User;
}