import { Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/jwt-auth.guard";

import { ApplicationService } from "./application.service";
import { User, userTokenData } from "src/decorators/user-decorator";
import { ApplicationStatus, OrganizationStatus } from "sequelize/models/organizationApplications";
import { Organizer } from "src/guards/organizer.guard";
import { Admin } from "src/guards/admin.guard";


@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) { }

  @Post('/:innOrOgrn')
  createApplication(
    @User() user: userTokenData,
    @Param('innOrOgrn') innOrOgrn: string,
  ) {
    return this.applicationService.createApplication(user.id, innOrOgrn)
  }

  @UseGuards(Organizer)
  @Get()
  getAll(
    @User() user: userTokenData,
    @Query('organizationStatus') organizationStatus?: OrganizationStatus,
    @Query('adminApprove') adminApprove?: ApplicationStatus,
  ) {
    return this.applicationService.getAll(user, { organizationStatus, adminApprove });
  }

  @UseGuards(Admin)
  @Patch('/:applicationId')
  approveOrRejectApplication(
    @Param('applicationId') applicationId: number,
    @Query('status') status: ApplicationStatus,
  ) {
    return this.applicationService.updateApplicationStatus(applicationId, status);
  }
}
