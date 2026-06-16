import { Module } from '@nestjs/common';
import { FilesUploadController } from './files-upload.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [FilesUploadController],
})
export class FilesUploadModule {}
