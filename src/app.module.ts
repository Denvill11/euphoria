import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'sequelize/models/user';
import { CustomJwtModule } from './custom-jwt/custom-jwt.module';
import { Tour } from 'sequelize/models/tour';
import { UserModule } from './user/user.module';
import { TourCategory } from 'sequelize/models/tour-category';
import { Category } from 'sequelize/models/category';
import { AdminModule } from './admin-panel/admin.module';
import { OrganizationApplication } from 'sequelize/models/organizationApplications';
import { ApplicationModule } from './application/application.module';
import { Flow } from 'sequelize/models/flows';
import { Booking } from 'sequelize/models/booking';
import { TourModule } from './tour/tour.module';
import { CategoryModule } from './category/category.module';
import { FlowModule } from './flow/flow.module';
import { BookingModule } from './booking/booking.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from './mailer/mailer.module';
import { FoodCategoryModule } from './food-category/food-category.module';
import { TourFoodCategory } from 'sequelize/models/tours-food_categories';
import { FoodCategory } from 'sequelize/models/food_categories';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
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
      logging: false,
      models: [
        User,
        Tour,
        TourCategory,
        Category,
        OrganizationApplication,
        Booking,
        Flow,
        TourFoodCategory,
        FoodCategory,
      ],
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        ttl: 120000,
      }),
      isGlobal: true,
    }),
    CustomJwtModule,
    AuthModule,
    UserModule,
    AdminModule,
    ApplicationModule,
    TourModule,
    CategoryModule,
    FlowModule,
    BookingModule,
    MailerModule,
    FoodCategoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
