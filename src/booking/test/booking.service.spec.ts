import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from '../booking.service';
import { getModelToken } from '@nestjs/sequelize';
import { Booking } from '../../../sequelize/models/booking';
import { Flow } from '../../../sequelize/models/flows';
import { HttpException } from '@nestjs/common';
import { CreateBookingDTO } from '../dto/createBookingDTO';
import { UpdateBookingDTO } from '../dto/updateBookingDTO';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: any;
  let flowModel: any;

  const mockBooking = {
    id: 1,
    userId: 1,
    flowId: 1,
    participant: 2,
    isActive: true,
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getModelToken(Booking),
          useValue: {
            create: jest.fn(),
            findByPk: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: getModelToken(Flow),
          useValue: {
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingModel = module.get(getModelToken(Booking));
    flowModel = module.get(getModelToken(Flow));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should throw error if flow not found', async () => {
      const createBookingDTO: CreateBookingDTO = {
        participant: 2,
        flowId: 1,
      };

      flowModel.findByPk.mockResolvedValue(null);

      await expect(
        service.createBooking(1, createBookingDTO),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if no available spots', async () => {
      const createBookingDTO: CreateBookingDTO = {
        participant: 2,
        flowId: 1,
      };

      const mockFlow = {
        id: 1,
        participant: 0,
        save: jest.fn(),
      };

      flowModel.findByPk.mockResolvedValue(mockFlow);

      await expect(
        service.createBooking(1, createBookingDTO),
      ).rejects.toThrow(HttpException);
    });

    it('should create booking successfully', async () => {
      const createBookingDTO: CreateBookingDTO = {
        participant: 2,
        flowId: 1,
      };

      const mockFlow = {
        id: 1,
        participant: 5,
        save: jest.fn(),
      };

      flowModel.findByPk.mockResolvedValue(mockFlow);
      bookingModel.create.mockResolvedValue(mockBooking);

      const result = await service.createBooking(1, createBookingDTO);

      expect(result).toEqual(mockBooking);
      expect(mockFlow.save).toHaveBeenCalled();
      expect(mockFlow.participant).toBe(3);
    });
  });

  describe('updateBooking', () => {
    it('should throw error if booking not found', async () => {
      const updateBookingDTO: UpdateBookingDTO = {
        isActive: false,
        participant: 3,
      };

      bookingModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateBooking(1, updateBookingDTO),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if flow not found', async () => {
      const updateBookingDTO: UpdateBookingDTO = {
        isActive: false,
        participant: 3,
      };

      bookingModel.findByPk.mockResolvedValue(mockBooking);
      flowModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateBooking(1, updateBookingDTO),
      ).rejects.toThrow(HttpException);
    });

    it('should update booking from active to inactive', async () => {
      const updateBookingDTO: UpdateBookingDTO = {
        isActive: false,
        participant: 3,
      };

      const mockFlow = {
        id: 1,
        participant: 5,
        save: jest.fn(),
      };

      const mockActiveBooking = { ...mockBooking, isActive: true, save: jest.fn() };
      bookingModel.findByPk.mockResolvedValue(mockActiveBooking);
      flowModel.findByPk.mockResolvedValue(mockFlow);

      await service.updateBooking(1, updateBookingDTO);

      expect(mockFlow.participant).toBe(7);
      expect(mockFlow.save).toHaveBeenCalled();
      expect(mockActiveBooking.isActive).toBe(false);
      expect(mockActiveBooking.participant).toBe(3);
      expect(mockActiveBooking.save).toHaveBeenCalled();
    });

    it('should throw error when activating booking with no available spots', async () => {
      const updateBookingDTO: UpdateBookingDTO = {
        isActive: true,
        participant: 2,
      };

      const mockFlow = {
        id: 1,
        participant: 0,
        save: jest.fn(),
      };

      const mockInactiveBooking = { ...mockBooking, isActive: false };
      bookingModel.findByPk.mockResolvedValue(mockInactiveBooking);
      flowModel.findByPk.mockResolvedValue(mockFlow);

      await expect(
        service.updateBooking(1, updateBookingDTO),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getBookingsForUser', () => {
    it('should return bookings for user', async () => {
      const userId = 1;
      const expectedBookings = [mockBooking];

      bookingModel.findAll.mockResolvedValue(expectedBookings);

      const result = await service.getBookingsForUser(userId);

      expect(result).toEqual(expectedBookings);
      expect(bookingModel.findAll).toHaveBeenCalledWith({
        where: { userId },
        include: [
          {
            model: expect.any(Function),
            as: 'flow',
            include: [
              {
                model: expect.any(Function),
                as: 'tour',
                include: [
                  {
                    model: expect.any(Function),
                    as: 'author',
                    attributes: ['id', 'name', 'surname'],
                  },
                  {
                    model: expect.any(Function),
                    as: 'categories',
                    through: { attributes: [] },
                  },
                  {
                    model: expect.any(Function),
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
    });
  });

  describe('getBookingsForFlow', () => {
    it('should return bookings for flow', async () => {
      const flowId = 1;
      const expectedBookings = [mockBooking];

      bookingModel.findAll.mockResolvedValue(expectedBookings);

      const result = await service.getBookingsForFlow(flowId);

      expect(result).toEqual(expectedBookings);
      expect(bookingModel.findAll).toHaveBeenCalledWith({
        where: { flowId },
      });
    });
  });
}); 