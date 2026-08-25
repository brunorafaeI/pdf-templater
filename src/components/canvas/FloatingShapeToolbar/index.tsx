import React, { useState, useRef, useEffect } from 'react'
import { EditorElement } from '@/types'
import { LucideIconComponent } from '@/components/icon'
import { CustomColorPicker } from './ColorPicker'

interface FloatingShapeToolbarProps {
  element: EditorElement;
  elements: EditorElement[]; // All elements for extracting palette
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  zoom?: number;
  onPositionChange?: (pos: { top: number, left: number, width: number, height: number }) => void;
}

const FloatingShapeToolbar: React.FC<FloatingShapeToolbarProps> = ({ element, elements, onUpdate, zoom: _zoom = 1, onPositionChange }) => {
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

  const toolbarHeight = 50;
  const toolbarWidth = 400;
  const margin = 15;
  const stageWidth = 800;
  const stageHeight = 1131;

  const shouldShow = element && (element.type === 'box' || element.type === 'circle' || element.type === 'svg' || element.type === 'image' || element.type === 'icon');
  let finalTop = 0;
  let finalLeft = 0;
  if (shouldShow) {
    let baseTop = element.y - toolbarHeight - margin;
    const baseLeft = element.x;
    if (baseTop < 20) baseTop = element.y + element.height + margin;
    finalLeft = baseLeft + dragOffset.x;
    finalTop = baseTop + dragOffset.y;
    const toolbarRect = { left: finalLeft, right: finalLeft + toolbarWidth, top: finalTop, bottom: finalTop + toolbarHeight };
    const elementRect = { left: element.x - margin, right: element.x + element.width + margin, top: element.y - margin, bottom: element.y + element.height + margin };
    const isOverlapping = toolbarRect.left < elementRect.right && toolbarRect.right > elementRect.left && toolbarRect.top < elementRect.bottom && toolbarRect.bottom > elementRect.top;
    if (isOverlapping) {
      const dists = [
        { edge: 'top' as const, d: Math.abs(toolbarRect.bottom - elementRect.top) },
        { edge: 'bottom' as const, d: Math.abs(toolbarRect.top - elementRect.bottom) },
        { edge: 'left' as const, d: Math.abs(toolbarRect.right - elementRect.left) },
        { edge: 'right' as const, d: Math.abs(toolbarRect.left - elementRect.right) }
      ];
      dists.sort((a, b) => a.d - b.d);
      const closest = dists[0];
      if (closest.edge === 'top') finalTop = elementRect.top - toolbarHeight;
      else if (closest.edge === 'bottom') finalTop = elementRect.bottom;
      else if (closest.edge === 'left') finalLeft = elementRect.left - toolbarWidth;
      else if (closest.edge === 'right') finalLeft = elementRect.right;
    }
    finalLeft = Math.max(margin, Math.min(stageWidth - toolbarWidth - margin, finalLeft));
    finalTop = Math.max(margin, Math.min(stageHeight - toolbarHeight - margin, finalTop));
  }

  useEffect(() => {
    if (onPositionChange && shouldShow) {
      onPositionChange({ top: finalTop, left: finalLeft, width: toolbarWidth, height: toolbarHeight });
    }
  }, [finalTop, finalLeft, onPositionChange, toolbarWidth, toolbarHeight, shouldShow]);

  if (!shouldShow) return null;

  const isIcon = element.type === 'icon';
  const currentFill = isIcon
    ? String(element.style.color || '#334155')
    : (element.style.backgroundColor || 'transparent');
  const currentBorderColor = element.style.borderColor || 'transparent';
  const currentBorderWidth = parseInt(element.style.borderWidth?.toString() || '0');

  const handleColorUpdate = (color: string, type: 'fill' | 'border') => {
      if (type === 'fill') {
          if (isIcon) {
            onUpdate(element.id, { style: { ...element.style, color } });
          } else {
            onUpdate(element.id, { style: { ...element.style, backgroundColor: color } });
          }
      } else {
          const newWidth = currentBorderWidth === 0 && color !== 'transparent' ? '2px' : element.style.borderWidth;
          const newStyle = element.style.borderStyle || 'solid';
          onUpdate(element.id, { style: { ...element.style, borderColor: color, borderWidth: newWidth, borderStyle: newStyle } });
      }
  };

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
         <LucideIconComponent icon="GripVertical" size={14} />
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
                <span className="text-xs font-medium text-gray-700">{isIcon ? 'Color' : 'Remplissage'}</span>
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

       {!isIcon && (
       <>
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
                                 <LucideIconComponent icon="Maximize" size={12} />
                             </button>
                         </div>
                         
                         {!isRadiusSplit ? (
                             <div className="flex items-center gap-2">
                                <LucideIconComponent icon="Square" size={14} className="text-gray-400" />
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
                                     <LucideIconComponent icon="CornerUpRight" size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[1])} 
                                         onChange={(e) => updateRadius(1, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <LucideIconComponent icon="CornerUpLeft" size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[0])} 
                                         onChange={(e) => updateRadius(0, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <LucideIconComponent icon="CornerDownRight" size={12} className="text-gray-400" />
                                     <input 
                                         type="number" min="0" value={parseInt(radii[2])} 
                                         onChange={(e) => updateRadius(2, parseInt(e.target.value) || 0)}
                                         className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 font-medium"
                                     />
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                     <LucideIconComponent icon="CornerDownLeft" size={12} className="text-gray-400" />
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
       </>
       )}
    </div>
  );
};

export default FloatingShapeToolbar;