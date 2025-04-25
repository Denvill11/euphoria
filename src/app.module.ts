import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'sequelize/models/user';
import { CustomJwtModule } from './custom-jwt/custom-jwt.module';
import { Tour } from 'sequelize/models/tour';
import { UserModule } from './user/user.module';
import { TourCategory } from 'sequelize/models/tour-category';
import { Category } from 'sequelize/models/category';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      models: [User, Tour, TourCategory, Category],
    }),
    CustomJwtModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
