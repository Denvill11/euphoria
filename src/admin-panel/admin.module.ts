import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from 'sequelize/models/user';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
    ])
  ],
  controllers: [AdminController],
  providers: [AdminService],
})

export class AdminModule {}
