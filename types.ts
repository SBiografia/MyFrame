
export type DateFormat = 'YYYY.MM.DD' | 'MM.DD.YYYY' | 'DD.MM.YYYY';

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  fNumber?: string;
  shutterSpeed?: string;
  iso?: string;
  focalLength?: string;
  dateTime?: string;
  location?: string;
  filmSimulation?: string;
}

export interface Photo {
  id: string;
  file: File;
  previewUrl: string;
  exif: ExifData;
}

export interface FrameConfig {
  showMaker: boolean;
  showModel: boolean;
  showLens: boolean;
  showDate: boolean;
  dateFormat: DateFormat;
  showTime: boolean;
  showExposure: boolean;
  showIso: boolean;
  showLocation: boolean;
  showFilmSimulation: boolean;
  thickness: number;
  color: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
  roundCorners: boolean;
}

export const DEFAULT_CONFIG: FrameConfig = {
  showMaker: true,
  showModel: true,
  showLens: true,
  showDate: true,
  dateFormat: 'YYYY.MM.DD',
  showTime: true,
  showExposure: true,
  showIso: true,
  showLocation: false,
  showFilmSimulation: false,
  thickness: 40,
  color: '#FFFFFF',
  textColor: '#000000',
  alignment: 'center',
  roundCorners: false,
};
