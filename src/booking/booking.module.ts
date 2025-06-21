import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Flow } from 'sequelize/models/flows';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from 'sequelize/models/booking';
import { User } from 'sequelize/models/user';
import { Tour } from 'sequelize/models/tour';
import { Category } from 'sequelize/models/category';
import { FoodCategory } from 'sequelize/models/food_categories';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [SequelizeModule.forFeature([Flow, Booking, User, Tour, Category, FoodCategory])],
})
export class BookingModule {}
