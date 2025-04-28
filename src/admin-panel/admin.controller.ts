import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/jwt-auth.guard";
import { Admin } from "src/guards/admin.guard";
import { UpdateUserRoleDTO } from './dto/updateUserRoleDTO';
import { User, userTokenData } from "src/decorators/user-decorator";
import { ApplicationStatus } from "sequelize/models/organizationApplications";

@ApiBearerAuth()
@UseGuards(AuthGuard, Admin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  @Patch('user/:userId/change-role')
  updateUserRole(
    @Body() userRole: UpdateUserRoleDTO,
    @Param('userId', ParseIntPipe) userId: number,
    @User() currentUser: userTokenData,
  ) {
    return this.adminService.updateUserRole(userRole.role, userId, currentUser.id);
  }

  @Get('all-users')
  getAllUsers(
    @Query('search-string') search: string | undefined,
  ) {
    return this.adminService.getAllUsers(search);
  }
}
