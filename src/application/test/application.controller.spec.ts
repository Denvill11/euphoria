import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationController } from '../application.controller';
import { ApplicationService } from '../application.service';
import { ApplicationStatus, OrganizationStatus } from '../../../sequelize/models/organizationApplications';
import { UserRole } from '../../../sequelize/models/user';
import { userTokenData } from '../../helpers/decorators/user-decorator';

jest.mock('../../helpers/guards/jwt-auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../../helpers/guards/admin.guard', () => ({
  Admin: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../../helpers/guards/organizer.guard', () => ({
  Organizer: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let service: ApplicationService;

  const mockApplicationService = {
    createApplication: jest.fn(),
    getAll: jest.fn(),
    updateApplicationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createApplication', () => {
    it('should create an application', async () => {
      const user: userTokenData = { id: 1, role: UserRole.USER };
      const innOrOgrn = '1234567890';
      const expectedResult = {
        id: 1,
        userId: 1,
        innOrOgrn,
        organizationStatus: OrganizationStatus.ACTIVE,
        adminApprove: ApplicationStatus.PENDING,
      };

      mockApplicationService.createApplication.mockResolvedValue(expectedResult);

      const result = await controller.createApplication(user, innOrOgrn);

      expect(result).toEqual(expectedResult);
      expect(service.createApplication).toHaveBeenCalledWith(user.id, innOrOgrn);
    });
  });

  describe('getAll', () => {
    it('should get all applications without filters', async () => {
      const user: userTokenData = { id: 1, role: UserRole.ORGANIZER };
      const expectedResult = [
        {
          id: 1,
          userId: 1,
          innOrOgrn: '1234567890',
          organizationStatus: OrganizationStatus.ACTIVE,
          adminApprove: ApplicationStatus.PENDING,
        },
      ];

      mockApplicationService.getAll.mockResolvedValue(expectedResult);

      const result = await controller.getAll(user);

      expect(result).toEqual(expectedResult);
      expect(service.getAll).toHaveBeenCalledWith(user, {
        organizationStatus: undefined,
        adminApprove: undefined,
      });
    });

    it('should get all applications with filters', async () => {
      const user: userTokenData = { id: 1, role: UserRole.ORGANIZER };
      const organizationStatus = OrganizationStatus.ACTIVE;
      const adminApprove = ApplicationStatus.PENDING;
      const expectedResult = [
        {
          id: 1,
          userId: 1,
          innOrOgrn: '1234567890',
          organizationStatus,
          adminApprove,
        },
      ];

      mockApplicationService.getAll.mockResolvedValue(expectedResult);

      const result = await controller.getAll(user, organizationStatus, adminApprove);

      expect(result).toEqual(expectedResult);
      expect(service.getAll).toHaveBeenCalledWith(user, {
        organizationStatus,
        adminApprove,
      });
    });
  });

  describe('approveOrRejectApplication', () => {
    it('should approve or reject application', async () => {
      const applicationId = 1;
      const status = ApplicationStatus.APPROVED;
      const expectedResult = {
        id: applicationId,
        userId: 1,
        innOrOgrn: '1234567890',
        organizationStatus: OrganizationStatus.ACTIVE,
        adminApprove: status,
      };

      mockApplicationService.updateApplicationStatus.mockResolvedValue(expectedResult);

      const result = await controller.approveOrRejectApplication(applicationId, status);

      expect(result).toEqual(expectedResult);
      expect(service.updateApplicationStatus).toHaveBeenCalledWith(
        applicationId,
        status,
      );
    });
  });
}); 