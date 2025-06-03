import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tour } from 'sequelize/models/tour';
import { CreateTourDTO } from './dto/createTourDto';
import { Errors } from 'src/helpers/constants/errorMessages';
import { userTokenData } from 'src/helpers/decorators/user-decorator';
import { UserRole } from 'sequelize/models/user';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { Category } from 'sequelize/models/category';
import { Flow } from 'sequelize/models/flows';
import * as fs from 'fs/promises';
import { User } from 'sequelize/models/user';
import { FoodCategory } from 'sequelize/models/food_categories';
import { AddFoodCategoriesDto } from './dto/addFoodCategoriesDto';

@Injectable()
export class TourService {
  constructor(
    @InjectModel(Tour) private readonly tourRepo: typeof Tour,
    @InjectModel(Flow) private readonly flowRepo: typeof Flow,
  ) {}

  async createTour(
    userId: number,
    tourData: CreateTourDTO,
    photos: Express.Multer.File[],
  ): Promise<Tour> {
    const pathsFileNames = photos?.map((el) => el.path) ?? [];

    if (!pathsFileNames.length) {
      throw new HttpException(Errors.needImage, HttpStatus.BAD_REQUEST);
    }

    const { categoryIds, flows: rawFlows, ...tourFields } = tourData;

    try {
      let flows: any[] = [];
      if (typeof rawFlows === 'string') {
        try {
          const parsed = JSON.parse(rawFlows);
          flows = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error('Error parsing flows:', e);
        }
      } else if (Array.isArray(rawFlows)) {
        flows = rawFlows;
      } else if (rawFlows && typeof rawFlows === 'object') {
        flows = [rawFlows];
      }

      const tour = await this.tourRepo
        .build({
          ...tourFields,
          authorId: userId,
          photos: pathsFileNames,
        } as any)
        .save();

      if (categoryIds?.length) {
        await tour.$set('categories', categoryIds);
      }

      if (flows?.length) {
        for (const flow of flows) {
          const flowData = {
            startDate: new Date(flow.startDate),
            endDate: new Date(flow.endDate),
            participant: Number(flow.participant),
            currentPrice: flow.currentPrice ? Number(flow.currentPrice) : undefined,
            tourId: tour.id
          };
          
          await this.flowRepo.create(flowData as any);
        }
      }

      return tour;
    } catch (error) {
      console.error('Error creating tour:', error);
      try {
        for (const file of pathsFileNames) {
          await fs.unlink(file);
        }
      } catch (unlinkError) {
        console.error('Error deleting files:', unlinkError);
      }
      throw new HttpException(
        `Error creating tour: ${error.message || Errors.createTour}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateTour(
    user: userTokenData,
    tourData: CreateTourDTO,
    photos: Express.Multer.File[],
    tourId: number,
  ): Promise<Tour> {
    const tour = await this.tourRepo.findByPk(tourId);

    if (!tour) {
      throw new HttpException(Errors.tourNotFound, HttpStatus.NOT_FOUND);
    }

    this.checkAcess(tour, user);

    if (photos && photos.length > 0) {
      const pathsFileNames = photos.map((photo) => photo.path);
      tour.dataValues.photos = pathsFileNames;
    }

    tour.dataValues.title = tourData.title ?? tour.title;
    tour.dataValues.description = tourData.description ?? tour.description;
    tour.dataValues.isAccommodation =
      tourData.isAccommodation ?? tour.isAccommodation;
    tour.dataValues.address = tourData.address ?? tour.address;
    tour.dataValues.duration = tourData.duration ?? tour.duration;

    try {
      await tour.save();
      return tour;
    } catch (error) {
      throw new HttpException(Errors.updateTour, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllTours(
    page = 1,
    limit = 10,
    filters: {
      title?: string;
      isAccommodation?: boolean;
      categoryIds?: number[];
      foodCategoryIds?: number[];
      startDate?: Date;
      endDate?: Date;
      city?: string;
      durationFrom?: number;
      durationTo?: number;
      isCreatedByMe?: boolean;
      userId?: number;
    } = {}
  ): Promise<{ items: Tour[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const where: WhereOptions<Tour> = {};

      if (filters.title?.trim()) {
        where.title = { [Op.iLike]: `%${filters.title.trim()}%` };
      }

      if (typeof filters.isAccommodation === 'boolean') {
        where.isAccommodation = filters.isAccommodation;
      }

      if (filters.city?.trim()) {
        where.city = { [Op.iLike]: `%${filters.city.trim()}%` };
      }

      if (filters.isCreatedByMe && filters.userId) {
        where.authorId = filters.userId;
      }

      if (typeof filters.durationFrom === 'number') {
        if (!where.duration) {
          where.duration = {};
        }
        where.duration[Op.gte] = filters.durationFrom;
      }

      if (typeof filters.durationTo === 'number') {
        if (!where.duration) {
          where.duration = {};
        }
        where.duration[Op.lte] = filters.durationTo;
      }

      const queryOptions: FindAndCountOptions<Tour> = {
        where,
        limit,
        offset,
        distinct: true,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'surname'],
          }
        ]
      };

      const { rows, count } = await this.tourRepo.findAndCountAll(queryOptions);

      return {
        items: rows,
        total: count
      };
    } catch (error) {
      console.error('Error in getAllTours:', error);
      throw new HttpException(
        `${Errors.getTours}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteTour(user: userTokenData, tourId: number): Promise<void> {
    const tour = await this.tourRepo.findByPk(tourId);

    if (!tour) {
      throw new HttpException(Errors.tourNotFound, HttpStatus.NOT_FOUND);
    }

    this.checkAcess(tour, user);

    try {
      await tour.destroy();
    } catch (error) {
      throw new HttpException(Errors.deleteTour, HttpStatus.BAD_REQUEST);
    }
  }

  checkAcess(tour: Tour, user: userTokenData) {
    const isAuthor = tour.dataValues.authorId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new HttpException(Errors.forbidden, HttpStatus.FORBIDDEN);
    }
  }

  async addFoodCategories(
    user: userTokenData,
    tourId: number,
    addFoodCategoriesDto: AddFoodCategoriesDto,
  ): Promise<Tour> {
    const tour = await this.tourRepo.findByPk(tourId);

    if (!tour) {
      throw new HttpException(Errors.tourNotFound, HttpStatus.NOT_FOUND);
    }

    this.checkAcess(tour, user);

    try {
      await tour.$add('foodCategories', addFoodCategoriesDto.foodCategoryIds);
      return tour.reload({
        include: [
          {
            model: FoodCategory,
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      throw new HttpException(
        Errors.addFoodCategoryError,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeFoodCategories(
    user: userTokenData,
    tourId: number,
    addFoodCategoriesDto: AddFoodCategoriesDto,
  ): Promise<Tour> {
    const tour = await this.tourRepo.findByPk(tourId);

    if (!tour) {
      throw new HttpException(Errors.tourNotFound, HttpStatus.NOT_FOUND);
    }

    this.checkAcess(tour, user);

    try {
      await tour.$remove('foodCategories', addFoodCategoriesDto.foodCategoryIds);
      return tour.reload({
        include: [
          {
            model: FoodCategory,
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      throw new HttpException(
        Errors.removeFoodCategoryError,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
