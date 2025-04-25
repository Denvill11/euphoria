import {
  BeforeCreate,
  Column,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

import { Tour } from './tour';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
}

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({ allowNull: false, unique: true})
  email: string;

  @Column({ allowNull: false, unique: true })
  name: string;

  @Column({ allowNull: false })
  surname: string;

  @Column({ allowNull: true })
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
}