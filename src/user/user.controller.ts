import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Express as ExpressType } from 'express';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor() {}

  @UseInterceptors(FilesInterceptor('files'))
  addPhoto(
    @Param('userId', ParseIntPipe) id: number,
    @UploadedFiles() file: any,
  ) {
  }
}
