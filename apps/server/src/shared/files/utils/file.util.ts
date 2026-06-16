import { FileType } from '../types/file.types';
import { lookup } from 'mime-types';

export const createFileTypeRegex = (fileTypes: FileType[]): RegExp => {
  const mediaTypes = fileTypes
    .map((type) => (type.includes('/') ? type : lookup(type)))
    .filter((type): type is string => type !== false);

  return new RegExp(mediaTypes.join('|'));
};
