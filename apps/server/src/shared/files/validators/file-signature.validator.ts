import { FileValidator } from '@nestjs/common/pipes/file/file-validator.interface';
import magicBytes from 'magic-bytes.js';

export class FileSignatureValidator extends FileValidator {
  constructor() {
    super({});
  }
  buildErrorMessage(): string {
    return 'validation failed (file type does not match file signature)';
  }

  isValid(file: Express.Multer.File): boolean {
    // validate file signature
    const filesSignatures = magicBytes(file.buffer).map((file) => file.mime);

    if (!filesSignatures.length) return false;

    // Compare by media category (e.g. video/mp4 vs video/quicktime both have category "video")
    // This handles cases where the browser reports a different MIME subtype than magic-bytes detects
    // (common with video containers like MP4/MOV/QuickTime that share the same format)
    const reportedCategory = file.mimetype.split('/')[0];
    const isMatch =
      filesSignatures.includes(file.mimetype) ||
      filesSignatures.some((sig) => sig?.split('/')[0] === reportedCategory);

    if (!isMatch) return false;

    return true;
  }
}
