import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/registerUserDTO';
import { LoginUserDTO } from './dto/loginUserDTO';
import { whoamiType } from './dto/whoamiDTO';
import { AuthGuard } from '../helpers/guards/jwt-auth.guard';
import { VerifyEmailDTO } from './dto/verifyEmailDTO';
import { GenerateVerifyCodeDTO } from './dto/generateVerifyCodeDTO';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  async registerUser(@Body() userData: RegisterUserDTO) {
    return await this.authService.registerUser(userData);
  }

  @Post('login')
  async loginUser(@Body() userData: LoginUserDTO) {
    return await this.authService.loginUser(userData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/whoami')
  getUserInfo(@Request() req: whoamiType) {
    return this.authService.getUserInfo(req.user.id);
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('generate-verify-code')
  async generateVerifyCode(@Body() generateCodeData: GenerateVerifyCodeDTO) {
    return await this.authService.generateVerifyCode(generateCodeData);
  }
}
