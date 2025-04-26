import {
  Column,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { User } from './user';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  LIQUIDATING = 'liquidating',
  LIQUIDATED = 'liquidated',
  BANKRUPT = 'bankrupt',
  REORGANIZING = 'reorganizing',
  PENDING = 'pending'
}

@Table({ tableName: 'organization_applications' })
export class OrganizationApplication extends Model<OrganizationApplication> {
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({ allowNull: true })
  organizationName: string;

  @Column({ allowNull: false })
  innOrOgrn: string;

  @Column({ allowNull: false, defaultValue: OrganizationStatus.PENDING })
  organizationStatus: OrganizationStatus;

  @Column({ allowNull: false, defaultValue: ApplicationStatus.PENDING })
  adminApprove: ApplicationStatus;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  })
  autoApproval: boolean | null
}
