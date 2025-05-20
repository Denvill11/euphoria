import {
  BeforeCreate,
  Column,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

import { Tour } from './tour';
import { OrganizationApplication } from './organizationApplications';
import { Booking } from './booking';
import { decrypt, encrypt } from 'src/helpers/utils/encript';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
}

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({ allowNull: false, unique: true })
  email: string;

  @Column({
    allowNull: false,
    get(this: User) {
      const value = this.getDataValue('name');
      return value ? decrypt(value) : null;
    },
    set(this: User, value: string) {
      this.setDataValue('name', encrypt(value));
    },
  })
  name: string;

  @Column({
    allowNull: false,
    get(this: User) {
      const value = this.getDataValue('surname');
      return value ? decrypt(value) : null;
    },
    set(this: User, value: string) {
      this.setDataValue('surname', encrypt(value));
    },
  })
  surname: string;

  @Column({
    allowNull: true,
    get(this: User) {
      const value = this.getDataValue('patronymic');
      return value ? decrypt(value) : null;
    },
    set(this: User, value: string) {
      this.setDataValue('patronymic', encrypt(value));
    },
  })
  patronymic: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ allowNull: true })
  avatarPath: string;

  @Column({ allowNull: false, defaultValue: 'user', type: 'user_role' })
  role: UserRole;

  @BeforeCreate
  static async hashPassword(user: User) {
    user.dataValues.password = await bcrypt.hash(
      user.dataValues.password,
      Number(process.env.SALT_ROUNDS),
    );
  }

  @HasMany(() => Tour)
  tours: Tour[];

  @HasOne(() => OrganizationApplication)
  organizationApplication: OrganizationApplication;

  @HasMany(() => Booking)
  bookings: Booking[];
}
