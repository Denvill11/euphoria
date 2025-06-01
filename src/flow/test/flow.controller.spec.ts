import { Test, TestingModule } from '@nestjs/testing';
import { FlowController } from '../flow.controller';
import { FlowService } from '../flow.service';
import { CreateFlowDto } from '../dto/createFlowDTO';
import { UpdateFlowDto } from '../dto/updateFlowDTO';
import { UserRole } from '../../../sequelize/models/user';

jest.mock('../../helpers/guards/jwt-auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../../helpers/guards/organizer.guard', () => ({
  Organizer: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('FlowController', () => {
  let controller: FlowController;
  let service: FlowService;

  const mockFlowService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowController],
      providers: [
        {
          provide: FlowService,
          useValue: mockFlowService,
        },
      ],
    }).compile();

    controller = module.get<FlowController>(FlowController);
    service = module.get<FlowService>(FlowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a flow', async () => {
      const createFlowDto: CreateFlowDto = {
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-10'),
        tourId: 1,
        participant: 10,
        currentPrice: 1000,
      };
      const user = { id: 1, role: UserRole.ORGANIZER };
      const expectedResult = {
        id: 1,
        ...createFlowDto,
      };

      mockFlowService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createFlowDto, user);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createFlowDto, user);
    });
  });

  describe('findAll', () => {
    it('should return all flows', async () => {
      const expectedResult = [
        {
          id: 1,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-10'),
          tourId: 1,
          participant: 10,
          currentPrice: 1000,
        },
      ];

      mockFlowService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a flow by id', async () => {
      const flowId = 1;
      const expectedResult = {
        id: flowId,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-10'),
        tourId: 1,
        participant: 10,
        currentPrice: 1000,
      };

      mockFlowService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(flowId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(flowId);
    });
  });

  describe('update', () => {
    it('should update a flow', async () => {
      const flowId = 1;
      const updateFlowDto: UpdateFlowDto = {
        participant: 10,
        currentPrice: 1200,
      };
      const user = { id: 1, role: UserRole.ORGANIZER };
      const expectedResult = {
        id: flowId,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-10'),
        tourId: 1,
        ...updateFlowDto,
      };

      mockFlowService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(flowId, updateFlowDto, user);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(flowId, updateFlowDto, user);
    });
  });

  describe('remove', () => {
    it('should remove a flow', async () => {
      const flowId = 1;
      const user = { id: 1, role: UserRole.ORGANIZER };

      mockFlowService.remove.mockResolvedValue(undefined);

      await controller.remove(flowId, user);

      expect(service.remove).toHaveBeenCalledWith(flowId, user);
    });
  });
}); 