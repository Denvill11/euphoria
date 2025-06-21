import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { AddFoodCategoriesDto } from './dto/addFoodCategoriesDto';
import { GetTourFilterDto } from './dto/getTourFilterDto';

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
  @ApiOperation({ summary: 'Получить список туров с потоками' })
  async getAllTours(
    @User() user: userTokenData | undefined,
    @Query() filterDto: GetTourFilterDto
  ) {
    return this.tourService.getAllTours(filterDto.page, filterDto.limit, {
      ...filterDto,
      userId: user?.id,
    });
  }

  @Get('/:tourId')
  @ApiOperation({ summary: 'Получить конкретный тур с потоками' })
  async getTourById(
    @Param('tourId', ParseIntPipe) tourId: number,
  ) {
    return this.tourService.getTourById(tourId);
  }

  @ApiBearerAuth()
  @Post('/:tourId/food-categories')
  @ApiOperation({ summary: 'Добавить категории еды к туру' })
  @UseGuards(Organizer, AuthGuard)
  async addFoodCategories(
    @User() user: userTokenData,
    @Param('tourId', ParseIntPipe) tourId: number,
    @Body() addFoodCategoriesDto: AddFoodCategoriesDto,
  ) {
    return this.tourService.addFoodCategories(user, tourId, addFoodCategoriesDto);
  }

  @ApiBearerAuth()
  @Delete('/:tourId/food-categories')
  @ApiOperation({ summary: 'Удалить категории еды из тура' })
  @UseGuards(Organizer, AuthGuard)
  async removeFoodCategories(
    @User() user: userTokenData,
    @Param('tourId', ParseIntPipe) tourId: number,
    @Body() addFoodCategoriesDto: AddFoodCategoriesDto,
  ) {
    return this.tourService.removeFoodCategories(user, tourId, addFoodCategoriesDto);
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
