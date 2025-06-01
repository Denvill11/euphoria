import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/helpers/guards/jwt-auth.guard';
import { User as UserData } from 'sequelize/models/user';
import { User } from 'src/helpers/decorators/user-decorator';
import { CreateBookingDTO } from './dto/createBookingDTO';
import { UpdateBookingDTO } from './dto/updateBookingDTO';
import { BookingService } from './booking.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Body() createBookingDTO: CreateBookingDTO,
    @User() user: UserData,
  ) {
    return this.bookingService.createBooking(user.id, createBookingDTO);
  }

  @Put(':bookingId')
  async updateBooking(
    @Param('bookingId') bookingId: number,
    @Body() updateBookingDTO: UpdateBookingDTO,
  ) {
    return this.bookingService.updateBooking(bookingId, updateBookingDTO);
  }

  @Get()
  async getBookings(@User() user: UserData) {
    return this.bookingService.getBookingsForUser(user.id);
  }

  @Get('flow/:flowId')
  async getBookingsForFlow(@Param('flowId') flowId: number) {
    return this.bookingService.getBookingsForFlow(flowId);
  }
}
