import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../sequelize/models/user';
import { LoginUserDTO } from './dto/loginUserDTO';
import { RegisterUserDTO } from './dto/registerUserDTO';
import { Errors } from '../helpers/constants/errorMessages';
import { MailerService } from '../mailer/mailer.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import * as otpGenerator from 'otp-generator';
import { VerifyEmailDTO } from './dto/verifyEmailDTO';
import { GenerateVerifyCodeDTO } from './dto/generateVerifyCodeDTO';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userData: typeof User,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserInfo(userId: number) {
    return await this.userData.findOne({
      where: { id: userId },
      attributes: ['id', 'avatarPath', 'email', 'name', 'surname', 'role', 'patronymic'],
    });
  }

  private generateToken(id: number, userRole: UserRole) {
    return this.jwtService.signAsync({ id, userRole });
  }

  async loginUser(userDto: LoginUserDTO) {
    const user = await this.validateUser(userDto);

    user.dataValues.password = '';
    const token = await this.generateToken(user.id, user.dataValues.role);
    return { token, user };
  }

  async registerUser(userDto: RegisterUserDTO) {
    const approveCode = await this.cacheManager.get(`verify:${userDto.email}`);

    if (approveCode !== String(process.env.REDIS_APPROVE_KEY)) {
      throw new HttpException(Errors.verifyEmail, HttpStatus.BAD_REQUEST);
    }

    const user = await this.userData.create({
      ...userDto,
      isEmailVerified: false,
    } as User);

    user.dataValues.password = '';
    const token = await this.generateToken(
      user.dataValues.id,
      user.dataValues.role,
    );
    return { user, token };
  }

  async validateUser(userDto: LoginUserDTO) {
    const user = await this.userData.findOne({
      where: { email: userDto.email },
    });
    if (user === null) {
      throw new UnauthorizedException({ message: Errors.userNotFound });
    }
    const isPasswordEquals = await bcrypt.compare(
      userDto.password,
      user.dataValues.password,
    );
    if (!isPasswordEquals) {
      throw new UnauthorizedException({
        message: Errors.userNotFound,
      });
    }
    return user;
  }

  async generateVerifyCode(data: GenerateVerifyCodeDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const verificationCode: string = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    await this.cacheManager.set(
      `verify:${data.email}`,
      verificationCode,
      Number(process.env.REDDIS_TTL),
    );

    await this.mailerService.sendVerificationCode(
      data.email,
      verificationCode,
      data.name,
    );
  }

  async verifyEmail(verifyDto: VerifyEmailDTO) {
    const candidateEmail = await this.userData.findOne({
      where: { email: verifyDto.email },
    });

    if (candidateEmail) {
      throw new HttpException(Errors.userExists, HttpStatus.BAD_REQUEST);
    }

    const cachedCode = await this.cacheManager.get(`verify:${verifyDto.email}`);
    if (!cachedCode || cachedCode !== verifyDto.code) {
      throw new HttpException(Errors.wrongCode, HttpStatus.BAD_REQUEST);
    }

    await this.cacheManager.set(
      `verify:${verifyDto.email}`,
      process.env.REDIS_APPROVE_KEY,
      Number(process.env.REDDIS_TTL),
    );

    return;
  }
}
