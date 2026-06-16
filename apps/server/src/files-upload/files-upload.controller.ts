import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createParseFilePipe } from '../shared/files/files-validation-factory';
import { MaxFileCount } from '../shared/files/constants/file-count.constants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Throttle } from '@nestjs/throttler';

type File = Express.Multer.File;

@Controller('files-upload')
@Throttle({ default: { ttl: 60000, limit: 10 } })
export class FilesUploadController {
  constructor(private cloudinary: CloudinaryService) {}

  @Post('singleImg')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(createParseFilePipe('10GB', ['png', 'jpeg', 'jpg', 'webp']))
    file: File,
  ) {
    const res = await this.cloudinary.uploadFile(file);

    return { url: res.secure_url };
  }

  @Post('/multipleImg')
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PRODUCTS_IMAGES))
  async uploadFiles(
    @UploadedFiles(createParseFilePipe('10GB', ['png', 'jpeg', 'pdf']))
    files: File[],
  ) {
    const res = await this.cloudinary.uploadMultipleImages(files);
    return { urls: res.map((r) => r.secure_url) };
  }

  @Post('/singleVid')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideoFile(
    @UploadedFile(
      createParseFilePipe('10GB', [
        'video/mp4',
        'video/avi',
        'video/webm',
        'video/mkv',
        'video/mp3',
        'video/matroska',
        'video/quicktime',
        'video/x-matroska',
        'video/x-msvideo',
      ]),
    )
    file: File,
  ) {
    const res = await this.cloudinary.uploadFile(file, {
      chunk_size: 60000,
      resource_type: 'video',
      format: 'mp4',
    });

    return { url: res.secure_url };
  }

  @Post('/multipleVid')
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PRODUCTS_IMAGES))
  async uploadVideosFiles(
    @UploadedFiles(
      createParseFilePipe('10GB', [
        'video/mp4',
        'video/avi',
        'video/webm',
        'video/mkv',
        'video/mp3',
        'video/matroska',
        'video/quicktime',
        'video/x-matroska',
        'video/x-msvideo',
      ]),
    )
    files: File[],
  ) {
    const res = await this.cloudinary.uploadMultipleVideos(files, {
      chunk_size: 60000,
      resource_type: 'video',
      format: 'mp4',
    });

    return { urls: res.map((r) => r.secure_url) };
  }
}
