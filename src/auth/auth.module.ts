import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'sequelize/models/user';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
    ]),
    MailerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
