import { Test, TestingModule } from '@nestjs/testing';
import { FoodCategoryController } from '../food-category.controller';
import { FoodCategoryService } from '../food-category.service';
import { JwtService } from '@nestjs/jwt';

describe('FoodCategoryController', () => {
  let controller: FoodCategoryController;
  let service: FoodCategoryService;

  const mockFoodCategoryService = {
    getFoodCategories: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodCategoryController],
      providers: [
        {
          provide: FoodCategoryService,
          useValue: mockFoodCategoryService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
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
    it('should get food categories with default parameters', async () => {
      const mockCategories = [{ id: 1, name: 'Test Category' }];
      mockFoodCategoryService.getFoodCategories.mockResolvedValue(mockCategories);

      const result = await controller.getFoodCategories('', 10, 0);

      expect(result).toEqual(mockCategories);
      expect(service.getFoodCategories).toHaveBeenCalledWith({ search: '', limit: 10, offset: 0 });
    });

    it('should get food categories with search parameters', async () => {
      const search = 'test';
      const limit = 5;
      const offset = 5;
      const mockCategories = [{ id: 1, name: 'Test Category' }];
      mockFoodCategoryService.getFoodCategories.mockResolvedValue(mockCategories);

      const result = await controller.getFoodCategories(search, limit, offset);

      expect(result).toEqual(mockCategories);
      expect(service.getFoodCategories).toHaveBeenCalledWith({ search, limit, offset });
    });
  });
});
