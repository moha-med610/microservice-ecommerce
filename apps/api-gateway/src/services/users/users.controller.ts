import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@shared/common/guards/auth.guard.js';
import { userData } from '@shared/utils/extract-user-data.js';
import { type Request } from 'express';
import { CustomFileInterceptor } from '../../common/interceptors/file.interceptor.js';
import { CompleteProfileDto } from './dto/users.dto.js';
import { UsersService } from './users.service.js';
import { v2 as cloudinary } from 'cloudinary';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(
    CustomFileInterceptor({
      fieldName: 'avatar',
      maxSize: 3 * 1024 * 1024,
    }),
  )
  @UseGuards(AuthGuard)
  @Post('complete-profile')
  async completeProfile(
    @Body() data: CompleteProfileDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const authId = userData(req).id;
    return this.usersService.completeProfile(file, data, authId);
  }
}
