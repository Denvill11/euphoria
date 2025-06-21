import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import { Flow } from './flows';

@Table({ tableName: 'bookings' })
export class Booking extends Model<Booking> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => Flow)
  @Column({ type: DataType.INTEGER })
  flowId: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false, validate: { min: 0 }})
  participant: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Flow)
  flow: Flow;
}
