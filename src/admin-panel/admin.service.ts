import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User, UserRole } from 'sequelize/models/user';
import { Errors } from 'src/helpers/constants/errorMessages';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User) private readonly userData: typeof User) {}

  async updateUserRole(
    userRole: UserRole,
    userId: number,
    currentUser: number,
  ) {
    if (userId === currentUser) {
      throw new HttpException(Errors.changeSelfRole, HttpStatus.BAD_REQUEST);
    }

    const userForChange = await this.userData.findOne({
      where: { id: userId },
    });

    if (!userForChange) {
      throw new HttpException(Errors.userNotFound, HttpStatus.BAD_REQUEST);
    }

    if (userForChange.dataValues.role === UserRole.ADMIN) {
      throw new HttpException(Errors.changeAdminRole, HttpStatus.BAD_REQUEST);
    }

    await this.userData.update({ role: userRole }, { where: { id: userId } });

    return { role: userRole, userId };
  }

  async getAllUsers(searchString: string | undefined, limit = 10, offset = 0) {
    const whereClause = searchString
      ? {
          [Op.or]: [
            { email: { [Op.iLike]: `%${searchString}%` } },
            { name: { [Op.iLike]: `%${searchString}%` } },
            { patronymic: { [Op.iLike]: `%${searchString}%` } },
          ],
        }
      : undefined;

    const { rows: users, count: total } = await this.userData.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });

    return {
      data: users,
      total,
      limit,
      offset,
    };
  }
}
