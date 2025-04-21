import { Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/registerUserDTO';
import { LoginUserDTO } from './dto/loginUserDTO';
import { whoamiType } from './dto/whoamiDTO';
import { AuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('registration') 
  async registerUser(@Body() userData: RegisterUserDTO) {
    return await this.authService.registerUser(userData);
  }

  @Post('login')
  async loginUser(@Body() userData: LoginUserDTO ) {
    return await this.authService.loginUser(userData);
  }

  @UseGuards(AuthGuard)
  @Get('/whoami')
  getUserInfo(@Request() req: whoamiType) {
    return this.authService.getUserInfo(req.user.id);
  }
}
