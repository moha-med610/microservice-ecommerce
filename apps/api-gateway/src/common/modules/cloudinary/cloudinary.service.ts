import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file?.buffer) {
        return reject(new Error('File buffer is missing'));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `e-commerce/files/${folder}`,
          resource_type: 'image',
          upload_preset: 'ml_default',
        },
        (err, result) => {
          if (err) {
            this.logger.error(
              'Cloudinary Upload Error',
              JSON.stringify({
                message: err.message,
                http_code: err.http_code,
                name: err.name,
              }),
            );

            return reject(
              new InternalServerErrorException('Failed To Upload Image'),
            );
          }

          if (!result) {
            return reject(
              new InternalServerErrorException(
                'Cloudinary returned empty result',
              ),
            );
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
