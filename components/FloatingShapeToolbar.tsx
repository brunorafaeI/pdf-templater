import React, { useState, useRef, useEffect } from 'react';
import { EditorElement } from '../types';
import { GripVertical, ChevronRight, ChevronDown, Trash2, Pipette, Maximize, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Square } from 'lucide-react';

// --- Color Utility Functions (Enhanced for Alpha/Hex8) ---

// Converts HEX (6 or 8 digits) to HSVA {h, s, v, a}
const hexToHsva = (hex: string) => {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex === 'transparent') return { h: 0, s: 0, v: 0, a: 0 };
  
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = parseInt(hex.substring(6, 8), 16) / 255;
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; 
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100, a };
};

// Converts HSVA to HEX8
const hsvaToHex = (h: number, s: number, v: number, a: number) => {
  if (a === 0 && h === 0 && s === 0 && v === 0) return 'transparent';

  let r, g, b;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s / 100);
  const q = v * (1 - f * s / 100);
  const t = v * (1 - (1 - f) * s / 100);
  v = v / 100;
  
  const V = v; 
  const S = s / 100;
  const C = V * S;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = V - C;

  let R1 = 0, G1 = 0, B1 = 0;
  if (h >= 0 && h < 60) { R1 = C; G1 = X; B1 = 0; }
  else if (h >= 60 && h < 120) { R1 = X; G1 = C; B1 = 0; }
  else if (h >= 120 && h < 180) { R1 = 0; G1 = C; B1 = X; }
  else if (h >= 180 && h < 240) { R1 = 0; G1 = X; B1 = C; }
  else if (h >= 240 && h < 300) { R1 = X; G1 = 0; B1 = C; }
  else if (h >= 300 && h < 360) { R1 = C; G1 = 0; B1 = X; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');

  // If fully opaque, return 6 char hex, else 8 char
  return `#${toHex(R1)}${toHex(G1)}${toHex(B1)}${alphaHex === 'ff' ? '' : alphaHex}`;
};

// --- Custom Components ---

const DEFAULT_COLORS = [
  // Grayscale
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#FFFFFF',
  // Reds
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF',
  // Purples/Pinks
  '#9900FF', '#FF00FF', '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3',
  // Pastels
  '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC', '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599',
];

