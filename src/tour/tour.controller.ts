import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards } from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDTO } from './dto/createTourDto';
import { Organizer } from 'src/guards/organizer.guard';
import { User, userTokenData } from 'src/decorators/user-decorator';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { ImageUpload } from 'src/decorators/image-upload.decorator';

@Controller('tour')
export class TourController {
  constructor(
    private readonly tourService: TourService
  ) { }

  //TODO подумать про удаление файлов если произошла ошибка
  @Post()
  @ImageUpload({ singleFile: false, fieldName: 'photos' })
  @UseGuards(Organizer, AuthGuard)
  createTour(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() tourDto: CreateTourDTO,
    @User() user: userTokenData,
  ) {
    return this.tourService.createTour(user.id, tourDto, files)
  }

  @Patch('/:tourId')
  @UseGuards(Organizer, AuthGuard)
  @ImageUpload({ singleFile: false, fieldName: 'photos' })
  updateTour(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() tourDto: CreateTourDTO,
    @User() user: userTokenData,
    @Param('tourId', ParseIntPipe) tourId: number
  ) {
    return this.tourService.updateTour(user, tourDto, files, tourId);
  }

  @Get()
  async getAllTours(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string,
    @Query('isAccommodation') isAccommodation?: boolean,
    @Query('categoryIds') categoryIds?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const parsedCategoryIds = categoryIds
      ? categoryIds.split(',').map(id => parseInt(id, 10))
      : undefined;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.tourService.getAllTours(page, limit, {
      title,
      isAccommodation,
      categoryIds: parsedCategoryIds,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });
  }

  @Delete('/:tourId')
  @UseGuards(Organizer, AuthGuard)
  async deleteTour(
    @User() user: userTokenData,
    @Param('tourId') tourId: number
  ) {
    return this.tourService.deleteTour(user, tourId);
  }
}
