import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'sequelize/models/user';
import { UpdatePersonalInfoDTO } from './dto/updateUserDto';
import { UpdatePasswordDTO } from './dto/updatePasswordDto';
import * as bcrypt from 'bcrypt';
import { Errors } from 'src/helpers/constants/errorMessages';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userData: typeof User) {}

  async changePersonalInfo(
    file: Express.Multer.File,
    userId: number,
    userData: Partial<UpdatePersonalInfoDTO>,
  ) {
    userData.avatarPath = file?.path;
    try {
      await this.userData.update(userData, { where: { id: userId } });

      return userData;
    } catch {
      throw new HttpException(
        Errors.userChangeError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(passwordData: UpdatePasswordDTO, userId: number) {
    const user = await this.userData.findByPk(userId);
    if (!user) {
      throw new HttpException(Errors.userNotFound, HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(
      passwordData.oldPassword,
      user.dataValues.password,
    );
    if (!isMatch) {
      throw new HttpException(
        Errors.oldPasswordIncorrect,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await bcrypt.hash(
      passwordData.newPassword,
      Number(process.env.SALT_ROUNDS),
    );

    await this.userData.update(
      { password: hashedNewPassword },
      { where: { id: userId } },
    );

    return { message: 'Password updated successfully' };
  }
}
