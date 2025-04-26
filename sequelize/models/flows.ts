import { 
  Table, 
  Column, 
  Model, 
  ForeignKey, 
  BelongsTo, 
  DataType 
} from 'sequelize-typescript';
import { Tour } from './tour';

@Table({ tableName: 'flows' })
export class Flow extends Model<Flow> {
  @Column({ 
    type: DataType.DATE, 
    allowNull: false 
  })
  startDate: Date;

  @Column({ 
    type: DataType.DATE, 
    allowNull: false 
  })
  endDate: Date;

  @ForeignKey(() => Tour)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false 
  })
  tourId: number;

  @BelongsTo(() => Tour)
  tour: Tour;

  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false 
  })
  participant: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    validate: { min: 0 },
  })
  currentPrice: number;
}
