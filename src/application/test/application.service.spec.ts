import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from '../application.service';
import { getModelToken } from '@nestjs/sequelize';
import { OrganizationApplication, ApplicationStatus, OrganizationStatus } from '../../../sequelize/models/organizationApplications';
import { User, UserRole } from '../../../sequelize/models/user';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApplicationService', () => {
  let service: ApplicationService;
  let applicationModel: any;
  let userModel: any;

  const mockApplication = {
    id: 1,
    userId: 1,
    innOrOgrn: '1234567890',
    organizationStatus: OrganizationStatus.ACTIVE,
    adminApprove: ApplicationStatus.PENDING,
    dataValues: {
      id: 1,
      userId: 1,
      innOrOgrn: '1234567890',
      organizationStatus: OrganizationStatus.ACTIVE,
      adminApprove: ApplicationStatus.PENDING,
    },
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getModelToken(OrganizationApplication),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    applicationModel = module.get(getModelToken(OrganizationApplication));
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplication', () => {
    it('should throw error if innOrOgrn is too short', async () => {
      await expect(service.createApplication(1, '123456789')).rejects.toThrow(HttpException);
    });

    it('should throw error if application already exists', async () => {
      applicationModel.findOne.mockResolvedValue(mockApplication);
      await expect(service.createApplication(1, '1234567890')).rejects.toThrow(HttpException);
    });

    it('should create application successfully', async () => {
      const mockDadataResponse = {
        data: {
          suggestions: [{
            value: 'Test Company',
            data: {
              state: {
                status: OrganizationStatus.ACTIVE,
              },
            },
          }],
        },
      };

      applicationModel.findOne.mockResolvedValue(null);
      applicationModel.create.mockResolvedValue({ id: 1 });
      applicationModel.update.mockResolvedValue([1, [mockApplication]]);
      mockedAxios.post.mockResolvedValue(mockDadataResponse);

      const result = await service.createApplication(1, '1234567890');
      expect(result).toEqual([mockApplication]);
    });
  });

  describe('getCompanyData', () => {
    it('should throw error on API failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error());
      await expect(service.getCompanyData('1234567890')).rejects.toThrow(HttpException);
    });

    it('should return company data successfully', async () => {
      const mockResponse = {
        data: {
          suggestions: [{
            value: 'Test Company',
            data: {
              state: {
                status: OrganizationStatus.ACTIVE,
              },
            },
          }],
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.getCompanyData('1234567890');
      expect(result).toEqual(mockResponse.data.suggestions[0]);
    });
  });

  describe('checkValidStatus', () => {
    it('should return PENDING if no status provided', () => {
      const result = service.checkValidStatus({
        value: 'Test Company',
        data: { state: { status: OrganizationStatus.PENDING } },
      });
      expect(result).toBe(OrganizationStatus.PENDING);
    });

    it('should throw error for invalid status', () => {
      expect(() =>
        service.checkValidStatus({
          value: 'Test Company',
          data: { state: { status: 'INVALID' as any } },
        }),
      ).toThrow(HttpException);
    });

    it('should return valid status', () => {
      const result = service.checkValidStatus({
        value: 'Test Company',
        data: { state: { status: OrganizationStatus.ACTIVE } },
      });
      expect(result).toBe(OrganizationStatus.ACTIVE);
    });
  });

  describe('getAll', () => {
    it('should get all applications for admin', async () => {
      const user = { id: 1, role: UserRole.ADMIN };
      const filters = {
        organizationStatus: OrganizationStatus.ACTIVE,
        adminApprove: ApplicationStatus.PENDING,
      };

      applicationModel.findAll.mockResolvedValue([mockApplication]);

      const result = await service.getAll(user, filters);
      expect(result).toEqual([mockApplication]);
      expect(applicationModel.findAll).toHaveBeenCalledWith({
        where: filters,
      });
    });

    it('should get applications for non-admin user', async () => {
      const user = { id: 1, role: UserRole.ORGANIZER };
      applicationModel.findAll.mockResolvedValue([mockApplication]);

      const result = await service.getAll(user);
      expect(result).toEqual([mockApplication]);
      expect(applicationModel.findAll).toHaveBeenCalledWith({
        where: { userId: user.id },
      });
    });
  });

  describe('updateApplicationStatus', () => {
    it('should throw error if application not found', async () => {
      applicationModel.findByPk.mockResolvedValue(null);
      await expect(
        service.updateApplicationStatus(1, ApplicationStatus.APPROVED),
      ).rejects.toThrow(HttpException);
    });

    it('should update user role to ORGANIZER if current role is USER', async () => {
      const mockUser = { role: UserRole.USER };
      applicationModel.findByPk.mockResolvedValue(mockApplication);
      userModel.findByPk.mockResolvedValue(mockUser);

      await service.updateApplicationStatus(1, ApplicationStatus.APPROVED);

      expect(userModel.update).toHaveBeenCalledWith(
        { role: UserRole.ORGANIZER },
        { where: { id: mockApplication.userId } },
      );
    });

    it('should not update user role if current role is not USER', async () => {
      const mockUser = { role: UserRole.ORGANIZER };
      applicationModel.findByPk.mockResolvedValue(mockApplication);
      userModel.findByPk.mockResolvedValue(mockUser);

      await service.updateApplicationStatus(1, ApplicationStatus.APPROVED);

      expect(userModel.update).not.toHaveBeenCalled();
    });
  });
}); 