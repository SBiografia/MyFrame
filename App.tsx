
import React, { useState, useRef } from 'react';
import { Photo, FrameConfig, DEFAULT_CONFIG } from './types';
import { parseExif } from './utils/exifUtils';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import BatchList from './components/BatchList';
import { exportToJpg } from './utils/exportUtils';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [config, setConfig] = useState<FrameConfig>(DEFAULT_CONFIG);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const exif = await parseExif(file);
      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        exif,
      });
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    if (photos.length === 0 && newPhotos.length > 0) {
      setSelectedIndex(0);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (selectedIndex >= filtered.length) {
        setSelectedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const handleExport = async (mode: 'selected' | 'all') => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const targets = mode === 'selected' ? [photos[selectedIndex]] : photos;
      for (const photo of targets) {
        await exportToJpg(photo, config);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const currentPhoto = photos[selectedIndex];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark overflow-y-auto">
        <Sidebar 
          config={config} 
          setConfig={setConfig} 
          onReset={() => setConfig(DEFAULT_CONFIG)}
          onUploadClick={() => fileInputRef.current?.click()}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-background-dark z-30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-bold">photo_frame</span>
            <h1 className="text-lg font-bold">My Frame</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <input type="file" multiple accept="image/jpeg" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            
            <div className="relative">
              <button 
                disabled={photos.length === 0 || isExporting}
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-primary text-white text-sm font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">{isExporting ? 'sync' : 'ios_share'}</span>
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <button onClick={() => handleExport('selected')} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-slate-400">image</span> Selected Photo
                  </button>
                  <button onClick={() => handleExport('all')} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-slate-400">burst_mode</span> All Photos ({photos.length})
                  </button>
                </div>
              )}
            </div>

            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-[#0c141a]">
          {/* Scrollable Preview and Mobile Sidebar */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8 flex flex-col items-center">
              {currentPhoto ? (
                <div className="w-full flex flex-col items-center">
                  <Preview photo={currentPhoto} config={config} />
                  
                  {/* Mobile Sidebar Content - Rendered below preview */}
                  <div className="w-full mt-8 md:hidden bg-white dark:bg-background-dark rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                    <Sidebar 
                      config={config} 
                      setConfig={setConfig} 
                      onReset={() => setConfig(DEFAULT_CONFIG)}
                      onUploadClick={() => fileInputRef.current?.click()}
                      isMobileInline
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-xl aspect-[4/5] rounded-3xl border-4 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-4 mt-12 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <span className="material-symbols-outlined text-6xl">upload_file</span>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Upload your photos</p>
                    <p className="text-sm">Click here to start adding JPG files</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Batch Thumbnails - Always at bottom for mobile, side for desktop */}
          <div className="h-28 md:h-full md:w-32 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto shrink-0 z-20">
            <BatchList 
              photos={photos} 
              selectedIndex={selectedIndex} 
              onSelect={setSelectedIndex} 
              onRemove={removePhoto} 
              onAddClick={() => fileInputRef.current?.click()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
