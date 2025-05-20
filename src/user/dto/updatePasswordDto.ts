import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Errors } from 'src/helpers/constants/errorMessages';

export class UpdatePasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: Errors.smallPassword })
  @Transform(({ value }) => value.trim())
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: Errors.smallPassword })
  @Transform(({ value }) => value.trim())
  oldPassword: string;
}
