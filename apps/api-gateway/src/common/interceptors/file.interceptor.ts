import { BadRequestException, mixin, Type } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface FileInterceptorOptions {
  fieldName?: string;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export function CustomFileInterceptor(
  options: FileInterceptorOptions = {},
): Type<any> {
  const {
    fieldName = 'file',
    maxSize = 5 * 1024 * 1024,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;

  class CustomFileInterceptorMixin extends FileInterceptor(fieldName, {
    storage: memoryStorage(),

    limits: {
      fileSize: maxSize,
    },

    fileFilter: (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new BadRequestException('Invalid file type'), false);
      }

      callback(null, true);
    },
  }) {}

  return mixin(CustomFileInterceptorMixin);
}
