import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FlowService } from './flow.service';
import { FlowController } from './flow.controller';
import { Flow } from 'sequelize/models/flows';

@Module({
  imports: [SequelizeModule.forFeature([Flow])],
  providers: [FlowService],
  controllers: [FlowController],
})
export class FlowModule {}
