import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateBookingDTO {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  participant: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  flowId: number;
}
