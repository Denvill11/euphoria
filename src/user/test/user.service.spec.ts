import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../../../sequelize/models/user';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Errors } from '../../helpers/constants/errorMessages';
import * as bcrypt from 'bcrypt';
import { UpdatePersonalInfoDTO } from '../dto/updateUserDto';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {
            update: jest.fn(),
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('changePersonalInfo', () => {
    const userId = 1;
    const file = { path: 'path/to/avatar.jpg' } as Express.Multer.File;
    const userData = { firstName: 'John', lastName: 'Doe' };

    it('should update user personal info with avatar', async () => {
      userModel.update.mockResolvedValue([1]);

      const result = await service.changePersonalInfo(file, userId, {
        firstName: userData.firstName,
        lastName: userData.lastName
      } as UpdatePersonalInfoDTO);

      expect(result).toEqual({ ...userData, avatarPath: file.path });
      expect(userModel.update).toHaveBeenCalledWith(
        { ...userData, avatarPath: file.path },
        { where: { id: userId } },
      );
    });

    it('should throw error if update fails', async () => {
      userModel.update.mockRejectedValue(new Error('DB Error'));

      await expect(service.changePersonalInfo(file, userId, {
        firstName: userData.firstName,
        lastName: userData.lastName
      } as UpdatePersonalInfoDTO)).rejects.toThrow(
        new HttpException(Errors.userChangeError, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('updatePassword', () => {
    const userId = 1;
    const passwordData = {
      oldPassword: 'oldPass123',
      newPassword: 'newPass123',
    };
    const mockUser = {
      dataValues: {
        password: 'hashedOldPass',
      },
    };

    it('should update password successfully', async () => {
      userModel.findByPk.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPass');
      userModel.update.mockResolvedValue([1]);

      const result = await service.updatePassword(passwordData, userId);

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        passwordData.oldPassword,
        mockUser.dataValues.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        passwordData.newPassword,
        expect.any(Number),
      );
      expect(userModel.update).toHaveBeenCalledWith(
        { password: 'hashedNewPass' },
        { where: { id: userId } },
      );
    });

    it('should throw error if user not found', async () => {
      userModel.findByPk.mockResolvedValue(null);

      await expect(service.updatePassword(passwordData, userId)).rejects.toThrow(
        new HttpException(Errors.userNotFound, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw error if old password is incorrect', async () => {
      userModel.findByPk.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword(passwordData, userId)).rejects.toThrow(
        new HttpException(Errors.oldPasswordIncorrect, HttpStatus.BAD_REQUEST),
      );
    });
  });
}); 