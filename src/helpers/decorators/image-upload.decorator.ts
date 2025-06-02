import {
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import * as crypto from 'crypto';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

interface ImageUploadOptions {
  fieldName?: string;
  singleFile?: boolean;
  maxCount?: number;
  uploadPath?: string;
}

const generateUniqueFileName = (req, file, callback) => {
  const ext = path.extname(file.originalname);
  const hash = crypto.randomBytes(8).toString('hex');
  const uniqueName = `${hash}${ext}`;
  callback(null, uniqueName);
};

const ensureUploadsDirExists = (uploadPath: string) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

export function ImageUpload(options: ImageUploadOptions = {}) {
  const {
    fieldName = 'avatar',
    singleFile = false,
    maxCount = 10,
    uploadPath = process.env.UPLOAD_PATH || 'uploads',
  } = options;

  ensureUploadsDirExists(uploadPath);

  const storage = diskStorage({
    destination: uploadPath,
    filename: generateUniqueFileName,
  });

  const fileUploadDecorators = [
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title' },
          description: { type: 'string', description: 'Description' },
          [fieldName]: singleFile
            ? {
                type: 'string',
                format: 'binary',
                description: 'File to upload',
              }
            : {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
                description: `Files to upload (max ${maxCount})`,
              },
        },
        required: ['title', 'description'],
      },
    }),
  ];

  const interceptor = singleFile
    ? FileInterceptor(fieldName, {
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
      })
    : FilesInterceptor(fieldName, maxCount, {
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
      });

  return applyDecorators(UseInterceptors(interceptor), ...fileUploadDecorators);
}
