import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { IsNotProfane } from 'src/helpers/pipes/isNotProfine';

class FlowDTO {
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty()
  @Type(() => Number)
  participant: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  currentPrice?: number;
}

export class CreateTourDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  description: string;

  @ApiProperty()  
  @Type(() => Boolean)
  isAccommodation: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNotProfane()
  address: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(1)
  duration: number;

  @ApiProperty()
  @Type(() => String)
  @Length(3, 25)
  @IsNotProfane()
  city: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  categoryIds: number[];

  @ApiProperty({ type: [FlowDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowDTO)
  flows: FlowDTO[];
}