// Simple in-memory storage for recent colors (per session)
const recentColorsStore: string[] = [];

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
        {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
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

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange, allElements }) => {
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
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        updateColor(hexToHsva(result.sRGBHex), true);
    } catch (e) {
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
                    <Pipette size={14} />
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
                    <ChevronDown size={10} className="text-gray-400" />
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
            action={recents.length > 0 && <Trash2 size={12} className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors" onClick={() => { recentColorsStore.length = 0; setRecents([]); }} />}
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


// --- Main Toolbar Component ---

interface FloatingShapeToolbarProps {
  element: EditorElement;
  elements: EditorElement[]; // All elements for extracting palette
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  zoom?: number;
  onPositionChange?: (pos: { top: number, left: number, width: number, height: number }) => void;
}

const FloatingShapeToolbar: React.FC<FloatingShapeToolbarProps> = ({ element, elements, onUpdate, zoom = 1, onPositionChange }) => {
  const [activePopover, setActivePopover] = useState<'fill' | 'border' | 'style' | null>(null);
  const [isRadiusSplit, setIsRadiusSplit] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialDragOffsetRef = useRef({ x: 0, y: 0 });

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toolbar Dragging Logic
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDraggingToolbar) return;
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
          setDragOffset({
              x: initialDragOffsetRef.current.x + dx,
              y: initialDragOffsetRef.current.y + dy
          });
      };
      
      const handleMouseUp = () => {
          setIsDraggingToolbar(false);
      };

      if (isDraggingToolbar) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDraggingToolbar]);

  const startToolbarDrag = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
      setActivePopover(null);
      e.preventDefault();
      setIsDraggingToolbar(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialDragOffsetRef.current = { ...dragOffset };
  };

  // Parse borderRadius (always returns array of 4 strings with unit)
  const parseBorderRadius = (radiusStr?: string | number) => {
      if (!radiusStr) return ['0px', '0px', '0px', '0px'];
      const str = radiusStr.toString();
      const parts = str.split(' ');
      if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
      if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
      if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
      return [parts[0], parts[1], parts[2], parts[3]];
  };

  const radii = parseBorderRadius(element.style.borderRadius);

  // Helper to update radius
  const updateRadius = (index: number | 'all', value: number) => {
      const newRadii = [...radii];
      const valStr = `${value}px`;
      
      if (index === 'all') {
          onUpdate(element.id, { style: { ...element.style, borderRadius: valStr } });
      } else {
          newRadii[index] = valStr;
          onUpdate(element.id, { style: { ...element.style, borderRadius: newRadii.join(' ') } });
      }
  };

  if (!element || (element.type !== 'box' && element.type !== 'circle' && element.type !== 'svg' && element.type !== 'image')) return null;

  const currentFill = element.style.backgroundColor || 'transparent';
  const currentBorderColor = element.style.borderColor || 'transparent';
  const currentBorderWidth = parseInt(element.style.borderWidth?.toString() || '0');

  const handleColorUpdate = (color: string, type: 'fill' | 'border') => {
      if (type === 'fill') {
          onUpdate(element.id, { style: { ...element.style, backgroundColor: color } });
      } else {
          // If adding color to border with 0 width, default to 2px
          const newWidth = currentBorderWidth === 0 && color !== 'transparent' ? '2px' : element.style.borderWidth;
          const newStyle = element.style.borderStyle || 'solid';
          onUpdate(element.id, { style: { ...element.style, borderColor: color, borderWidth: newWidth, borderStyle: newStyle } });
      }
  };

  // Calculate position to avoid collision and stay within view
  const toolbarHeight = 50;
  const toolbarWidth = 400; // Approximate
  const margin = 15;
  const stageWidth = 800;
  const stageHeight = 1131;
  
  // Base position (above the element)
  let baseTop = element.y - toolbarHeight - margin;
  let baseLeft = element.x;

  // If too high, place below
  if (baseTop < 20) {
      baseTop = element.y + element.height + margin;
  }

  // Apply user drag offset
  let finalLeft = baseLeft + dragOffset.x;
  let finalTop = baseTop + dragOffset.y;

  // Collision Avoidance Logic:
  // If the toolbar overlaps the element, we push it to the nearest outside edge.
  const toolbarRect = {
      left: finalLeft,
      right: finalLeft + toolbarWidth,
      top: finalTop,
      bottom: finalTop + toolbarHeight
  };

  const elementRect = {
      left: element.x - margin,
      right: element.x + element.width + margin,
      top: element.y - margin,
      bottom: element.y + element.height + margin
  };

  const isOverlapping = (
      toolbarRect.left < elementRect.right &&
      toolbarRect.right > elementRect.left &&
      toolbarRect.top < elementRect.bottom &&
      toolbarRect.bottom > elementRect.top
  );

  if (isOverlapping) {
      // Find the distance to each edge and push to the closest one
      const dists = [
          { edge: 'top', d: Math.abs(toolbarRect.bottom - elementRect.top) },
          { edge: 'bottom', d: Math.abs(toolbarRect.top - elementRect.bottom) },
          { edge: 'left', d: Math.abs(toolbarRect.right - elementRect.left) },
          { edge: 'right', d: Math.abs(toolbarRect.left - elementRect.right) }
      ];
      dists.sort((a, b) => a.d - b.d);
      const closest = dists[0];

      if (closest.edge === 'top') finalTop = elementRect.top - toolbarHeight;
      else if (closest.edge === 'bottom') finalTop = elementRect.bottom;
      else if (closest.edge === 'left') finalLeft = elementRect.left - toolbarWidth;
      else if (closest.edge === 'right') finalLeft = elementRect.right;
  }

  // Stage constraints for toolbar
  finalLeft = Math.max(margin, Math.min(stageWidth - toolbarWidth - margin, finalLeft));
  finalTop = Math.max(margin, Math.min(stageHeight - toolbarHeight - margin, finalTop));

  // Notify parent of position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange({
        top: finalTop,
        left: finalLeft,
        width: toolbarWidth,
        height: toolbarHeight
      });
    }
  }, [finalTop, finalLeft, onPositionChange, toolbarWidth, toolbarHeight]);

  return (
    <div 
      ref={toolbarRef}
      onMouseDown={startToolbarDrag}
      className={`absolute flex items-center gap-1 bg-white p-1.5 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-gray-200 z-50 ${isDraggingToolbar ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: finalLeft,
        top: finalTop,
        transform: 'translateY(0)' 
      }}
    >
       {/* Drag Handle */}
       <div className="text-gray-300 mr-1 cursor-grab active:cursor-grabbing">
         <GripVertical size={14} />
       </div>

       {/* Fill Toggle */}
       <div className="relative">
            <button 
                onClick={() => setActivePopover(activePopover === 'fill' ? null : 'fill')}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors ${activePopover === 'fill' ? 'bg-blue-50 ring-1 ring-blue-200 text-blue-600' : ''}`}
            >
                <div className="w-5 h-5 rounded border border-gray-300 shadow-sm relative overflow-hidden bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grey_square_checkerboard_pattern.svg/1024px-Grey_square_checkerboard_pattern.svg.png')] bg-[length:6px_6px]">
                    <div className="absolute inset-0" style={{ backgroundColor: currentFill === 'transparent' ? 'transparent' : currentFill }}>
                        {currentFill === 'transparent' && <div className="absolute inset-0 border-t border-red-500 rotate-45 top-1/2 bg-white/0"></div>}
                    </div>
                </div>
                <span className="text-xs font-medium text-gray-700">Remplissage</span>
            </button>
            
            {activePopover === 'fill' && (
                <div className="absolute top-full mt-2 left-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CustomColorPicker 
                        color={currentFill === 'transparent' ? 'transparent' : currentFill} 
                        onChange={(c) => handleColorUpdate(c, 'fill')} 
                        allElements={elements}
                    />
                </div>
            )}
       </div>

       <div className="w-px h-4 bg-gray-200 mx-1"></div>

       {/* Border Color Toggle */}
       <div className="relative">
            <button 
                onClick={() => setActivePopover(activePopover === 'border' ? null : 'border')}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors ${activePopover === 'border' ? 'bg-blue-50 ring-1 ring-blue-200 text-blue-600' : ''}`}
            >
                <div className="w-5 h-5 rounded border-2 border-gray-300 shadow-sm box-border flex items-center justify-center relative overflow-hidden" style={{ borderColor: currentBorderColor === 'transparent' ? '#e5e7eb' : currentBorderColor }}>
                {currentBorderColor === 'transparent' && <div className="w-6 h-0 border-t border-gray-400 rotate-45"></div>}
                </div>
                <span className="text-xs font-medium text-gray-700">Contour</span>
            </button>

            {activePopover === 'border' && (
                <div className="absolute top-full mt-2 left-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CustomColorPicker 
                        color={currentBorderColor === 'transparent' ? 'transparent' : currentBorderColor} 
                        onChange={(c) => handleColorUpdate(c, 'border')} 
                        allElements={elements}
                    />
                </div>
            )}
       </div>

       <div className="w-px h-4 bg-gray-200 mx-1"></div>

       {/* Border Style Toggle */}
       <div className="relative">
          <button 
            onClick={() => setActivePopover(activePopover === 'style' ? null : 'style')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors ${activePopover === 'style' ? 'bg-blue-50 ring-1 ring-blue-200 text-blue-600' : ''}`}
          >
            <span className="text-xs font-medium text-gray-700">Bordure</span>
            <div className="w-8 h-4 border-b-2 border-gray-800"></div>
          </button>
          
          {activePopover === 'style' && (
             <div 
                className="w-56 p-4 bg-white rounded-lg shadow-xl border border-gray-200 mt-2 absolute left-0 z-50 cursor-default animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseDown={(e) => e.stopPropagation()}
             >
                <div className="space-y-4">
                  {/* Stroke Style */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-2 tracking-wide">Style</label>
                    <div className="flex gap-2">
                       <button onClick={() => onUpdate(element.id, { style: { ...element.style, borderStyle: 'solid' } })} className={`flex-1 h-8 border-2 border-gray-800 rounded hover:bg-gray-50 ${element.style.borderStyle !== 'dashed' && element.style.borderStyle !== 'dotted' ? 'bg-blue-50 border-blue-500' : ''}`}></button>
                       <button onClick={() => onUpdate(element.id, { style: { ...element.style, borderStyle: 'dashed' } })} className={`flex-1 h-8 border-2 border-dashed border-gray-800 rounded hover:bg-gray-50 ${element.style.borderStyle === 'dashed' ? 'bg-blue-50 border-blue-500' : ''}`}></button>
                       <button onClick={() => onUpdate(element.id, { style: { ...element.style, borderStyle: 'dotted' } })} className={`flex-1 h-8 border-2 border-dotted border-gray-800 rounded hover:bg-gray-50 ${element.style.borderStyle === 'dotted' ? 'bg-blue-50 border-blue-500' : ''}`}></button>
                    </div>
                  </div>
                  
                  {/* Thickness */}
                  <div>
                    <div className="flex justify-between mb-1 items-center">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Epaisseur</label>
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 rounded">{currentBorderWidth}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="20" 
                      value={currentBorderWidth}
                      onChange={(e) => onUpdate(element.id, { style: { ...element.style, borderWidth: `${e.target.value}px`, borderColor: currentBorderColor === 'transparent' && parseInt(e.target.value) > 0 ? '#000000' : currentBorderColor } })}
                      className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Border Radius Control */}
                  {(element.type === 'box' || element.type === 'image') && (
                      <div className="pt-2 border-t border-gray-100">
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Rayon</label>
                             <button 
                                onClick={() => setIsRadiusSplit(!isRadiusSplit)} 
                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${isRadiusSplit ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                                title={isRadiusSplit ? "Unified Radius" : "Individual Corners"}
                             >
                                 <Maximize size={12} />
                             </button>
                         </div>
                         
                         {!isRadiusSplit ? (
                             <div className="flex items-center gap-2">
                                <Square size={14} className="text-gray-400" />
                                <input 
                                    type="number" 
                                    min="0"
                                    value={parseInt(radii[0])} 
                                    onChange={(e) => updateRadius('all', parseInt(e.target.value) || 0)}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                />
                             </div>
                         ) : (
                             <div className="grid grid-cols-2 gap-2">                                 
                                 <div className="flex items-center gap-1.5">
                                     <CornerUpRight size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[1])} 
                                         onChange={(e) => updateRadius(1, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <CornerUpLeft size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[0])} 
                                         onChange={(e) => updateRadius(0, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <CornerDownRight size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[2])} 
                                         onChange={(e) => updateRadius(2, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <CornerDownLeft size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[3])} 
                                         onChange={(e) => updateRadius(3, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                             </div>
                         )}
                      </div>
                  )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default FloatingShapeToolbar;