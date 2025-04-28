import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Flow } from 'sequelize/models/flows';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from 'sequelize/models/booking';
import { User } from 'src/decorators/user-decorator';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [
    SequelizeModule.forFeature([
      Flow, Booking, User
    ])
  ]
})
export class BookingModule { }
