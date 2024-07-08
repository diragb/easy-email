// Packages:
import { cloneDeep } from 'lodash';

// Typescript:
export enum ImageActionOrigin {
  EasyEmail,
  Flutter,
}

export interface ImageUpload {
  idx: string;
  url?: string;
  status: 'NEED_TO_UPLOAD' | 'UPLOADED';
}

// Functions:
export const getImageUpload = () => JSON.parse(sessionStorage.getItem('image-upload') ?? '{}') as ImageUpload;

export const setImageUpload = (callback: (_imageUpload: ImageUpload) => ImageUpload) => {
  const _imageUpload = cloneDeep(getImageUpload());
  const newImageUpload = callback(_imageUpload);
  sessionStorage.setItem('image-upload', JSON.stringify(newImageUpload));
  window.postMessage(JSON.stringify({ type: 'image-upload', imageUpload: newImageUpload }), '*');
};

export const generateUpdateImageUploadListener = (callback: (newImageUpload: ImageUpload) => void) => (event: MessageEvent<any>) => {
  try {
    if (typeof event.data !== 'string') return;
    if (event.data.trim().length === 0) return;
    const message = JSON.parse(event.data) as any;
    if (message.type === 'image-upload') callback(message.imageUpload);
  } catch (error) {
  }
};
