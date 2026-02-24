import React, { useState } from 'react';
import { Type, Image as ImageIcon, Shapes, Upload, Search, X, ChevronLeft, Hexagon, Triangle, Circle, Square, Star, Heart } from 'lucide-react';
import { ElementType } from '../types';

interface LeftSidebarProps {
  onAddElement: (type: ElementType, content?: string, extraStyle?: any) => void;
}

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
  'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=400&q=80',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
  'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=400&q=80',
];

const TEXT_STYLES = [
  { label: 'Add a heading', fontSize: '32px', fontWeight: 'bold', content: 'Heading' },
  { label: 'Add a subheading', fontSize: '24px', fontWeight: '600', content: 'Subheading' },
  { label: 'Add body text', fontSize: '16px', fontWeight: 'normal', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];

const SHAPES_LIB = [
  // Filled Shapes
  { type: 'box', icon: <div className="w-8 h-8 bg-gray-300 rounded-sm" />, label: 'Square (Filled)', isOutlined: false },
  { type: 'circle', icon: <div className="w-8 h-8 bg-gray-300 rounded-full" />, label: 'Circle (Filled)', isOutlined: false },
  { 
    type: 'svg', 
    path: 'M 50 5 L 95 90 L 5 90 Z', 
    icon: <Triangle className="text-gray-300 fill-current w-8 h-8" />, 
    label: 'Triangle (Filled)',
    isOutlined: false
  },
  {
    type: 'svg',
    path: 'M 50 0 L 61 35 H 98 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 H 39 Z',
    icon: <Star className="text-gray-300 fill-current w-8 h-8" />,
    label: 'Star (Filled)',
    isOutlined: false
  },
  {
    type: 'svg',
    path: 'M50 88.9 L16.7 55.6 C7.2 46.1 7.2 30.9 16.7 21.4 S41.4 21.4 50.9 30.9 L50 31.8 L49.1 30.9 C58.6 21.4 73.8 21.4 83.3 21.4 S92.8 46.1 83.3 55.6 L50 88.9 Z',
    icon: <Heart className="text-gray-300 fill-current w-8 h-8" />,
    label: 'Heart (Filled)',
    isOutlined: false
  },
  {
    type: 'svg',
    path: 'M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z',
    icon: <Hexagon className="text-gray-300 fill-current w-8 h-8" />,
    label: 'Hexagon (Filled)',
    isOutlined: false
  },
  // Outlined Shapes
  { type: 'box', icon: <div className="w-8 h-8 border-2 border-gray-300 rounded-sm" />, label: 'Square (Outlined)', isOutlined: true },
  { type: 'circle', icon: <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />, label: 'Circle (Outlined)', isOutlined: true },
  { 
    type: 'svg', 
    path: 'M 50 5 L 95 90 L 5 90 Z', 
    icon: <Triangle className="text-gray-300 stroke-current stroke-2 fill-none w-8 h-8" />, 
    label: 'Triangle (Outlined)',
    isOutlined: true
  },
  {
    type: 'svg',
    path: 'M 50 0 L 61 35 H 98 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 H 39 Z',
    icon: <Star className="text-gray-300 stroke-current stroke-2 fill-none w-8 h-8" />,
    label: 'Star (Outlined)',
    isOutlined: true
  },
  {
    type: 'svg',
    path: 'M50 88.9 L16.7 55.6 C7.2 46.1 7.2 30.9 16.7 21.4 S41.4 21.4 50.9 30.9 L50 31.8 L49.1 30.9 C58.6 21.4 73.8 21.4 83.3 21.4 S92.8 46.1 83.3 55.6 L50 88.9 Z',
    icon: <Heart className="text-gray-300 stroke-current stroke-2 fill-none w-8 h-8" />,
    label: 'Heart (Outlined)',
    isOutlined: true
  },
  {
    type: 'svg',
    path: 'M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z',
    icon: <Hexagon className="text-gray-300 stroke-current stroke-2 fill-none w-8 h-8" />,
    label: 'Hexagon (Outlined)',
    isOutlined: true
  },
  
  // Blobs
  {
    type: 'svg',
    path: 'M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,72.4,33.5C62.6,45.5,54.3,56.7,43.3,64.8C32.3,72.9,18.6,77.9,5.2,76.1C-8.2,74.4,-21.3,65.9,-33.4,57.7C-45.5,49.5,-56.6,41.6,-65.2,31.2C-73.8,20.8,-79.9,7.9,-78.9,-4.6C-77.9,-17.1,-69.8,-29.2,-60.2,-39.8C-50.6,-50.4,-39.5,-59.5,-27.4,-67.6C-15.3,-75.7,-2.2,-82.8,11.3,-82.4',
    icon: <svg viewBox="0 0 200 200" className="w-8 h-8 fill-gray-300"><path transform="translate(100 100) scale(0.4)" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,72.4,33.5C62.6,45.5,54.3,56.7,43.3,64.8C32.3,72.9,18.6,77.9,5.2,76.1C-8.2,74.4,-21.3,65.9,-33.4,57.7C-45.5,49.5,-56.6,41.6,-65.2,31.2C-73.8,20.8,-79.9,7.9,-78.9,-4.6C-77.9,-17.1,-69.8,-29.2,-60.2,-39.8C-50.6,-50.4,-39.5,-59.5,-27.4,-67.6C-15.3,-75.7,-2.2,-82.8,11.3,-82.4" /></svg>,
    label: 'Blob 1',
    isOutlined: false
  },
  {
    type: 'svg',
    path: 'M38.1,-64.6C49.5,-59.4,59.1,-50.3,67.6,-39.9C76.1,-29.5,83.5,-17.8,83.1,-6.3C82.7,5.2,74.5,16.5,65.8,26.7C57.1,36.9,47.9,46,37.3,52.4C26.7,58.8,14.7,62.5,2,63.1C-10.7,63.7,-24.1,61.2,-35.3,54.8C-46.5,48.4,-55.5,38.1,-63.4,26.6C-71.3,15.1,-78.1,2.4,-77.6,-10.1C-77.1,-22.6,-69.3,-34.9,-59.5,-44.6C-49.7,-54.3,-37.9,-61.4,-26.1,-66.1C-14.3,-70.8,-2.5,-73.1,10,-72.1',
    icon: <svg viewBox="0 0 200 200" className="w-8 h-8 fill-gray-300"><path transform="translate(100 100) scale(0.4)" d="M38.1,-64.6C49.5,-59.4,59.1,-50.3,67.6,-39.9C76.1,-29.5,83.5,-17.8,83.1,-6.3C82.7,5.2,74.5,16.5,65.8,26.7C57.1,36.9,47.9,46,37.3,52.4C26.7,58.8,14.7,62.5,2,63.1C-10.7,63.7,-24.1,61.2,-35.3,54.8C-46.5,48.4,-55.5,38.1,-63.4,26.6C-71.3,15.1,-78.1,2.4,-77.6,-10.1C-77.1,-22.6,-69.3,-34.9,-59.5,-44.6C-49.7,-54.3,-37.9,-61.4,-26.1,-66.1C-14.3,-70.8,-2.5,-73.1,10,-72.1" /></svg>,
    label: 'Blob 2',
    isOutlined: false
  },
  {
      type: 'line',
      icon: <div className="w-8 h-0.5 bg-gray-300"></div>,
      label: 'Line',
      isOutlined: false
  }
];

const FUN_TEXTS = [
  { content: 'SPECIAL OFFER', color: '#ef4444', fontFamily: 'Anton, sans-serif', fontSize: '28px' },
  { content: 'BUY ONE GET ONE', color: '#bef264', fontFamily: 'Oswald, sans-serif', fontWeight: 'bold', fontSize: '24px' },
  { content: 'Family Friendly', color: '#c084fc', fontFamily: 'Pacifico, cursive', fontSize: '24px' },
  { content: 'Winter Collection', color: '#60a5fa', fontFamily: 'Playfair Display, serif', fontWeight: 'bold', fontSize: '24px' },
  { content: 'FOLLOW US', color: '#ffffff', fontFamily: 'Anton, sans-serif', letterSpacing: '2px', fontSize: '28px' },
  { content: 'DOWNLOAD NOW', color: '#4ade80', fontFamily: 'Montserrat, sans-serif', fontWeight: '900', fontSize: '20px' },
  { content: 'COMING SOON', color: '#60a5fa', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', fontSize: '22px' },
  { content: "Don't miss out!", color: '#facc15', fontFamily: 'Caveat, cursive', fontSize: '32px' },
  { content: 'SALE ENDS SOON', color: '#fb923c', fontFamily: 'Anton, sans-serif', fontStyle: 'italic', fontSize: '24px' },
  { content: 'Premium Quality', color: '#a78bfa', fontFamily: 'Playfair Display, serif', fontSize: '24px' },
  { content: 'Thank you!', color: '#f472b6', fontFamily: 'Caveat, cursive', fontSize: '28px' },
  { content: 'JOIN US TODAY', color: '#818cf8', fontFamily: 'Oswald, sans-serif', fontSize: '24px' },
  { content: 'BEST SELLER', color: '#38bdf8', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', border: '2px solid #38bdf8', padding: '5px', fontSize: '20px' },
  { content: 'Made with love', color: '#fbbf24', fontFamily: 'Pacifico, cursive', fontSize: '22px' },
  { content: 'LIMITED EDITION', color: '#f87171', fontFamily: 'Abril Fatface, cursive', fontSize: '24px' },
  { content: 'FESTIVAL', color: '#e879f9', fontFamily: 'Lobster, cursive', fontSize: '28px' },
  { content: 'Fresh Arrival', color: '#fbbf24', fontFamily: 'Sacramento, cursive', fontSize: '28px' },
  { content: 'Handmade Goods', color: '#86efac', fontFamily: 'Playfair Display, serif', fontWeight: 'bold', fontSize: '22px' },
];

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAddElement }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'shapes' | null>(null);

  const toggleTab = (tab: 'text' | 'images' | 'shapes') => {
    setActiveTab(current => current === tab ? null : tab);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddElement('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full transition-all duration-300 ease-in-out">
      {/* Icon Rail (Always Visible) */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-6 text-slate-400 border-r border-slate-800 z-30 flex-shrink-0">
        <button 
          onClick={() => toggleTab('text')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'text' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <Type size={20} />
          <span className="text-[10px] font-medium">Text</span>
        </button>
        <button 
          onClick={() => toggleTab('images')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'images' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <ImageIcon size={20} />
          <span className="text-[10px] font-medium">Images</span>
        </button>
        <button 
          onClick={() => toggleTab('shapes')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'shapes' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <Shapes size={20} />
          <span className="text-[10px] font-medium">Shapes</span>
        </button>
      </div>

      {/* Panel Content (Collapsible) */}
      {activeTab && (
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-20 animate-in slide-in-from-left-5 duration-200">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
             <h3 className="text-white font-semibold capitalize">{activeTab}</h3>
             <button onClick={() => setActiveTab(null)} className="text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
             </button>
          </div>

          <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
            {activeTab === 'text' && (
              <div className="space-y-6">
                 <div className="space-y-3">
                    {TEXT_STYLES.map((style, i) => (
                      <button 
                        key={i}
                        onClick={() => onAddElement('text', style.content, { fontSize: style.fontSize, fontWeight: style.fontWeight })}
                        className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded text-gray-200 transition-colors"
                        style={{ fontSize: style.fontSize === '32px' ? '20px' : style.fontSize === '24px' ? '16px' : '14px', fontWeight: style.fontWeight as any }}
                      >
                        {style.label}
                      </button>
                    ))}
                 </div>
                 
                 <h4 className="text-gray-400 text-sm font-medium pt-2">Combinations</h4>
                 <div className="grid grid-cols-2 gap-2">
                    {FUN_TEXTS.map((style, i) => (
                      <button 
                        key={i}
                        onClick={() => onAddElement('text', style.content, { ...style })}
                        className="h-20 bg-slate-900/50 hover:bg-slate-900 rounded flex items-center justify-center p-2 text-center break-words transition-colors border border-slate-700 hover:border-slate-600"
                        style={{ 
                          color: style.color, 
                          fontFamily: style.fontFamily, 
                          fontStyle: style.fontStyle,
                          fontWeight: style.fontWeight as any,
                          border: style.border 
                        }}
                      >
                        {style.content}
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                 {/* Upload */}
                 <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-center cursor-pointer relative bg-slate-750">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-blue-400 mb-2 flex justify-center"><Upload size={24} /></div>
                    <span className="text-xs text-gray-400 block">Upload media</span>
                 </div>

                 {/* Unsplash Gallery Mock */}
                 <div>
                   <div className="flex items-center gap-2 bg-slate-700 p-2 rounded mb-3">
                     <Search size={14} className="text-gray-400" />
                     <input type="text" placeholder="Search Unsplash" className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-gray-500" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                     {UNSPLASH_IMAGES.map((url, i) => (
                       <button 
                         key={i}
                         onClick={() => onAddElement('image', url)}
                         className="rounded overflow-hidden hover:opacity-80 transition-opacity h-24"
                       >
                         <img src={url} alt="Stock" className="w-full h-full object-cover" />
                       </button>
                     ))}
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'shapes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {SHAPES_LIB.map((shape, i) => (
                    <button 
                        key={i}
                        onClick={() => onAddElement(
                            shape.type as ElementType, 
                            shape.path, 
                            { 
                                backgroundColor: shape.isOutlined ? 'transparent' : '#d1d5db',
                                borderColor: shape.isOutlined ? '#9ca3af' : 'transparent',
                                borderWidth: shape.isOutlined ? '4px' : '0px',
                                borderRadius: shape.type === 'circle' ? '50%' : '0' 
                            }
                        )}
                        className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors group relative"
                        title={shape.label}
                    >
                        <div className="group-hover:scale-110 transition-transform">
                            {shape.icon}
                        </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;