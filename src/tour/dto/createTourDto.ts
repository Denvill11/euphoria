import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

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
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()  
  @Type(() => Boolean)
  isAccommodation: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(1)
  duration: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  categoryIds: number[];

  @ApiProperty({ type: [FlowDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowDTO)
  flows: FlowDTO[];
}
