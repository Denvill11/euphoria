import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from '../application.service';
import { getModelToken } from '@nestjs/sequelize';
import { OrganizationApplication, OrganizationStatus } from '../../../sequelize/models/organizationApplications';
import { User, UserRole } from '../../../sequelize/models/user';
import { ApplicationStatus } from '../../../sequelize/models/organizationApplications';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApplicationService', () => {
  let service: ApplicationService;
  let applicationModel: typeof OrganizationApplication;
  let userModel: typeof User;

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
      user: {
        id: 1,
        role: UserRole.USER,
      },
    },
    save: jest.fn().mockResolvedValue(true),
  } as unknown as OrganizationApplication;

  const mockApplicationModel = {
    findAll: jest.fn().mockImplementation((options) => {
      if (options?.where?.userId) {
        return [{ id: 1, userId: options.where.userId }];
      }
      return [];
    }),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };

  const mockUserModel = {
    findByPk: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    // Mock environment variables
    process.env.DADATA_TOKEN = 'test-token';
    process.env.DADATA_URL = 'https://api.dadata.ru/v2/suggest/party';

    // Reset all mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getModelToken(OrganizationApplication),
          useValue: mockApplicationModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    applicationModel = module.get(getModelToken(OrganizationApplication));
    userModel = module.get(getModelToken(User));

    // Mock axios default implementation
    (axios as jest.MockedFunction<typeof axios>).mockImplementation((config: any) => {
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.DADATA_TOKEN;
    delete process.env.DADATA_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCompanyData', () => {
    it('should throw error on API failure', async () => {
      // Mock axios to reject with proper error structure
      (axios as jest.MockedFunction<typeof axios>).mockImplementationOnce((config: any) => {
        return Promise.reject({
          response: {
            data: 'API Error',
            status: 400
          }
        });
      });

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
      
      // Mock axios for this specific test
      (axios as jest.MockedFunction<typeof axios>).mockImplementationOnce((config: any) => {
        return Promise.resolve(mockResponse);
      });

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

      const mockApplication = {
        id: 1,
        userId: 1,
        innOrOgrn: '123456789',
        organizationStatus: OrganizationStatus.ACTIVE,
        adminApprove: ApplicationStatus.PENDING,
        dataValues: {
          id: 1,
          userId: 1,
          innOrOgrn: '123456789',
          organizationStatus: OrganizationStatus.ACTIVE,
          adminApprove: ApplicationStatus.PENDING
        },
        save: jest.fn()
      } as any;

      jest.spyOn(applicationModel, 'findAll').mockResolvedValue([mockApplication]);

      const result = await service.getAll(user, filters);
      expect(result).toEqual([mockApplication]);
      expect(applicationModel.findAll).toHaveBeenCalledWith({
        where: filters,
      });
    });
  });

  describe('updateApplicationStatus', () => {
    it('should throw error if application not found', async () => {
      mockApplicationModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateApplicationStatus(1, ApplicationStatus.APPROVED),
      ).rejects.toThrow(HttpException);
    });

    it('should update user role to ORGANIZER if current role is USER', async () => {
      mockApplicationModel.findByPk.mockResolvedValue(mockApplication);

      await service.updateApplicationStatus(1, ApplicationStatus.APPROVED);

      expect(userModel.update).toHaveBeenCalledWith(
        { role: UserRole.ORGANIZER },
        { where: { id: mockApplication.dataValues.userId } },
      );
      expect(mockApplication.save).toHaveBeenCalled();
    });
  });
}); 