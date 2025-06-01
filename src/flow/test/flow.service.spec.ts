import { Test, TestingModule } from '@nestjs/testing';
import { FlowService } from '../flow.service';
import { getModelToken } from '@nestjs/sequelize';
import { Flow } from '../../../sequelize/models/flows';
import { NotFoundException } from '@nestjs/common';
import { CreateFlowDto } from '../dto/createFlowDTO';
import { UpdateFlowDto } from '../dto/updateFlowDTO';
import { UserRole } from '../../../sequelize/models/user';

describe('FlowService', () => {
  let service: FlowService;
  let flowModel: any;

  const mockFlow = {
    id: 1,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-10'),
    tourId: 1,
    participant: 10,
    currentPrice: 1000,
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlowService,
        {
          provide: getModelToken(Flow),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FlowService>(FlowService);
    flowModel = module.get(getModelToken(Flow));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      flowModel.create.mockResolvedValue(expectedResult);

      const result = await service.create(createFlowDto, user);

      expect(result).toEqual(expectedResult);
      expect(flowModel.create).toHaveBeenCalledWith(createFlowDto);
    });
  });

  describe('findAll', () => {
    it('should return all flows', async () => {
      const expectedResult = [mockFlow];

      flowModel.findAll.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(flowModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a flow by id', async () => {
      const flowId = 1;

      flowModel.findByPk.mockResolvedValue(mockFlow);

      const result = await service.findOne(flowId);

      expect(result).toEqual(mockFlow);
      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
    });

    it('should throw NotFoundException if flow not found', async () => {
      const flowId = 999;

      flowModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(flowId)).rejects.toThrow(NotFoundException);
      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if flow not found', async () => {
      const flowId = 999;
      const updateFlowDto: UpdateFlowDto = {
        participant: 15,
      };
      const user = { id: 1, role: UserRole.ORGANIZER };

      flowModel.findByPk.mockResolvedValue(null);

      await expect(service.update(flowId, updateFlowDto, user)).rejects.toThrow(
        NotFoundException,
      );
      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
    });

    it('should update a flow', async () => {
      const flowId = 1;
      const updateFlowDto: UpdateFlowDto = {
        participant: 15,
        currentPrice: 1200,
      };
      const user = { id: 1, role: UserRole.ORGANIZER };
      const updatedFlow = {
        ...mockFlow,
        ...updateFlowDto,
      };

      flowModel.findByPk.mockResolvedValue(mockFlow);
      mockFlow.update.mockResolvedValue(updatedFlow);

      const result = await service.update(flowId, updateFlowDto, user);

      expect(result).toEqual(updatedFlow);
      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
      expect(mockFlow.update).toHaveBeenCalledWith(updateFlowDto);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if flow not found', async () => {
      const flowId = 999;
      const user = { id: 1, role: UserRole.ORGANIZER };

      flowModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(flowId, user)).rejects.toThrow(
        NotFoundException,
      );
      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
    });

    it('should remove a flow', async () => {
      const flowId = 1;
      const user = { id: 1, role: UserRole.ORGANIZER };

      flowModel.findByPk.mockResolvedValue(mockFlow);

      await service.remove(flowId, user);

      expect(flowModel.findByPk).toHaveBeenCalledWith(flowId);
      expect(mockFlow.destroy).toHaveBeenCalled();
    });
  });
}); 