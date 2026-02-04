
import React from 'react';
import { FrameConfig, DateFormat } from '../types';

interface SidebarProps {
  config: FrameConfig;
  setConfig: React.Dispatch<React.SetStateAction<FrameConfig>>;
  onReset: () => void;
  onUploadClick: () => void;
  isMobileInline?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onReset, onUploadClick, isMobileInline }) => {
  const toggleMeta = (key: keyof FrameConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const colors = [
    { name: 'White', value: '#FFFFFF', text: '#000000' },
    { name: 'Black', value: '#000000', text: '#FFFFFF' },
    { name: 'Cream', value: '#fdf5e6', text: '#000000' },
    { name: 'Silver', value: '#e5e5e5', text: '#000000' },
    { name: 'Anthracite', value: '#1c1c1e', text: '#FFFFFF' },
  ];

  const metaItems = [
    { key: 'showMaker', label: 'Maker', icon: 'manufacturing' },
    { key: 'showModel', label: 'Camera Model', icon: 'photo_camera' },
    { key: 'showLens', label: 'Lens Info', icon: 'camera' },
    { key: 'showDate', label: 'Date', icon: 'calendar_today' },
    { key: 'showTime', label: 'Time', icon: 'schedule' },
    { key: 'showExposure', label: 'Exposure', icon: 'shutter_speed' },
    { key: 'showIso', label: 'ISO', isTextIcon: true },
    { key: 'showLocation', label: 'Location', icon: 'location_on' },
  ];

  const dateFormats: DateFormat[] = ['YYYY.MM.DD', 'MM.DD.YYYY', 'DD.MM.YYYY'];

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-background-dark ${isMobileInline ? 'max-h-none' : ''}`}>
      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">Configuration</h3>
          {!isMobileInline && <button onClick={onReset} className="text-primary text-xs font-bold hover:underline">Reset</button>}
        </div>

        {/* Metadata Section */}
        <section>
          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4">Metadata to Display</h4>
          <div className="space-y-1">
            {metaItems.map(item => (
              <div 
                key={item.key}
                onClick={() => toggleMeta(item.key as any)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#233c48] flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.isTextIcon ? (
                      <span className="text-[10px] font-black tracking-tighter">ISO</span>
                    ) : (
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${config[item.key as keyof FrameConfig] ? 'bg-primary' : 'bg-slate-200 dark:bg-[#233c48]'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${config[item.key as keyof FrameConfig] ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conditional Date Format */}
        {config.showDate && (
          <section className="animate-in fade-in slide-in-from-top-2 duration-300">
             <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4">Date Format</h4>
             <div className="grid grid-cols-1 gap-2">
                {dateFormats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setConfig(prev => ({ ...prev, dateFormat: fmt }))}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${config.dateFormat === fmt ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                  >
                    {fmt}
                  </button>
                ))}
             </div>
          </section>
        )}

        {/* Vendor Specific */}
        <section>
          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4">Vendor Specific</h4>
          <div 
            onClick={() => toggleMeta('showFilmSimulation')}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#233c48] flex items-center justify-center text-slate-500 dark:text-slate-300">
                <span className="material-symbols-outlined text-xl">filter_vintage</span>
              </div>
              <div>
                <p className="text-sm font-medium">Film Simulation</p>
                <p className="text-[10px] opacity-40">e.g. Fujifilm MakerNotes</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${config.showFilmSimulation ? 'bg-primary' : 'bg-slate-200 dark:bg-[#233c48]'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${config.showFilmSimulation ? 'left-7' : 'left-1'}`}></div>
            </div>
          </div>
        </section>

        {/* Frame Style */}
        <section className="space-y-6 pb-4">
          <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4">Frame Style</h4>
          
          <div 
            onClick={() => toggleMeta('roundCorners')}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#233c48] flex items-center justify-center text-slate-500 dark:text-slate-300">
                <span className="material-symbols-outlined text-xl">rounded_corner</span>
              </div>
              <span className="text-sm font-medium">Round Corners</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${config.roundCorners ? 'bg-primary' : 'bg-slate-200 dark:bg-[#233c48]'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${config.roundCorners ? 'left-7' : 'left-1'}`}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium opacity-80">Thickness</span>
              <span className="text-primary font-bold">{config.thickness}px</span>
            </div>
            <input 
              type="range" min="10" max="100" value={config.thickness} 
              onChange={(e) => setConfig(prev => ({ ...prev, thickness: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#233c48] rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium opacity-80">Frame Color</span>
            <div className="flex flex-wrap gap-4">
              {colors.map(c => (
                <button 
                  key={c.value}
                  onClick={() => setConfig(prev => ({ ...prev, color: c.value, textColor: c.text }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${config.color === c.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium opacity-80">Text Alignment</span>
            <div className="flex bg-slate-100 dark:bg-[#233c48] p-1 rounded-xl">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => setConfig(prev => ({ ...prev, alignment: align }))}
                  className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${config.alignment === align ? 'bg-white dark:bg-[#101c22] text-primary shadow-sm' : 'text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">
                    {align === 'left' ? 'format_align_left' : align === 'center' ? 'format_align_center' : 'format_align_right'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sidebar;
