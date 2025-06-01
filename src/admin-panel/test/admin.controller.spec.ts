import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { UserRole } from '../../../sequelize/models/user';
import { userTokenData } from '../../helpers/decorators/user-decorator';
import { JwtService } from '@nestjs/jwt';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    updateUserRole: jest.fn(),
    getAllUsers: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const userId = 2;
      const currentUser: userTokenData = { id: 1, role: UserRole.ADMIN };
      const userRole = { role: UserRole.ORGANIZER };
      const expectedResult = { role: UserRole.ORGANIZER, userId: 2 };

      mockAdminService.updateUserRole.mockResolvedValue(expectedResult);

      const result = await controller.updateUserRole(userRole, userId, currentUser);

      expect(result).toEqual(expectedResult);
      expect(service.updateUserRole).toHaveBeenCalledWith(
        userRole.role,
        userId,
        currentUser.id
      );
    });
  });

  describe('getAllUsers', () => {
    it('should get all users without search string', async () => {
      const expectedResult = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0
      };

      mockAdminService.getAllUsers.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers(undefined);

      expect(result).toEqual(expectedResult);
      expect(service.getAllUsers).toHaveBeenCalledWith(undefined);
    });

    it('should get all users with search string', async () => {
      const searchString = 'test';
      const expectedResult = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0
      };

      mockAdminService.getAllUsers.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers(searchString);

      expect(result).toEqual(expectedResult);
      expect(service.getAllUsers).toHaveBeenCalledWith(searchString);
    });
  });
}); 