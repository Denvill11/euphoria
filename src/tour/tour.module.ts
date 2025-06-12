import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tour } from 'sequelize/models/tour';
import { Flow } from 'sequelize/models/flows';
import { User } from 'sequelize/models/user';
import { FoodCategory } from 'sequelize/models/food_categories';

@Module({
  controllers: [TourController],
  providers: [TourService],
  imports: [SequelizeModule.forFeature([Tour, Flow, User, FoodCategory])],
})
export class TourModule {}
