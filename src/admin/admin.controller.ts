import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/jwt-auth.guard";
import { Admin } from "src/guards/admin.guard";
import { UpdateUserRoleDTO } from './dto/updateUserRoleDTO';
import { User } from "src/decorators/user-decorator";

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
    @User() currentUser: number,
  ) {
    return this.adminService.updateUserRole(userRole.role, userId, currentUser);
  }

  @Get('all-users')
  getAllUsers(
    @Query('search-string') search: string | undefined,
  ) {
    return this.adminService.getAllUsers(search);
  }
}
