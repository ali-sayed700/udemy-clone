export type FileType =
  | 'png'
  | 'jpg'
  | 'pdf'
  | 'jpeg'
  | 'webp'
  | 'gpg'
  | 'video/mp4'
  | 'video/mov'
  | 'video/avi'
  | 'video/mkv'
  | 'video/webm'
  | 'video/mp3'
  | 'video/wav'
  | 'video/VLC'
  | 'video/matroska'
  | 'video/quicktime'
  | 'video/x-matroska'
  | 'video/x-msvideo';

export type FileSizeType = `${number}${'KB' | 'MB' | 'GB' | 'TB'}`;
