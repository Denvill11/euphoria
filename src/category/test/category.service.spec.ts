import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { getModelToken } from '@nestjs/sequelize';
import { Category } from '../../../sequelize/models/category';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDTO } from '../dto/createCategoryDTO';
import { UpdateCategoryDTO } from '../dto/updateCategoryDTO';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryModel: any;

  const mockCategory = {
    id: 1,
    title: 'Test Category',
    description: 'Test Description',
    iconPath: 'path/to/icon.jpg',
    update: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getModelToken(Category),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryModel = module.get(getModelToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      categoryModel.create.mockResolvedValue(expectedResult);

      const result = await service.createCategory(createCategoryDto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(categoryModel.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        iconPath: mockFile.path,
      });
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const expectedResult = [mockCategory];

      categoryModel.findAll.mockResolvedValue(expectedResult);

      const result = await service.getAllCategories();

      expect(result).toEqual(expectedResult);
      expect(categoryModel.findAll).toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const categoryId = 1;

      categoryModel.findByPk.mockResolvedValue(mockCategory);

      const result = await service.getCategoryById(categoryId);

      expect(result).toEqual(mockCategory);
      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category not found', async () => {
      const categoryId = 999;

      categoryModel.findByPk.mockResolvedValue(null);

      await expect(service.getCategoryById(categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('updateCategory', () => {
    it('should throw NotFoundException if category not found', async () => {
      const categoryId = 999;
      const updateCategoryDto: UpdateCategoryDTO = {
        title: 'Updated Category',
      };
      const mockFile = {
        path: 'path/to/updated/icon.jpg',
      } as Express.Multer.File;

      categoryModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateCategory(categoryId, updateCategoryDto, mockFile),
      ).rejects.toThrow(NotFoundException);
      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
    });

    it('should update a category', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDTO = {
        title: 'Updated Category',
        description: 'Updated Description',
      };
      const mockFile = {
        path: 'path/to/updated/icon.jpg',
      } as Express.Multer.File;
      const updatedCategory = {
        ...mockCategory,
        ...updateCategoryDto,
        iconPath: mockFile.path,
      };

      categoryModel.findByPk.mockResolvedValue(mockCategory);
      mockCategory.update.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(
        categoryId,
        updateCategoryDto,
        mockFile,
      );

      expect(result).toEqual(mockCategory);
      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
      expect(mockCategory.update).toHaveBeenCalledWith({
        ...updateCategoryDto,
        iconPath: mockFile.path,
      });
    });
  });

  describe('deleteCategory', () => {
    it('should throw NotFoundException if category not found', async () => {
      const categoryId = 999;

      categoryModel.findByPk.mockResolvedValue(null);

      await expect(service.deleteCategory(categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
    });

    it('should delete a category', async () => {
      const categoryId = 1;

      categoryModel.findByPk.mockResolvedValue(mockCategory);

      await service.deleteCategory(categoryId);

      expect(categoryModel.findByPk).toHaveBeenCalledWith(categoryId);
      expect(mockCategory.destroy).toHaveBeenCalled();
    });
  });
}); 