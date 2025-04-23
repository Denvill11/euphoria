import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'sequelize/models/user';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
