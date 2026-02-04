
import { ExifData, FrameConfig, DateFormat } from '../types';

declare const EXIF: any;

const FUJIFILM_EXIF_TAGS: Record<number, string> = {
  0x1401: "Exif.Fujifilm.FilmMode",
};

const FUJIFILM_TYPE_SIZES: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  7: 1, // UNDEFINED
  9: 4, // SLONG
  10: 8, // SRATIONAL
};

const FUJIFILM_EXIF_VALUE_MAP: Record<string, any> = {
  "Exif.Fujifilm.FilmMode": {
    0: "Provia/Standard",
    256: "Studio Portrait",
    272: "Studio Portrait Enhanced Saturation",
    288: "Astia", 
    304: "Studio Portrait Increased Sharpness",
    512: "Velvia", 
    768: "Studio Portrait EX",
    1024: "Velvia",
    1280: "Pro Neg. Standard",
    1281: "Pro Neg. Hi",
    1536: "Classic Chrome",
    1792: "Eterna",
    2048: "Classic Negative",
    2304: "Bleach Bypass",
    2560: "Nostalgic Negative",
  },
};

/**
 * 사용자가 제공한 Fujifilm MakerNote 파싱 함수
 */
function parseFujifilmExif(exifData: any) {
  const OFFSET = 12;

  // Check if the MakerNote is present
  if (exifData && exifData.MakerNote) {
    const uint8Array = new Uint8Array(exifData.MakerNote);
    const buffer = uint8Array.buffer;
    const view = new DataView(buffer);

    const result: any = {};

    // Fujifilm MakerNote header check
    let startOffset = 0;
    const header = String.fromCharCode(...uint8Array.slice(0, 8));
    if (header === "FUJIFILM") {
      startOffset = view.getUint32(8, true); 
    }

    const tagCount = view.getUint16(startOffset, true); // little endian
    let offset = startOffset + 2;

    for (let i = 0; i < tagCount; i++) {
      // Check bounds
      if (offset + OFFSET > uint8Array.length) {
        console.warn(`Entry ${i} at offset ${offset} is out of bounds; parsing stopped.`);
        break;
      }

      const tag = view.getUint16(offset, true);
      const type = view.getUint16(offset + 2, true);
      const count = view.getUint32(offset + 4, true);

      // Check type is valid
      if (!(type in FUJIFILM_TYPE_SIZES)) {
        offset += OFFSET;
        continue;
      }

      const valueOffset = view.getUint32(offset + 8, true);
      const key = FUJIFILM_EXIF_TAGS[tag] || `Unknown_0x${tag.toString(16)}`;

      const size = FUJIFILM_TYPE_SIZES[type] || 1;
      const totalBytes = size * count;

      let value;

      // If the value fits in 4 bytes, it's stored directly
      if (totalBytes <= 4) {
        switch (type) {
          case 3: // SHORT
            value = view.getUint16(offset + 8, true);
            break;
          case 4: // LONG
            value = view.getUint32(offset + 8, true);
            break;
          case 9: // SLONG
            value = view.getInt32(offset + 8, true);
            break;
          case 2: // ASCII (up to 4 bytes)
            value = String.fromCharCode(...uint8Array.slice(offset + 8, offset + 8 + count)).replace(/\0/g, "");
            break;
          default:
            value = valueOffset;
        }
      } else {
        // Otherwise read from offset
        let start = valueOffset;
        if (type === 2) {
          // ASCII string
          value = String.fromCharCode(...uint8Array.slice(start, start + count)).replace(/\0/g, "");
        } else if (type === 3) {
          // SHORT array
          value = [];
          for (let j = 0; j < count; j++) {
            value.push(view.getUint16(start + j * 2, true));
          }
        } else if (type === 4) {
          // LONG array
          value = [];
          for (let j = 0; j < count; j++) {
            value.push(view.getUint32(start + j * 4, true));
          }
        } else {
          // Just return raw bytes
          value = [...uint8Array.slice(start, start + totalBytes)];
        }
      }

      result[key] = value;
      offset += OFFSET;
    }

    return result;
  }
}

/**
 * 사용자가 제공한 Fujifilm 데이터 정규화 함수
 */
