import { Test, TestingModule } from '@nestjs/testing';
import { TourController } from '../tour.controller';
import { TourService } from '../tour.service';
import { CreateTourDTO } from '../dto/createTourDto';
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

describe('TourController', () => {
  let controller: TourController;
  let service: TourService;

  const mockTourService = {
    createTour: jest.fn(),
    updateTour: jest.fn(),
    getAllTours: jest.fn(),
    deleteTour: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourController],
      providers: [
        {
          provide: TourService,
          useValue: mockTourService,
        },
      ],
    }).compile();

    controller = module.get<TourController>(TourController);
    service = module.get<TourService>(TourService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTour', () => {
    it('should create a tour', async () => {
      const files = [{ path: 'path/to/photo.jpg' }] as Express.Multer.File[];
      const createTourDto: CreateTourDTO = {
        title: 'Test Tour',
        description: 'Test Description',
        isAccommodation: true,
        address: 'Test Address',
        duration: 5,
        city: 'Test City',
        categoryIds: [1, 2],
        flows: [
          {
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-05'),
            participant: 10,
            currentPrice: 1000,
          },
        ],
      };
      const user = { id: 1, role: UserRole.ORGANIZER };
      const expectedResult = { id: 1, ...createTourDto };

      mockTourService.createTour.mockResolvedValue(expectedResult);

      const result = await controller.createTour(files, createTourDto, user);

      expect(result).toEqual(expectedResult);
      expect(service.createTour).toHaveBeenCalledWith(user.id, createTourDto, files);
    });
  });

  describe('updateTour', () => {
    it('should update a tour', async () => {
      const tourId = 1;
      const files = [{ path: 'path/to/photo.jpg' }] as Express.Multer.File[];
      const updateTourDto: CreateTourDTO = {
        title: 'Updated Tour',
        description: 'Updated Description',
        isAccommodation: false,
        address: 'Updated Address',
        duration: 7,
        city: 'Updated City',
        categoryIds: [2, 3],
        flows: [
          {
            startDate: new Date('2024-04-01'),
            endDate: new Date('2024-04-07'),
            participant: 15,
            currentPrice: 1200,
          },
        ],
      };
      const user = { id: 1, role: UserRole.ORGANIZER };
      const expectedResult = { id: tourId, ...updateTourDto };

      mockTourService.updateTour.mockResolvedValue(expectedResult);

      const result = await controller.updateTour(files, updateTourDto, user, tourId);

      expect(result).toEqual(expectedResult);
      expect(service.updateTour).toHaveBeenCalledWith(user, updateTourDto, files, tourId);
    });
  });

  describe('getAllTours', () => {
    it('should return all tours with default pagination', async () => {
      const expectedResult = [
        {
          id: 1,
          title: 'Test Tour',
          description: 'Test Description',
          isAccommodation: true,
          address: 'Test Address',
          duration: 5,
          city: 'Test City',
        },
      ];

      mockTourService.getAllTours.mockResolvedValue(expectedResult);

      const result = await controller.getAllTours();

      expect(result).toEqual(expectedResult);
      expect(service.getAllTours).toHaveBeenCalledWith(1, 10, {
        title: undefined,
        isAccommodation: undefined,
        categoryIds: undefined,
        startDate: undefined,
        endDate: undefined,
        city: undefined,
        durationFrom: undefined,
        durationTo: undefined,
      });
    });

    it('should return filtered tours', async () => {
      const filters = {
        page: 2,
        limit: 5,
        title: 'Test',
        isAccommodation: true,
        categoryIds: '1,2',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        city: 'Test City',
        durationFrom: 3,
        durationTo: 7,
      };
      const expectedResult = [
        {
          id: 1,
          title: 'Test Tour',
          description: 'Test Description',
          isAccommodation: true,
          address: 'Test Address',
          duration: 5,
          city: 'Test City',
        },
      ];

      mockTourService.getAllTours.mockResolvedValue(expectedResult);

      const result = await controller.getAllTours(
        filters.page,
        filters.limit,
        filters.title,
        filters.isAccommodation,
        filters.categoryIds,
        filters.startDate,
        filters.endDate,
        filters.city,
        filters.durationFrom,
        filters.durationTo,
      );

      expect(result).toEqual(expectedResult);
      expect(service.getAllTours).toHaveBeenCalledWith(filters.page, filters.limit, {
        title: filters.title,
        isAccommodation: filters.isAccommodation,
        categoryIds: [1, 2],
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
        city: filters.city,
        durationFrom: filters.durationFrom,
        durationTo: filters.durationTo,
      });
    });
  });

  describe('deleteTour', () => {
    it('should delete a tour', async () => {
      const tourId = 1;
      const user = { id: 1, role: UserRole.ORGANIZER };

      mockTourService.deleteTour.mockResolvedValue(undefined);

      await controller.deleteTour(user, tourId);

      expect(service.deleteTour).toHaveBeenCalledWith(user, tourId);
    });
  });
}); 