import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { CloudinaryResponse } from './cloudinary-response';
import { randomUUID } from 'crypto';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    options: UploadApiOptions = {},
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `udemy-clone/uploads/${randomUUID()}`,

          ...options,
        },
        (error, result) => {
          if (error) {
            return reject(new Error(error.message || 'files upload failed'));
          }
          if (result) {
            resolve(result);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }

  async uploadMultipleVideos(
    files: Express.Multer.File[],
    options: UploadApiOptions = {},
  ): Promise<CloudinaryResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, options)));
  }
}

/* just review */
// import { Injectable } from '@nestjs/common';
// import { v2 as cloudinary } from 'cloudinary';
// import * as toStream from 'buffer-to-stream';
// import { CloudinaryResponse } from './cloudinary-response';

// @Injectable()
// export class CloudinaryService {
//   async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
//     return new Promise<CloudinaryResponse>((resolve, reject) => {
//       const upload = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'image',
//           folder: `${file.originalname}/images`,
//           allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           if (result) {
//             console.log("result...................."result);

//             resolve(result);
//           }
//         },
//       );
//       toStream(file.buffer).pipe(upload);
//     });
//   }

//   async uploadMultipleImages(
//     files: Express.Multer.File[],
//   ): Promise<CloudinaryResponse[]> {
//     const uploadPromises = files.map((file) => this.uploadImage(file));

//     return Promise.all(uploadPromises);
//   }

//   async uploadVideo(file: Express.Multer.File): Promise<string> {
//     return new Promise<string>((resolve, reject) => {
//       const upload = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'video',
//           folder: `${file.originalname}/videos`,
//           allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mp3'],
//           chunk_size: 6000000, // 6MB chunks for large files
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           if (result) {
//             console.log('result', result);

//             return resolve(result?.secure_url);
//           }
//         },
//       );
//       toStream(file.buffer).pipe(upload);
//     });
//   }

//   async uploadMultipleVideos(files: Express.Multer.File[]): Promise<string[]> {
//     const uploadPromises = files.map((file) => this.uploadVideo(file));

//     return Promise.all(uploadPromises);
//   }
// }

// // import { Injectable } from '@nestjs/common';
// // import { v2 as cloudinary } from 'cloudinary';
// // import { UploadApiResponse } from 'cloudinary';

// // @Injectable()
// // export class CloudinaryService {
// //   constructor() {}

// //   async uploadFile(filePath: string): Promise<UploadApiResponse> {
// //     return await cloudinary.uploader.upload(filePath, {
// //       resource_type: 'auto',
// //       folder: 'udemy-clone/uploads',
// //     });
// //   }
