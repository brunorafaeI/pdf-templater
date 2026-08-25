import React, { useState, useRef, useEffect } from 'react'
import { EditorElement } from '@/types'
import { LucideIconComponent } from '@/components/icon'
import {
  hexToHsva,
  hsvaToHex,
  DEFAULT_COLORS,
  recentColorsStore,
} from '@/utils/color'

// --- Render Swatch Helper ---
interface ColorSwatchProps {
  hex: string;
  onClick: () => void;
  active?: boolean;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ hex, onClick, active }) => (
  <button
      onClick={onClick}
      className={`w-6 h-6 rounded hover:scale-110 transition-transform focus:outline-none relative border border-gray-200 overflow-hidden ${active ? 'ring-2 ring-blue-500 ring-offset-0.5 z-10' : ''}`}
      title={hex}
  >
      <div className="absolute inset-0" style={{ backgroundColor: hex }}></div>
  </button>
);

const NoFillButton: React.FC<{ onClick: () => void; active: boolean }> = ({ onClick, active }) => (
    <button 
        onClick={onClick}
        className={`w-6 h-6 rounded border border-gray-300 relative overflow-hidden hover:bg-gray-50 transition-all bg-white ${active ? 'ring-2 ring-blue-500 ring-offset-0.5' : ''}`}
        title="No Fill"
    >
        <div className="absolute inset-0 bg-white"></div>
        <div className="absolute inset-0 top-1/2 left-1/2 w-[140%] h-[1.5px] bg-red-500 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </button>
);