function normalizeFujifilmExif(exifData: any) {
  if (!exifData) return;

  const normalized: any = {};

  for (const tag in exifData) {
    if (!tag.match(/^Exif\.Fujifilm\./)) continue; // Only process Fujifilm tags

    const value = exifData[tag];
    if (value === undefined || value === null) continue;

    // Map known tags to human-readable values
    if (FUJIFILM_EXIF_VALUE_MAP[tag]) {
      const mapping = FUJIFILM_EXIF_VALUE_MAP[tag];

      normalized[tag] =
        typeof mapping === "function"
          ? mapping(value)
          : mapping[value] || value;
    } else {
      normalized[tag] = value;
    }
  }

  return normalized;
}

export const parseExif = (file: File): Promise<ExifData> => {
  return new Promise((resolve) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const arrayBuffer = event?.target?.result as ArrayBuffer;
        const allTags = EXIF.readFromBinaryFile(arrayBuffer);

        const formatShutterSpeed = (shutterSpeed: any) => {
          if (!shutterSpeed) return undefined;
          if (shutterSpeed >= 1) return Math.round(shutterSpeed) + "s";
          return "1/" + Math.round(1 / shutterSpeed) + "s";
        };

        let lens = allTags.LensInfo || allTags.LensModel || allTags.LensMake || allTags.UndefinedTag_0xA434;
        
        if (Array.isArray(lens)) {
          if (lens.length >= 4) {
            const [minFoc, maxFoc, minF, maxF] = lens;
            const focal = minFoc === maxFoc ? `${minFoc}mm` : `${minFoc}-${maxFoc}mm`;
            const f = minF === maxF ? `f/${minF}` : `f/${minF}-${maxF}`;
            lens = `${focal} ${f}`;
          } else {
            lens = lens.join(' ');
          }
        }

        const data: ExifData = {
          make: allTags.Make,
          model: allTags.Model,
          lens: lens ? String(lens).trim() : undefined,
          fNumber: allTags.FNumber ? `f/${allTags.FNumber}` : undefined,
          shutterSpeed: formatShutterSpeed(allTags.ExposureTime),
          iso: allTags.ISOSpeedRatings ? `ISO ${allTags.ISOSpeedRatings}` : undefined,
          focalLength: allTags.FocalLength ? `${allTags.FocalLength}mm` : undefined,
          dateTime: allTags.DateTimeOriginal || allTags.DateTime,
        };

        // Fujifilm-specific film simulation extraction
        if (allTags.Make?.toLowerCase().includes('fujifilm')) {
          const fujifilmExifData = parseFujifilmExif(allTags);
          const normalized = normalizeFujifilmExif(fujifilmExifData);
          if (normalized) {
            data.filmSimulation = normalized["Exif.Fujifilm.FilmMode"];
          }
        }

        resolve(data);
      };

      reader.readAsArrayBuffer(file);
    } else {
      resolve({});
    }
  });
};

const formatDate = (dateStr: string | undefined, format: DateFormat) => {
  if (!dateStr) return undefined;
  const rawDate = dateStr.split(' ')[0].replace(/:/g, '-');
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return dateStr.split(' ')[0].replace(/:/g, '.');

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'MM.DD.YYYY': return `${mm}.${dd}.${yyyy}`;
    case 'DD.MM.YYYY': return `${dd}.${mm}.${yyyy}`;
    default: return `${yyyy}.${mm}.${dd}`;
  }
};

export const getExifPartsLine1 = (exif: ExifData, config: FrameConfig): string[] => {
  const parts = [];
  if (config.showMaker && exif.make) parts.push(exif.make.toUpperCase());
  if (config.showModel && exif.model) parts.push(exif.model.toUpperCase());
  if (config.showLens && exif.lens) parts.push(exif.lens.toUpperCase());
  return parts;
};

export const getExifPartsLine2 = (exif: ExifData, config: FrameConfig): string[] => {
  const parts = [];
  if (config.showDate && exif.dateTime) {
    const formatted = formatDate(exif.dateTime, config.dateFormat);
    if (formatted) parts.push(formatted);
  }
  if (config.showTime && exif.dateTime) {
    const timeStr = exif.dateTime.split(' ')[1]?.substring(0, 5);
    if (timeStr) parts.push(timeStr);
  }
  if (config.showExposure) {
    if (exif.shutterSpeed) parts.push(exif.shutterSpeed);
    if (exif.fNumber) parts.push(exif.fNumber);
  }
  if (config.showIso && exif.iso) parts.push(exif.iso);
  if (config.showFilmSimulation && exif.filmSimulation) parts.push(exif.filmSimulation.toUpperCase());
  return parts;
};
