import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tour } from 'sequelize/models/tour';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Tour,
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
