import { Test, TestingModule } from '@nestjs/testing';
import { FoodCategoryController } from '../food-category.controller';
import { FoodCategoryService } from '../food-category.service';

describe('FoodCategoryController', () => {
  let controller: FoodCategoryController;
  let service: FoodCategoryService;

  const mockFoodCategoryService = {
    getFoodCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodCategoryController],
      providers: [
        {
          provide: FoodCategoryService,
          useValue: mockFoodCategoryService,
        },
      ],
    }).compile();

    controller = module.get<FoodCategoryController>(FoodCategoryController);
    service = module.get<FoodCategoryService>(FoodCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFoodCategories', () => {
    it('should return food categories with default pagination', async () => {
      const expectedResult = {
        data: [
          {
            id: 1,
            name: 'Italian',
          },
          {
            id: 2,
            name: 'Japanese',
          },
        ],
        total: 2,
        limit: 10,
        offset: 0,
      };

      mockFoodCategoryService.getFoodCategories.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getFoodCategories({
        search: '',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(expectedResult);
      expect(service.getFoodCategories).toHaveBeenCalledWith({
        search: '',
        limit: 10,
        offset: 0,
      });
    });

    it('should return food categories with search and pagination', async () => {
      const search = 'ital';
      const limit = 5;
      const offset = 0;
      const expectedResult = {
        data: [
          {
            id: 1,
            name: 'Italian',
          },
        ],
        total: 1,
        limit,
        offset,
      };

      mockFoodCategoryService.getFoodCategories.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getFoodCategories({
        search,
        limit,
        offset,
      });

      expect(result).toEqual(expectedResult);
      expect(service.getFoodCategories).toHaveBeenCalledWith({
        search,
        limit,
        offset,
      });
    });
  });
});
