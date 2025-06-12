import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/registerUserDTO';
import { LoginUserDTO } from './dto/loginUserDTO';
import { AuthGuard } from '../helpers/guards/jwt-auth.guard';
import { VerifyEmailDTO } from './dto/verifyEmailDTO';
import { GenerateVerifyCodeDTO } from './dto/generateVerifyCodeDTO';
import { User, userTokenData } from '../helpers/decorators/user-decorator';
import { RefreshTokenDto } from './dto/refreshTokenDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  async registerUser(@Body() userData: RegisterUserDTO) {
    return await this.authService.registerUser(userData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  async loginUser(@Body() userData: LoginUserDTO) {
    return await this.authService.loginUser(userData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/whoami')
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  getUserInfo(@User() user: userTokenData) {
    return this.authService.getUserInfo(user.id);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Подтверждение email' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('generate-verify-code')
  @ApiOperation({ summary: 'Генерация кода подтверждения' })
  async generateVerifyCode(@Body() generateCodeData: GenerateVerifyCodeDTO) {
    return await this.authService.generateVerifyCode(generateCodeData);
  }

  @ApiOperation({ summary: 'Обновить access токен' })
  @ApiResponse({ status: 200, description: 'Токен успешно обновлен' })
  @ApiResponse({ status: 401, description: 'Невалидный токен' })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return { accessToken: await this.authService.refreshTokens(refreshTokenDto.accessToken) };
  }

  @ApiOperation({ summary: 'Выйти из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@User() user: userTokenData, @Headers('authorization') auth: string) {
    const accessToken = auth.split(' ')[1];
    await this.authService.logout(accessToken);
    return { message: 'Successfully logged out' };
  }
}
