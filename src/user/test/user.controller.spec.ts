import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRole } from 'sequelize/models/user';
import { AuthGuard } from '../../helpers/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UpdatePersonalInfoDTO } from '../dto/updateUserDto';

jest.mock('../../helpers/guards/jwt-auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockResolvedValue(true),
  })),
}));

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            changePersonalInfo: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addPhoto', () => {
    const file = { path: 'path/to/avatar.jpg' } as Express.Multer.File;
    const userData: UpdatePersonalInfoDTO = {
      email: 'john@example.com',
      name: 'John',
      surname: 'Doe',
      patronymic: 'Smith'
    };
    const user = { id: 1, role: UserRole.USER };

    it('should call service to update personal info', async () => {
      const expectedResult = { ...userData, avatarPath: file.path };
      jest.spyOn(service, 'changePersonalInfo').mockResolvedValue(expectedResult);

      const result = await controller.addPhoto(file, userData, user);

      expect(result).toEqual(expectedResult);
      expect(service.changePersonalInfo).toHaveBeenCalledWith(
        file,
        user.id,
        userData,
      );
    });
  });

  describe('updatePassword', () => {
    const passwordData = {
      oldPassword: 'oldPass123',
      newPassword: 'newPass123',
    };
    const user = { id: 1, role: UserRole.USER };

    it('should call service to update password', async () => {
      const expectedResult = { message: 'Password updated successfully' };
      jest.spyOn(service, 'updatePassword').mockResolvedValue(expectedResult);

      const result = await controller.updatePassword(passwordData, user);

      expect(result).toEqual(expectedResult);
      expect(service.updatePassword).toHaveBeenCalledWith(passwordData, user.id);
    });
  });
});