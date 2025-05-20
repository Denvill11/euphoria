import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'sequelize/models/user';

@Injectable()
export class Organizer implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('Access denied. No token provided.');
    }

    const decoded: any = this.jwtService.decode(token);

    const roles = [UserRole.ADMIN, UserRole.ORGANIZER];
    if (!roles.includes(decoded.userRole)) {
      throw new ForbiddenException('You do not have the necessary role');
    }

    return true;
  }
}
