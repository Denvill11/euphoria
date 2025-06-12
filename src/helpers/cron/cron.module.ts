import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { Flow } from 'sequelize/models/flows';
import { ExpiredFlowsService } from './expired-flows.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forFeature([Flow]),
  ],
  providers: [ExpiredFlowsService],
})
export class CronModule {} 