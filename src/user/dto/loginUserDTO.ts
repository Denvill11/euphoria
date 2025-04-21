import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  readonly password: string;
}