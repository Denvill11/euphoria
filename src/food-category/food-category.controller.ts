import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';
import { FoodCategoryService } from './food-category.service';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

class GetFoodCategoriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    const transformed = parseInt(value);
    return isNaN(transformed) ? undefined : transformed;
  })
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => {
    const transformed = parseInt(value);
    return isNaN(transformed) ? undefined : transformed;
  })
  offset?: number;
}

@Controller('food-category')
export class FoodCategoryController {
  constructor(private readonly foodCategoriesService: FoodCategoryService) {}

  @ApiProperty()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @Get()
  async getFoodCategories(@Query() query: GetFoodCategoriesDto) {
    return this.foodCategoriesService.getFoodCategories({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
  }

  // @Post()
  // addFoodCategories(
  //   @Body() categoryData: any,
  // ) {

  // }
}
