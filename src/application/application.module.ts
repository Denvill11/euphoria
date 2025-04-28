import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationApplication } from 'sequelize/models/organizationApplications';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { User } from 'sequelize/models/user';

@Module({
  imports: [
    SequelizeModule.forFeature([
      OrganizationApplication, User
    ])
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})

export class ApplicationModule {}
