import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tour } from 'sequelize/models/tour';
import { CreateTourDTO } from './dto/createTourDto';
import { Errors } from 'src/helpers/constants/errorMessages';
import { userTokenData } from 'src/helpers/decorators/user-decorator';
import { UserRole } from 'sequelize/models/user';
import { Op } from 'sequelize';
import { Category } from 'sequelize/models/category';
import { Flow } from 'sequelize/models/flows';
import * as fs from 'fs/promises';
import { User } from 'sequelize/models/user';

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
    const pathsFileNames = photos.map((el) => el.path);

    if (!pathsFileNames.length) {
      throw new HttpException(Errors.needImage, HttpStatus.BAD_REQUEST);
    }

    const { categoryIds, flows, ...tourFields } = tourData;

    try {
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
          await this.flowRepo.create({
            ...flow,
            tourId: tour.id,
          } as Flow);
        }
      }

      return tour;
    } catch (error) {
      try {
        for (const file of pathsFileNames) {
          await fs.unlink(file);
        }
      } catch {}
      throw new HttpException(Errors.createTour, HttpStatus.BAD_REQUEST);
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
    page: number = 1,
    limit: number = 10,
    filters?: {
      title?: string;
      isAccommodation?: boolean;
      categoryIds?: number[];
      startDate?: Date;
      endDate?: Date;
      city?: string;
      durationFrom?: number;
      durationTo?: number;
      isCreatedByMe?: boolean;
      userId?: number | undefined;
    },
  ): Promise<Tour[]> {
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters?.title) {
      where.title = { [Op.like]: `%${filters.title}%` };
    }

    if (
      filters?.durationFrom !== undefined ||
      filters?.durationTo !== undefined
    ) {
      where.duration = {};
      if (filters.durationFrom !== undefined) {
        where.duration[Op.gte] = filters.durationFrom;
      }
      if (filters.durationTo !== undefined) {
        where.duration[Op.lte] = filters.durationTo;
      }
    }

    if (filters?.isAccommodation !== undefined) {
      where.isAccommodation = filters.isAccommodation;
    }

    if (filters?.city) {
      where.city = {
        [Op.iLike]: `%${filters.city}%`,
      };
    }

    if (filters?.isCreatedByMe && filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      where['$flows.startDate$'] = {};
      where['$flows.endDate$'] = {};

      if (filters.startDate) {
        where['$flows.startDate$'][Op.gte] = filters.startDate;
      }

      if (filters.endDate) {
        where['$flows.endDate$'][Op.lte] = filters.endDate;
      }
    }

    try {
      const include: any = [];

      if (filters?.categoryIds?.length) {
        include.push({
          model: Category,
          where: { id: filters.categoryIds },
          through: { attributes: [] },
          required: true,
        });
      }

      if (filters?.startDate || filters?.endDate) {
        include.push({
          model: Flow,
          where: {},
          required: true,
        });
      }

      const tours = await this.tourRepo.findAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Flow,
            as: 'flows',
          },
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] },
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'surname', 'email', 'avatarPath'],
          },
        ],
      });

      return tours;
    } catch (error) {
      console.log(error);
      throw new HttpException(Errors.getTours, HttpStatus.BAD_REQUEST);
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
}
