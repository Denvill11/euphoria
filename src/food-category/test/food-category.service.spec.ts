import { Test, TestingModule } from '@nestjs/testing';
import { FoodCategoryService } from '../food-category.service';
import { getModelToken } from '@nestjs/sequelize';
import { FoodCategory } from '../../../sequelize/models/food_categories';
import { Op } from 'sequelize';

describe('FoodCategoryService', () => {
  let service: FoodCategoryService;
  let foodCategoryModel: any;

  const mockFoodCategories = [
    {
      id: 1,
      name: 'Italian',
    },
    {
      id: 2,
      name: 'Japanese',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodCategoryService,
        {
          provide: getModelToken(FoodCategory),
          useValue: {
            findAndCountAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodCategoryService>(FoodCategoryService);
    foodCategoryModel = module.get(getModelToken(FoodCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFoodCategories', () => {
    it('should return food categories with default parameters', async () => {
      const mockResult = {
        rows: mockFoodCategories,
        count: mockFoodCategories.length,
      };

      foodCategoryModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await service.getFoodCategories({});

      expect(result).toEqual({
        data: mockFoodCategories,
        total: mockFoodCategories.length,
        limit: 10,
        offset: 0,
      });
      expect(foodCategoryModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Op.iLike]: '%%',
          },
        },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });

    it('should return food categories with search and pagination', async () => {
      const search = 'ital';
      const limit = 5;
      const offset = 0;
      const filteredCategories = mockFoodCategories.filter(cat => 
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
      const mockResult = {
        rows: filteredCategories,
        count: filteredCategories.length,
      };

      foodCategoryModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await service.getFoodCategories({ search, limit, offset });

      expect(result).toEqual({
        data: filteredCategories,
        total: filteredCategories.length,
        limit,
        offset,
      });
      expect(foodCategoryModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        },
        limit,
        offset,
        order: [['name', 'ASC']],
      });
    });

    it('should handle empty search results', async () => {
      const search = 'nonexistent';
      const mockResult = {
        rows: [],
        count: 0,
      };

      foodCategoryModel.findAndCountAll.mockResolvedValue(mockResult);

      const result = await service.getFoodCategories({ search });

      expect(result).toEqual({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      });
      expect(foodCategoryModel.findAndCountAll).toHaveBeenCalledWith({
        where: {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });
    });
  });
}); 