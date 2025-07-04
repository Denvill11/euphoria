import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/helpers/guards/jwt-auth.guard';

import { ApplicationService } from './application.service';
import { User, userTokenData } from 'src/helpers/decorators/user-decorator';
import {
  ApplicationStatus,
  OrganizationStatus,
} from 'sequelize/models/organizationApplications';
import { Admin } from 'src/helpers/guards/admin.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('/:innOrOgrn')
  createApplication(
    @User() user: userTokenData,
    @Param('innOrOgrn') innOrOgrn: string,
  ) {
    return this.applicationService.createApplication(user.id, innOrOgrn);
  }

  @Get()
  @ApiQuery({
    name: 'organizationStatus',
    required: false,
    enum: OrganizationStatus,
  })
  @ApiQuery({ name: 'adminApprove', required: false, enum: ApplicationStatus })
  getAll(
    @User() user: userTokenData,
    @Query('organizationStatus') organizationStatus?: OrganizationStatus,
    @Query('adminApprove') adminApprove?: ApplicationStatus,
  ) {
    return this.applicationService.getAll(user, {
      organizationStatus,
      adminApprove,
    });
  }

  @UseGuards(Admin)
  @Patch('/:applicationId')
  approveOrRejectApplication(
    @Param('applicationId') applicationId: number,
    @Query('status') status: ApplicationStatus,
  ) {
    return this.applicationService.updateApplicationStatus(
      applicationId,
      status,
    );
  }
}
