
import React from 'react';
import { Photo } from '../types';

interface BatchListProps {
  photos: Photo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

const BatchList: React.FC<BatchListProps> = ({ photos, selectedIndex, onSelect, onRemove, onAddClick }) => {
  return (
    <div className="flex md:flex-col gap-3 h-full">
      {photos.map((photo, index) => (
        <div 
          key={photo.id} 
          className={`relative shrink-0 group cursor-pointer transition-all duration-300 ${selectedIndex === index ? 'scale-100 ring-4 ring-primary ring-offset-2 dark:ring-offset-[#101c22]' : 'scale-90 opacity-60 hover:opacity-100'}`}
          onClick={() => onSelect(index)}
        >
          <div className="w-20 h-20 md:w-full md:aspect-square overflow-hidden rounded-xl bg-slate-200 dark:bg-[#233c48]">
            <img src={photo.previewUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(photo.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
          {selectedIndex === index && (
             <div className="absolute inset-0 bg-primary/20 rounded-xl pointer-events-none"></div>
          )}
        </div>
      ))}
      <div 
        onClick={onAddClick}
        className="shrink-0 w-20 h-20 md:w-full md:aspect-square flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#233c48]/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>
      </div>
    </div>
  );
};

export default BatchList;
