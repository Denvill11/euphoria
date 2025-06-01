import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tour } from 'sequelize/models/tour';
import { Flow } from 'sequelize/models/flows';

@Module({
  controllers: [TourController],
  providers: [TourService],
  imports: [SequelizeModule.forFeature([Tour, Flow])],
})
export class TourModule {}
