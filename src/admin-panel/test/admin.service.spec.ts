import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { getModelToken } from '@nestjs/sequelize';
import { User, UserRole } from '../../../sequelize/models/user';
import { HttpException } from '@nestjs/common';
import { Op } from 'sequelize';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    role: UserRole.USER,
    isEmailVerified: true,
    patronymic: '',
    avatarPath: '',
    dataValues: {
      id: 1,
      email: 'test@example.com',
      name: 'Test',
      surname: 'User',
      role: UserRole.USER,
      isEmailVerified: true,
      patronymic: '',
      avatarPath: '',
    }
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            findAndCountAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const userId = 2;
      const currentUserId = 1;
      const newRole = UserRole.ORGANIZER;

      const userToUpdate = { ...mockUser, id: userId };
      userModel.findOne.mockResolvedValue(userToUpdate);
      userModel.update.mockResolvedValue([1]);

      const result = await service.updateUserRole(newRole, userId, currentUserId);

      expect(result).toEqual({ role: newRole, userId });
      expect(userModel.update).toHaveBeenCalledWith(
        { role: newRole },
        { where: { id: userId } }
      );
    });

    it('should throw error when trying to change own role', async () => {
      const userId = 1;
      const currentUserId = 1;
      const newRole = UserRole.ORGANIZER;

      await expect(
        service.updateUserRole(newRole, userId, currentUserId)
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when user not found', async () => {
      const userId = 2;
      const currentUserId = 1;
      const newRole = UserRole.ORGANIZER;

      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserRole(newRole, userId, currentUserId)
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when trying to change admin role', async () => {
      const userId = 2;
      const currentUserId = 1;
      const newRole = UserRole.ORGANIZER;

      const adminUser = { ...mockUser, id: userId, dataValues: { ...mockUser.dataValues, role: UserRole.ADMIN } };
      userModel.findOne.mockResolvedValue(adminUser);

      await expect(
        service.updateUserRole(newRole, userId, currentUserId)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getAllUsers', () => {
    it('should return users without search string', async () => {
      const mockUsers = {
        rows: [mockUser],
        count: 1
      };

      userModel.findAndCountAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(undefined);

      expect(result).toEqual({
        data: mockUsers.rows,
        total: mockUsers.count,
        limit: 10,
        offset: 0
      });
      expect(userModel.findAndCountAll).toHaveBeenCalledWith({
        where: undefined,
        limit: 10,
        offset: 0
      });
    });

    it('should return users with search string', async () => {
      const searchString = 'test';
      const mockUsers = {
        rows: [mockUser],
        count: 1
      };

      userModel.findAndCountAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(searchString);

      expect(result).toEqual({
        data: mockUsers.rows,
        total: mockUsers.count,
        limit: 10,
        offset: 0
      });
      expect(userModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { email: { [Op.iLike]: `%${searchString}%` } },
            { name: { [Op.iLike]: `%${searchString}%` } },
            { patronymic: { [Op.iLike]: `%${searchString}%` } },
          ],
        },
        limit: 10,
        offset: 0
      });
    });

    it('should return users with custom limit and offset', async () => {
      const mockUsers = {
        rows: [mockUser],
        count: 1
      };

      userModel.findAndCountAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(undefined, 5, 10);

      expect(result).toEqual({
        data: mockUsers.rows,
        total: mockUsers.count,
        limit: 5,
        offset: 10
      });
      expect(userModel.findAndCountAll).toHaveBeenCalledWith({
        where: undefined,
        limit: 5,
        offset: 10
      });
    });
  });
}); 