import {
  Body,
  Controller,
  Patch,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ImageUpload } from 'src/decorators/image-upload.decorator';
import { User, userTokenData } from 'src/decorators/user-decorator';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdatePersonalInfoDTO } from './dto/updateUserDto';
import { UpdatePasswordDTO } from './dto/updatePasswordDto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Patch('/personal-info')
  @ImageUpload({singleFile: true, fieldName: 'avatar'})
  addPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() userData: UpdatePersonalInfoDTO,
    @User() user: userTokenData,
  ) {
    return this.userService.changePersonalInfo(file, user.id, userData);
  }

  @Patch('/password') 
  updatePassword(
    @Body() passwordData: UpdatePasswordDTO,
    @User() user: userTokenData
  ) {
    return this.userService.updatePassword(passwordData, user.id);
  }
}
