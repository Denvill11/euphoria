import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationApplication } from 'sequelize/models/organizationApplications';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';


@Module({
  imports: [
    SequelizeModule.forFeature([
      OrganizationApplication,
    ])
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})

export class ApplicationModule {}
