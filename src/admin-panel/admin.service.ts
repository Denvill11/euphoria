import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { User, UserRole } from "sequelize/models/user";
import { Errors } from "src/constants/errorMessages";


@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private readonly userData: typeof User,
  ) {}

  async updateUserRole(userRole: UserRole, userId: number, currentUser: number) {
    if(userId === currentUser) {
      throw new HttpException(Errors.changeSelfRole, HttpStatus.BAD_REQUEST)
    }

    const userForChange = await this.userData.findOne({ where: { id: userId }})
     
    if(!userForChange) {
      throw new HttpException(Errors.userNotFound, HttpStatus.BAD_REQUEST)
    }

    if(userForChange.dataValues.role === UserRole.ADMIN) {
      throw new HttpException(Errors.changeAdminRole, HttpStatus.BAD_REQUEST)
    }

    await this.userData.update(
      { role: userRole },
      { where: { id: userId } }
    );

    return { role: userRole, userId}
  }

  //TODO add pagination
  async getAllUsers(searchString: string | undefined) {
    
    if (!searchString) {
      return this.userData.findAll();
    }

    const users = await this.userData.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${searchString}%` } },
          { name: { [Op.iLike]: `%${searchString}%` } },
          { patronymic: { [Op.iLike]: `%${searchString}%` } },
        ],
      },
    });
    return users;
  }
}
