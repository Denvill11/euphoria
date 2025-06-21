import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking } from 'sequelize/models/booking';
import { CreateBookingDTO } from './dto/createBookingDTO';
import { UpdateBookingDTO } from './dto/updateBookingDTO';
import { Flow } from 'sequelize/models/flows';
import { Errors } from 'src/helpers/constants/errorMessages';
import { Tour } from 'sequelize/models/tour';
import { User } from 'sequelize/models/user';
import { Category } from 'sequelize/models/category';
import { FoodCategory } from 'sequelize/models/food_categories';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking) private readonly bookingRepo: typeof Booking,
    @InjectModel(Flow) private readonly flowRepo: typeof Flow,
  ) {}

  async createBooking(
    userId: number,
    createBookingDTO: CreateBookingDTO,
  ): Promise<Booking> {
    const { participant, flowId } = createBookingDTO;

    const flow = await this.flowRepo.findByPk(flowId);
    if (!flow) {
      throw new HttpException('Flow not found', HttpStatus.NOT_FOUND);
    }

    if (flow.participant <= 0) {
      throw new HttpException(Errors.noPlaces, HttpStatus.BAD_REQUEST);
    }

    const booking = await this.bookingRepo.create({
      userId,
      flowId,
      participant,
    } as Booking);

    flow.participant -= participant;
    await flow.save();

    return booking;
  }

  async updateBooking(
    bookingId: number,
    updateBookingDTO: UpdateBookingDTO,
  ): Promise<Booking> {
    const { isActive, participant } = updateBookingDTO;

    const booking = await this.bookingRepo.findByPk(bookingId);
    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    const flow = await this.flowRepo.findByPk(booking.flowId);
    if (!flow) {
      throw new HttpException('Flow not found', HttpStatus.NOT_FOUND);
    }

    if (!isActive && booking.isActive) {
      flow.participant += booking.participant;
      await flow.save();
    }

    if (isActive && !booking.isActive) {
      if (flow.participant <= 0) {
        throw new HttpException(
          'No available spots in this flow',
          HttpStatus.BAD_REQUEST,
        );
      }
      flow.participant -= participant;
      await flow.save();
    }

    booking.isActive = isActive;
    if (participant !== undefined) {
      booking.participant = participant;
    }

    await booking.save();
    return booking;
  }

  async getBookingsForUser(userId: number): Promise<Booking[]> {
    const bookings = await this.bookingRepo.findAll({
      where: { userId },
      include: [
        {
          model: Flow,
          as: 'flow',
          include: [
            {
              model: Tour,
              as: 'tour',
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'name', 'surname'],
                },
                {
                  model: Category,
                  as: 'categories',
                  through: { attributes: [] },
                },
                {
                  model: FoodCategory,
                  as: 'foodCategories',
                  through: { attributes: [] },
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return bookings;
  }

  async getBookingsForFlow(flowId: number): Promise<Booking[]> {
    const bookings = await this.bookingRepo.findAll({
      where: { flowId },
    });

    return bookings;
  }
}
