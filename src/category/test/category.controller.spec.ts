import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';
import { CreateCategoryDTO } from '../dto/createCategoryDTO';
import { UpdateCategoryDTO } from '../dto/updateCategoryDTO';

jest.mock('../../helpers/guards/admin.guard', () => ({
  Admin: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const expectedResult = [
        {
          id: 1,
          title: 'Test Category',
          description: 'Test Description',
          iconPath: 'path/to/icon.jpg',
        },
      ];

      mockCategoryService.getAllCategories.mockResolvedValue(expectedResult);

      const result = await controller.getAllCategories();

      expect(result).toEqual(expectedResult);
      expect(service.getAllCategories).toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const categoryId = 1;
      const expectedResult = {
        id: categoryId,
        title: 'Test Category',
        description: 'Test Description',
        iconPath: 'path/to/icon.jpg',
      };

      mockCategoryService.getCategoryById.mockResolvedValue(expectedResult);

      const result = await controller.getCategoryById(categoryId);

      expect(result).toEqual(expectedResult);
      expect(service.getCategoryById).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDTO = {
        title: 'New Category',
        description: 'New Description',
        iconPath: '',
      };
      const mockFile = {
        path: 'path/to/new/icon.jpg',
      } as Express.Multer.File;
      const expectedResult = {
        id: 1,
        ...createCategoryDto,
        iconPath: mockFile.path,
      };

      mockCategoryService.createCategory.mockResolvedValue(expectedResult);

      const result = await controller.createCategory(createCategoryDto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(service.createCategory).toHaveBeenCalledWith(createCategoryDto, mockFile);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDTO = {
        title: 'Updated Category',
        description: 'Updated Description',
      };
      const mockFile = {
        path: 'path/to/updated/icon.jpg',
      } as Express.Multer.File;
      const expectedResult = {
        id: categoryId,
        ...updateCategoryDto,
        iconPath: mockFile.path,
      };

      mockCategoryService.updateCategory.mockResolvedValue(expectedResult);

      const result = await controller.updateCategory(categoryId, updateCategoryDto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(service.updateCategory).toHaveBeenCalledWith(categoryId, updateCategoryDto, mockFile);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryId = 1;

      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await controller.deleteCategory(categoryId);

      expect(service.deleteCategory).toHaveBeenCalledWith(categoryId);
    });
  });
}); 