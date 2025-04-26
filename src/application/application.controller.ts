import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/jwt-auth.guard";

import { ApplicationService } from "./application.service";
import { User } from "src/decorators/user-decorator";


@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('application')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) {}

    @Post('/:innOrOgrn')
    createApplication(
      @User() userId: number,
      @Param('innOrOgrn') innOrOgrn: string,
    ) {
      return this.applicationService.createApplication(userId, innOrOgrn)
    }
}
