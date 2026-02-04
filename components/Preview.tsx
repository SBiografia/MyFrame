
import React, { useMemo } from 'react';
import { Photo, FrameConfig } from '../types';
import { getExifPartsLine1, getExifPartsLine2 } from '../utils/exifUtils';

interface PreviewProps {
  photo: Photo;
  config: FrameConfig;
}

const Preview: React.FC<PreviewProps> = ({ photo, config }) => {
  const parts1 = getExifPartsLine1(photo.exif, config);
  const parts2 = getExifPartsLine2(photo.exif, config);

  const paddingValue = useMemo(() => {
    return (config.thickness / 10); 
  }, [config.thickness]);

  const borderRadius = config.roundCorners ? '2.4%' : '0px';

  const renderParts = (parts: string[], baseClass: string) => {
    if (parts.length === 0) return null;
    return (
      <div className={`flex flex-wrap gap-x-[0.8em] gap-y-0 ${config.alignment === 'center' ? 'justify-center' : config.alignment === 'right' ? 'justify-end' : 'justify-start'} ${baseClass}`}>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <span className="whitespace-nowrap inline-block">{part}</span>
            {idx < parts.length - 1 && <span className="opacity-30 inline-block">·</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[750px] mx-auto flex items-center justify-center p-4">
      <div 
        className="shadow-2xl transition-all duration-300 flex flex-col w-full overflow-hidden"
        style={{ 
          backgroundColor: config.color,
          borderRadius: borderRadius,
          paddingTop: `${paddingValue}%`,
          paddingLeft: `${paddingValue}%`,
          paddingRight: `${paddingValue}%`,
          paddingBottom: `${paddingValue * 0.4}%`, 
          border: `1px solid ${config.color === '#FFFFFF' ? '#e2e8f0' : 'transparent'}`,
          fontSize: 'min(2.2vw, 16px)' 
        }}
      >
        <div className="relative overflow-hidden" style={{ borderRadius: config.roundCorners ? '1.2%' : '0px' }}>
          <img 
            src={photo.previewUrl} 
            alt="Preview" 
            className="w-full h-auto object-contain block shadow-sm"
          />
        </div>
        
        <div 
          className="flex flex-col gap-[0.2em]"
          style={{ 
            paddingTop: `${paddingValue * 0.4}%`,
            paddingBottom: `${paddingValue * 0.4}%`,
            color: config.textColor,
            textAlign: config.alignment as any
          }}
        >
          {renderParts(parts1, "font-bold tracking-[0.05em] uppercase opacity-90 leading-tight text-[1em]")}
          {renderParts(parts2, "font-medium tracking-[0.1em] uppercase opacity-60 leading-tight text-[0.75em]")}
        </div>
      </div>
    </div>
  );
};

export default Preview;
