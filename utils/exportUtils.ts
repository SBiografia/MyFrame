
import { Photo, FrameConfig } from '../types';
import { getExifPartsLine1, getExifPartsLine2 } from './exifUtils';

/**
 * 메타데이터 항목 단위로 끊어지지 않게 줄바꿈하여 그리는 함수
 */
const drawSmartWrappedText = (
  ctx: CanvasRenderingContext2D,
  parts: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: string
): number => {
  if (parts.length === 0) return 0;

  let currentLine: string[] = [];
  let lines: string[][] = [];

  for (let i = 0; i < parts.length; i++) {
    const testLine = [...currentLine, parts[i]].join(' · ');
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [parts[i]];
    } else {
      currentLine.push(parts[i]);
    }
  }
  lines.push(currentLine);

  const drawLines = lines.slice(0, 2);
  for (let i = 0; i < drawLines.length; i++) {
    const lineText = drawLines[i].join(' · ');
    ctx.fillText(lineText, x, y + (i * lineHeight));
  }
  
  return drawLines.length;
};

export const exportToJpg = async (photo: Photo, config: FrameConfig) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Canvas context not available");

      const scaleFactor = img.width / 1000;
      const thickness = config.thickness * scaleFactor;
      
      const baseFontSize = img.width / 45;
      const line1FontSize = baseFontSize;
      const line2FontSize = baseFontSize * 0.75;
      const line1Spacing = line1FontSize * 1.25;
      const line2Spacing = line2FontSize * 1.25;

      const parts1 = getExifPartsLine1(photo.exif, config);
      const parts2 = getExifPartsLine2(photo.exif, config);
      
      const textTopMargin = thickness * 0.4; 
      const textBottomPadding = thickness * 0.4; 
      
      canvas.width = img.width + (thickness * 2);
      
      const maxWidth = img.width;
      ctx.font = `bold ${line1FontSize}px Inter, sans-serif`;
      
      let l1Lines: string[][] = [];
      let currentL1: string[] = [];
      parts1.forEach(p => {
        if (ctx.measureText([...currentL1, p].join(' · ')).width > maxWidth && currentL1.length > 0) {
          l1Lines.push(currentL1);
          currentL1 = [p];
        } else { currentL1.push(p); }
      });
      l1Lines.push(currentL1);
      const l1Count = parts1.length > 0 ? Math.min(l1Lines.length, 2) : 0;

      ctx.font = `medium ${line2FontSize}px Inter, sans-serif`;
      let l2Lines: string[][] = [];
      let currentL2: string[] = [];
      parts2.forEach(p => {
        if (ctx.measureText([...currentL2, p].join(' · ')).width > maxWidth && currentL2.length > 0) {
          l2Lines.push(currentL2);
          currentL2 = [p];
        } else { currentL2.push(p); }
      });
      l2Lines.push(currentL2);
      const l2Count = parts2.length > 0 ? Math.min(l2Lines.length, 2) : 0;

      const totalTextHeight = (l1Count * line1Spacing) + (l2Count * line2Spacing);
      
      // 캔버스 높이 결정
      canvas.height = img.height + thickness + textTopMargin + totalTextHeight + textBottomPadding;

      ctx.fillStyle = config.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageX = thickness;
      const imageY = thickness;
      
      if (config.roundCorners) {
        const radius = 24 * scaleFactor;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(imageX + radius, imageY);
        ctx.lineTo(imageX + img.width - radius, imageY);
        ctx.quadraticCurveTo(imageX + img.width, imageY, imageX + img.width, imageY + radius);
        ctx.lineTo(imageX + img.width, imageY + img.height - radius);
        ctx.quadraticCurveTo(imageX + img.width, imageY + img.height, imageX + img.width - radius, imageY + img.height);
        ctx.lineTo(imageX + radius, imageY + img.height);
        ctx.quadraticCurveTo(imageX, imageY + img.height, imageX, imageY + img.height - radius);
        ctx.lineTo(imageX, imageY + radius);
        ctx.quadraticCurveTo(imageX, imageY, imageX + radius, imageY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imageX, imageY);
        ctx.restore();
      } else {
        ctx.drawImage(img, imageX, imageY);
      }

      ctx.fillStyle = config.textColor;
      ctx.textBaseline = 'top';
      const align = config.alignment;
      
      let textX = thickness + (img.width / 2);
      if (align === 'left') textX = thickness + (thickness * 0.1);
      if (align === 'right') textX = canvas.width - thickness - (thickness * 0.1);
      ctx.textAlign = align as CanvasTextAlign;

      let currentY = img.height + thickness + textTopMargin;

      if (parts1.length > 0) {
        ctx.font = `bold ${line1FontSize}px Inter, sans-serif`;
        ctx.globalAlpha = 0.9;
        const linesUsed = drawSmartWrappedText(ctx, parts1, textX, currentY, maxWidth, line1Spacing, align);
        currentY += linesUsed * line1Spacing;
      }

      if (parts2.length > 0) {
        ctx.font = `medium ${line2FontSize}px Inter, sans-serif`;
        ctx.globalAlpha = 0.6;
        drawSmartWrappedText(ctx, parts2, textX, currentY, maxWidth, line2Spacing, align);
      }

      canvas.toBlob((blob) => {
        if (!blob) return reject("Blob creation failed");
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `MyFrame_${photo.file.name.replace(/\.[^/.]+$/, "")}.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/jpeg', 0.95);
    };
    img.onerror = () => reject("Image loading failed");
    img.src = photo.previewUrl;
  });
};
