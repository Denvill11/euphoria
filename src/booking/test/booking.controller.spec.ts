import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from '../booking.controller';
import { BookingService } from '../booking.service';
import { CreateBookingDTO } from '../dto/createBookingDTO';
import { UpdateBookingDTO } from '../dto/updateBookingDTO';
import { User } from 'sequelize/models/user';

jest.mock('../../helpers/guards/jwt-auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBookingService = {
    createBooking: jest.fn(),
    updateBooking: jest.fn(),
    getBookingsForUser: jest.fn(),
    getBookingsForFlow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking', () => {
    it('should create a booking', async () => {
      const user = { id: 1 } as User;
      const createBookingDTO: CreateBookingDTO = {
        participant: 2,
        flowId: 1,
      };
      const expectedResult = {
        id: 1,
        userId: 1,
        flowId: 1,
        participant: 2,
        isActive: true,
      };

      mockBookingService.createBooking.mockResolvedValue(expectedResult);

      const result = await controller.createBooking(createBookingDTO, user);

      expect(result).toEqual(expectedResult);
      expect(service.createBooking).toHaveBeenCalledWith(user.id, createBookingDTO);
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const bookingId = 1;
      const updateBookingDTO: UpdateBookingDTO = {
        isActive: false,
        participant: 3,
      };
      const expectedResult = {
        id: bookingId,
        userId: 1,
        flowId: 1,
        participant: 3,
        isActive: false,
      };

      mockBookingService.updateBooking.mockResolvedValue(expectedResult);

      const result = await controller.updateBooking(bookingId, updateBookingDTO);

      expect(result).toEqual(expectedResult);
      expect(service.updateBooking).toHaveBeenCalledWith(bookingId, updateBookingDTO);
    });
  });

  describe('getBookings', () => {
    it('should get bookings for user', async () => {
      const user = { id: 1 } as User;
      const expectedResult = [
        {
          id: 1,
          userId: 1,
          flowId: 1,
          participant: 2,
          isActive: true,
        },
      ];

      mockBookingService.getBookingsForUser.mockResolvedValue(expectedResult);

      const result = await controller.getBookings(user);

      expect(result).toEqual(expectedResult);
      expect(service.getBookingsForUser).toHaveBeenCalledWith(user.id);
    });
  });

  describe('getBookingsForFlow', () => {
    it('should get bookings for flow', async () => {
      const flowId = 1;
      const expectedResult = [
        {
          id: 1,
          userId: 1,
          flowId: 1,
          participant: 2,
          isActive: true,
        },
      ];

      mockBookingService.getBookingsForFlow.mockResolvedValue(expectedResult);

      const result = await controller.getBookingsForFlow(flowId);

      expect(result).toEqual(expectedResult);
      expect(service.getBookingsForFlow).toHaveBeenCalledWith(flowId);
    });
  });
}); 