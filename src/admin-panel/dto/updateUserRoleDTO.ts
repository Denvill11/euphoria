import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../../sequelize/models/user';
import { Errors } from '../../helpers/constants/errorMessages';

export class UpdateUserRoleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(UserRole, {
    message: `${Errors.isNotRoleValue}`,
  })
  role: UserRole;
}