interface PaletteSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const PaletteSection: React.FC<PaletteSectionProps> = ({ title, isOpen, onToggle, children, action }) => (
  <>
    <div 
      className="flex items-center justify-between p-2 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 select-none uppercase tracking-wide">
        {isOpen ? <LucideIconComponent icon="ChevronDown" size={10} /> : <LucideIconComponent icon="ChevronRight" size={10} />}
        {title}
      </div>
      {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
    </div>
    {isOpen && <div className="px-2 pb-3">{children}</div>}
  </>
);

interface CustomColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
  allElements: EditorElement[]; // To derive template colors
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange, allElements }) => {
  const [hsva, setHsva] = useState(hexToHsva(color));
  const [mode, setMode] = useState<'single' | 'gradient'>('single');
  
  // Palette collapsible states
  const [openSections, setOpenSections] = useState({
    recent: true,
    template: true,
    default: true
  });
  
  // Recent colors state (synced with store)
  const [recents, setRecents] = useState<string[]>(recentColorsStore);

  // Sync state if external color changes
  useEffect(() => {
    if (color && color !== 'transparent') {
        setHsva(hexToHsva(color));
    } else if (color === 'transparent') {
        setHsva({ h: 0, s: 0, v: 0, a: 0 });
    }
  }, [color]);

  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  
  const isDraggingSatVal = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  // Calculate Template Colors (Unique colors used in the document)
  const templateColors = Array.from(new Set(allElements.flatMap(el => {
    const colors: string[] = [];
    if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') colors.push(el.style.backgroundColor.toString());
    if (el.style.borderColor && el.style.borderColor !== 'transparent') colors.push(el.style.borderColor.toString());
    if (el.style.color) colors.push(el.style.color.toString());
    return colors;
  }))).slice(0, 16); // Limit

  const updateColor = (newHsva: { h: number, s: number, v: number, a: number }, commit = false) => {
    setHsva(newHsva);
    const hex = hsvaToHex(newHsva.h, newHsva.s, newHsva.v, newHsva.a);
    onChange(hex);
    if (commit && !recentColorsStore.includes(hex) && hex !== 'transparent') {
        recentColorsStore.unshift(hex);
        if (recentColorsStore.length > 10) recentColorsStore.pop();
        setRecents([...recentColorsStore]);
    }
  };

  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) return;
    try {
        // @ts-expect-error - EyeDropper is not in TypeScript DOM lib
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        updateColor(hexToHsva(result.sRGBHex), true);
    } catch {
        console.log('EyeDropper canceled');
    }
  };

  // --- Drag Logic ---
  const handleSatValMove = (e: MouseEvent | React.MouseEvent) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    updateColor({ ...hsva, s, v });
  };
  
  const handleSatValMouseDown = (e: React.MouseEvent) => {
    isDraggingSatVal.current = true;
    handleSatValMove(e);
    document.addEventListener('mousemove', handleSatValWindowMove);
    document.addEventListener('mouseup', handleSatValMouseUp);
  };
  const handleSatValWindowMove = (e: MouseEvent) => handleSatValMove(e);
  const handleSatValMouseUp = () => {
    isDraggingSatVal.current = false;
    document.removeEventListener('mousemove', handleSatValWindowMove);
    document.removeEventListener('mouseup', handleSatValMouseUp);
  };

  const handleHueMove = (e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const h = (x / rect.width) * 360;
    updateColor({ ...hsva, h });
  };
  
  const handleHueMouseDown = (e: React.MouseEvent) => {
    isDraggingHue.current = true;
    handleHueMove(e);
    document.addEventListener('mousemove', handleHueWindowMove);
    document.addEventListener('mouseup', handleHueMouseUp);
  };
  const handleHueWindowMove = (e: MouseEvent) => handleHueMove(e);
  const handleHueMouseUp = () => {
    isDraggingHue.current = false;
    document.removeEventListener('mousemove', handleHueWindowMove);
    document.removeEventListener('mouseup', handleHueMouseUp);
  };

  const handleAlphaMove = (e: MouseEvent | React.MouseEvent) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const a = (x / rect.width);
    updateColor({ ...hsva, a });
  };
  
  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    isDraggingAlpha.current = true;
    handleAlphaMove(e);
    document.addEventListener('mousemove', handleAlphaWindowMove);
    document.addEventListener('mouseup', handleAlphaMouseUp);
  };
  const handleAlphaWindowMove = (e: MouseEvent) => handleAlphaMove(e);
  const handleAlphaMouseUp = () => {
    isDraggingAlpha.current = false;
    document.removeEventListener('mousemove', handleAlphaWindowMove);
    document.removeEventListener('mouseup', handleAlphaMouseUp);
  };

  return (
    <div 
        className="flex w-[480px] h-[280px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden text-slate-800 font-sans" 
        onMouseDown={e => e.stopPropagation()}
    >
      {/* Left Column: Picker Controls */}
      <div className="w-[240px] p-3 flex flex-col gap-3 border-r border-gray-100 bg-white z-10 shrink-0">
        
        {/* Header: Tabs & Tools */}
        <div className="flex items-center justify-between">
             <div className="flex gap-2">
                 <button 
                    onClick={() => setMode('single')}
                    className={`text-[13px] font-semibold transition-colors ${mode === 'single' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Single
                 </button>
                 <button 
                    onClick={() => setMode('gradient')}
                    className={`text-[13px] font-semibold transition-colors ${mode === 'gradient' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    Gradient
                 </button>
             </div>
             <div className="flex items-center gap-1.5">
                  <button 
                    className="p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors" 
                    title="Pick Color"
                    onClick={handleEyeDropper}
                  >
                    <LucideIconComponent icon="Pipette" size={14} />
                  </button>
                  <NoFillButton 
                    onClick={() => {
                        onChange('transparent');
                        setHsva({ h: 0, s: 0, v: 0, a: 0 });
                    }} 
                    active={color === 'transparent'} 
                  />
             </div>
        </div>

        {mode === 'single' ? (
        <>
            {/* Saturation/Value Area */}
            <div 
                ref={satValRef}
                className="w-full h-[120px] rounded-md relative cursor-crosshair overflow-hidden shadow-inner border border-gray-200"
                style={{
                backgroundColor: `hsl(${hsva.h}, 100%, 50%)`,
                backgroundImage: `
                    linear-gradient(to right, #fff, transparent),
                    linear-gradient(to top, #000, transparent)
                `
                }}
                onMouseDown={handleSatValMouseDown}
            >
                <div 
                className="absolute w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm -ml-[7px] -mt-[7px] pointer-events-none"
                style={{
                    left: `${hsva.s}%`,
                    top: `${100 - hsva.v}%`,
                    backgroundColor: color === 'transparent' ? 'transparent' : color
                }}
                />
            </div>

            {/* Sliders */}
            <div className="space-y-2.5 pt-1">
                {/* Hue */}
                <div 
                    ref={hueRef}
                    className="w-full h-2.5 rounded-full relative cursor-pointer shadow-sm"
                    style={{
                    background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'
                    }}
                    onMouseDown={handleHueMouseDown}
                >
                    <div 
                    className="absolute w-3.5 h-3.5 rounded-full shadow-sm -mt-[2px] -ml-1.5 pointer-events-none border-2 border-white ring-1 ring-black/5"
                    style={{ 
                        left: `${(hsva.h / 360) * 100}%`,
                        backgroundColor: `hsl(${hsva.h}, 100%, 50%)`
                    }}
                    />
                </div>

                {/* RESTORE POINT: Alpha Slider Modification - Background appearance updated to use SVG pattern matching reference image */}
                <div 
                    ref={alphaRef}
                    className="w-full h-2.5 rounded-full relative cursor-pointer shadow-sm border border-gray-200"
                    style={{
                        backgroundColor: 'white',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E")`
                    }}
                    onMouseDown={handleAlphaMouseDown}
                >
                    <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${hsvaToHex(hsva.h, hsva.s, hsva.v, 1)})` }}></div>
                    <div 
                    className="absolute w-3.5 h-3.5 rounded-full shadow-sm -mt-[3px] -ml-1.5 pointer-events-none border-2 border-white ring-1 ring-black/5"
                    style={{ 
                        left: `${hsva.a * 100}%`,
                        backgroundColor: hsvaToHex(hsva.h, hsva.s, hsva.v, 1)
                    }}
                    />
                </div>
            </div>

            {/* Inputs */}
            <div className="flex gap-2 items-center pt-1">
                <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <span className="text-gray-500 text-[10px] font-bold">HEX</span>
                    <LucideIconComponent icon="ChevronDown" size={10} className="text-gray-400" />
                </div>

                <div className="flex-1 flex items-center border border-gray-300 rounded px-2 bg-white h-7 hover:border-gray-400 transition-colors">
                    <span className="text-gray-400 text-xs mr-0.5 select-none">#</span>
                    <input 
                        type="text" 
                        value={color === 'transparent' ? '' : color.replace('#', '')} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9A-Fa-f]{0,8}$/.test(val)) {
                                if (val.length >= 6) updateColor(hexToHsva(`#${val}`), true);
                            }
                        }}
                        className="w-full bg-transparent text-xs text-gray-700 focus:outline-none uppercase font-medium"
                        spellCheck={false}
                    />
                </div>
                <div className="w-16 flex items-center border border-gray-300 rounded px-1 bg-white h-7 hover:border-gray-400 transition-colors">
                    <input 
                        type="number"
                        min="0" max="100"
                        value={Math.round(hsva.a * 100)}
                        onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 100;
                            val = Math.max(0, Math.min(100, val));
                            updateColor({ ...hsva, a: val / 100 });
                        }}
                        className="w-full bg-transparent text-xs text-gray-700 focus:outline-none text-right font-medium"
                    />
                    <span className="text-gray-400 text-[10px] ml-0.5">%</span>
                </div>
            </div>
        </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="text-gray-300 mb-2">
                   <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto">
                     <span className="text-xl font-bold">?</span>
                   </div>
                </div>
                <p className="text-xs text-gray-400 font-medium">Gradient functionality<br/>not implemented yet.</p>
            </div>
        )}
      </div>

      {/* Right Column: Palettes */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          
          <PaletteSection 
            title="Couleurs récentes" 
            isOpen={openSections.recent}
            onToggle={() => setOpenSections(p => ({...p, recent: !p.recent}))}
            action={recents.length > 0 && <LucideIconComponent icon="Trash2" size={12} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors" onClick={() => { recentColorsStore.length = 0; setRecents([]); }} />}
          >
             <div className="flex flex-wrap gap-1.5">
                {recents.map((c: string, i) => (
                    <ColorSwatch key={i} hex={c} onClick={() => updateColor(hexToHsva(c))} active={color.toLowerCase() === c.toLowerCase()} />
                ))}
                {recents.length === 0 && <span className="text-[10px] text-gray-300 italic p-1">No recent colors</span>}
             </div>
          </PaletteSection>

          <PaletteSection 
            title="Couleurs du template" 
            isOpen={openSections.template}
            onToggle={() => setOpenSections(p => ({...p, template: !p.template}))}
          >
              <div className="flex flex-wrap gap-1.5">
                {templateColors.map((c: string, i) => (
                    <ColorSwatch key={i} hex={c} onClick={() => updateColor(hexToHsva(c), true)} active={color.toLowerCase() === c.toLowerCase()} />
                ))}
                {templateColors.length === 0 && <span className="text-[10px] text-gray-300 italic p-1">No colors in template</span>}
             </div>
          </PaletteSection>

          <PaletteSection 
            title="Couleurs unies par défaut" 
            isOpen={openSections.default}
            onToggle={() => setOpenSections(p => ({...p, default: !p.default}))}
          >
              <div className="grid grid-cols-8 gap-1.5">
                {DEFAULT_COLORS.map((c: string, i) => (
                    <ColorSwatch key={i} hex={c} onClick={() => updateColor(hexToHsva(c), true)} active={color.toLowerCase() === c.toLowerCase()} />
                ))}
             </div>
          </PaletteSection>

      </div>
    </div>
  );
};
