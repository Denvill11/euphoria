import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDTO } from './dto/createTourDto';
import { Organizer } from 'src/helpers/guards/organizer.guard';
import { User, userTokenData } from 'src/helpers/decorators/user-decorator';
import { AuthGuard } from 'src/helpers/guards/jwt-auth.guard';
import { ImageUpload } from 'src/helpers/decorators/image-upload.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('tours')
@Controller('tour')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Создать новый тур' })
  @ImageUpload({ singleFile: false, fieldName: 'photos' })
  @UseGuards(Organizer, AuthGuard)
  createTour(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() tourDto: CreateTourDTO,
    @User() user: userTokenData,
  ) {
    return this.tourService.createTour(user.id, tourDto, files);
  }

  @ApiBearerAuth()
  @Patch('/:tourId')
  @ApiOperation({ summary: 'Обновить существующий тур' })
  @ImageUpload({ singleFile: false, fieldName: 'photos' })
  @UseGuards(Organizer, AuthGuard)
  updateTour(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() tourDto: CreateTourDTO,
    @User() user: userTokenData,
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.tourService.updateTour(user, tourDto, files, tourId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список туров' })
  async getAllTours(
    @User() user: userTokenData | undefined,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string,
    @Query('isAccommodation') isAccommodation?: boolean,
    @Query('categoryIds') categoryIds?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('city') city?: string,
    @Query('durationFrom') durationFrom?: number,
    @Query('durationTo') durationTo?: number,
    @Query('isCreatedByMe') isCreatedByMe?: boolean,
  ) {
    const parsedCategoryIds = categoryIds
      ? categoryIds.split(',').map((id) => parseInt(id, 10))
      : undefined;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.tourService.getAllTours(page, limit, {
      title,
      isAccommodation,
      categoryIds: parsedCategoryIds,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      city: city,
      durationFrom,
      durationTo,
      isCreatedByMe,
      userId: user?.id,
    });
  }

  @ApiBearerAuth()
  @Delete('/:tourId')
  @ApiOperation({ summary: 'Удалить тур' })
  @UseGuards(Organizer, AuthGuard)
  async deleteTour(
    @User() user: userTokenData,
    @Param('tourId') tourId: number,
  ) {
    return this.tourService.deleteTour(user, tourId);
  }
}
