import { Test, TestingModule } from '@nestjs/testing';
import { TourService } from '../tour.service';
import { getModelToken } from '@nestjs/sequelize';
import { Tour } from '../../../sequelize/models/tour';
import { Flow } from '../../../sequelize/models/flows';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRole } from '../../../sequelize/models/user';
import { Errors } from '../../helpers/constants/errorMessages';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('TourService', () => {
  let service: TourService;
  let tourModel: any;
  let flowModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        {
          provide: getModelToken(Tour),
          useValue: {
            findAll: jest.fn(),
            findByPk: jest.fn(),
            findAndCountAll: jest.fn(),
          },
        },
        {
          provide: getModelToken(Flow),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TourService>(TourService);
    tourModel = module.get(getModelToken(Tour));
    flowModel = module.get(getModelToken(Flow));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTours', () => {
    it('should return tours with default pagination', async () => {
      const mockTours = {
        items: [
          {
            id: 1,
            title: 'Test Tour',
            description: 'Test Description',
          },
        ],
        total: 1
      };
      tourModel.findAndCountAll.mockResolvedValue({
        rows: mockTours.items,
        count: mockTours.total
      });

      const result = await service.getAllTours();

      expect(result).toEqual(mockTours);
      expect(tourModel.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('deleteTour', () => {
    it('should throw error if tour not found', async () => {
      tourModel.findByPk.mockResolvedValue(null);

      await expect(service.deleteTour({ id: 1, role: UserRole.ADMIN }, 1)).rejects.toThrow(
        new HttpException(Errors.tourNotFound, HttpStatus.NOT_FOUND),
      );
    });
  });
}); 