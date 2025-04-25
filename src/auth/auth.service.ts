import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'sequelize/models/user';
import { LoginUserDTO } from './dto/loginUserDTO';
import { RegisterUserDTO } from './dto/registerUserDTO';
import { Errors } from '../constants/errorMessages';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userData: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  async getUserInfo(userId: number) {
    return await this.userData.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'avatarPath',
        'email',
        'name',
        'surname',
      ],
    });
  }

  private generateToken(id: number, userRole: UserRole) {
    console.log(userRole);
    return this.jwtService.signAsync({ id, userRole });
  }

  async loginUser(userDto: LoginUserDTO) {
    const user = await this.validateUser(userDto);
    user.dataValues.password = '';
    const token = await this.generateToken(user.id, user.dataValues.role);
    return { token, user };
  }

  async registerUser(userDto: RegisterUserDTO) {
    const candidateEmail = await this.userData.findOne({
      where: { email: userDto.email },
    });

    if (candidateEmail !== null) {
      throw new HttpException(
        Errors.userExists,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userData.create(userDto as User);
    const token = await this.generateToken(user.id, user.dataValues.role);
    user.dataValues.password = '';
    return { user, token };
  }

  private async validateUser(userDto: LoginUserDTO) {
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
}