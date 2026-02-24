import React, { useRef, useState, useEffect } from 'react';
import { EditorElement, A4_WIDTH, A4_HEIGHT, Page, FooterSettings } from '../types';
import Ruler from './Ruler';
import { RotateCw, Lock } from 'lucide-react';
import FloatingShapeToolbar from './FloatingShapeToolbar';

interface CanvasProps {
  pages: Page[];
  activePageId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  canvasSettings: { backgroundColor: string; showHorizontalRuler: boolean; showVerticalRuler: boolean; showGuides: boolean; header: any; footer: any; margins: { top: number; bottom: number; left: number; right: number } };
  horizontalGuides: number[];
  verticalGuides: number[];
  onAddGuide: (type: 'horizontal' | 'vertical', pos: number) => void;
  onRemoveGuide: (type: 'horizontal' | 'vertical', index: number) => void;
}

type InteractionMode = 'idle' | 'dragging_element' | 'resizing' | 'rotating' | 'dragging_guide' | 'dragging_radius';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type RadiusHandle = 'tl' | 'tr' | 'bl' | 'br';

interface ActiveGuideState {
  type: 'horizontal' | 'vertical';
  index?: number;
  pos: number;
}

interface SnapLine {
  orientation: 'vertical' | 'horizontal';
  pos: number;
}

const SNAP_THRESHOLD = 5;

const Canvas: React.FC<CanvasProps> = ({ 
  pages,
  activePageId,
  selectedId, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  canvasSettings,
  horizontalGuides,
  verticalGuides,
  onAddGuide,
  onRemoveGuide
}) => {
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const elements = activePage.elements;
  const pageIndex = pages.findIndex(p => p.id === activePageId);
  const totalPages = pages.length;

  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

  // Interaction State
  const [mode, setMode] = useState<InteractionMode>('idle');
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [activeRadiusHandle, setActiveRadiusHandle] = useState<RadiusHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState<{ 
    x: number, y: number, w: number, h: number, r: number, 
    borderRadius: string,
    rotationHandlePos?: 'top' | 'bottom',
    startAngle?: number
  } | null>(null);
  
  const currentRotationPosRef = useRef<'top' | 'bottom'>('bottom');

  // Guide Dragging State
  const [activeGuide, setActiveGuide] = useState<ActiveGuideState | null>(null);

  // Smart Guides State
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  // Toolbar Position State (for collision avoidance with rotation handle)
  const [toolbarRect, setToolbarRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);

  // Sync scroll for rulers
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPos({
        x: scrollContainerRef.current.scrollLeft,
        y: scrollContainerRef.current.scrollTop
      });
    }
  };

  // Clear toolbarRect when selection changes
  useEffect(() => {
    if (!selectedId) {
      setToolbarRect(null);
    }
  }, [selectedId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDelete(selectedId);
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicate(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onDelete, onDuplicate]);

  // Deselect on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        (target.id === 'canvas-container' || target.id === 'canvas-root') && 
        !target.closest('.sidebar-control') &&
        !target.closest('.element-node') &&
        !target.closest('.floating-toolbar') // Do not deselect if clicking on floating toolbar
      ) {
        onSelect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelect]);

  // --- Helpers ---
  const getMousePos = (e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const snapToGuides = (val: number, guides: number[]) => {
    const threshold = 5;
    for (const g of guides) {
      if (Math.abs(val - g) < threshold) return g;
    }
    return val;
  };

  // --- Handlers ---
  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = elements.find(e => e.id === id);
    if (!el || !el.isVisible) return;
    onSelect(id);
    if (el.isLocked) return;
    setMode('dragging_element');
    const mouse = getMousePos(e);
    setDragStart(mouse);
    setInitialElementState({ 
        x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation || 0,
        borderRadius: el.style.borderRadius?.toString() || '0px'
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    const el = elements.find(e => e.id === selectedId);
    if (!el || el.isLocked) return;
    setMode('resizing');
    setActiveHandle(handle);
    const mouse = getMousePos(e);
    setDragStart(mouse);
    setInitialElementState({ 
        x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation || 0,
        borderRadius: el.style.borderRadius?.toString() || '0px'
    });
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = elements.find(e => e.id === selectedId);
    if (!el || el.isLocked) return;
    
    const mouse = getMousePos(e);
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const startAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
    
    setMode('rotating');
    setDragStart(mouse);
    setInitialElementState({ 
        x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation || 0,
        borderRadius: el.style.borderRadius?.toString() || '0px',
        rotationHandlePos: currentRotationPosRef.current,
        startAngle: startAngle
    });
  };

  const handleRadiusMouseDown = (e: React.MouseEvent, handle: RadiusHandle) => {
      e.stopPropagation();
      const el = elements.find(e => e.id === selectedId);
      if (!el || el.isLocked) return;
      setMode('dragging_radius');
      setActiveRadiusHandle(handle);
      const mouse = getMousePos(e);
      setDragStart(mouse);
      setInitialElementState({ 
          x: el.x, y: el.y, w: el.width, h: el.height, r: el.rotation || 0,
          borderRadius: el.style.borderRadius?.toString() || '0px'
      });
  }

  // Ruler & Guide Handlers
  const handleRulerDragStart = (e: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    e.preventDefault();
    const mouse = getMousePos(e);
    setMode('dragging_guide');
    setActiveGuide({ type, pos: type === 'horizontal' ? mouse.y : mouse.x }); 
  };

  const handleGuideMouseDown = (e: React.MouseEvent, type: 'horizontal' | 'vertical', index: number, currentPos: number) => {
    e.preventDefault();
    e.stopPropagation();
    setMode('dragging_guide');
    setActiveGuide({ type, index, pos: currentPos });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mouse = getMousePos(e);

    if (mode === 'dragging_guide' && activeGuide) {
       if (!canvasRef.current) return;
       const rect = canvasRef.current.getBoundingClientRect();
       
       let relativePos = 0;
       if (activeGuide.type === 'horizontal') {
         relativePos = e.clientY - rect.top;
       } else {
         relativePos = e.clientX - rect.left;
       }
       
       setActiveGuide(prev => ({ ...prev!, pos: relativePos }));
       return;
    }

    if (!selectedId || !initialElementState) return;

    if (mode === 'dragging_element') {
      const dx = mouse.x - dragStart.x;
      const dy = mouse.y - dragStart.y;
      
      let newX = initialElementState.x + dx;
      let newY = initialElementState.y + dy;

      // Smart Guides Logic
      const activeLines: SnapLine[] = [];
      const currentW = initialElementState.w;
      const currentH = initialElementState.h;
      
      const dLeft = newX;
      const dRight = newX + currentW;
      const dCenterX = newX + currentW / 2;
      
      const dTop = newY;
      const dBottom = newY + currentH;
      const dCenterY = newY + currentH / 2;

      const targets = [
        { id: 'canvas', type: 'canvas', x: 0, y: 0, width: A4_WIDTH, height: A4_HEIGHT },
        ...elements.filter(el => el.id !== selectedId && el.isVisible)
      ];

      // SNAP VERTICAL
      let bestDx = Infinity;
      let bestSnapX = null;
      let snapLineX = null;

      targets.forEach(target => {
          const tLeft = target.x;
          const tRight = target.x + target.width;
          const tCenterX = target.x + target.width / 2;

          const dPoints = [{ val: dLeft, offset: 0 }, { val: dCenterX, offset: currentW / 2 }, { val: dRight, offset: currentW }];
          const tPoints = [tLeft, tCenterX, tRight];

          dPoints.forEach(dp => {
              tPoints.forEach(tp => {
                  const dist = tp - dp.val;
                  if (Math.abs(dist) < SNAP_THRESHOLD && Math.abs(dist) < Math.abs(bestDx)) {
                      bestDx = dist;
                      bestSnapX = tp - dp.offset;
                      snapLineX = tp;
                  }
              });
          });
      });

      // SNAP HORIZONTAL
      let bestDy = Infinity;
      let bestSnapY = null;
      let snapLineY = null;

      targets.forEach(target => {
          const tTop = target.y;
          const tBottom = target.y + target.height;
          const tCenterY = target.y + target.height / 2;

          const dPoints = [{ val: dTop, offset: 0 }, { val: dCenterY, offset: currentH / 2 }, { val: dBottom, offset: currentH }];
          const tPoints = [tTop, tCenterY, tBottom];

          dPoints.forEach(dp => {
              tPoints.forEach(tp => {
                  const dist = tp - dp.val;
                  if (Math.abs(dist) < SNAP_THRESHOLD && Math.abs(dist) < Math.abs(bestDy)) {
                      bestDy = dist;
                      bestSnapY = tp - dp.offset;
                      snapLineY = tp;
                  }
              });
          });
      });

      if (bestSnapX !== null) {
          newX = bestSnapX;
          activeLines.push({ orientation: 'vertical', pos: snapLineX! });
      }
      if (bestSnapY !== null) {
          newY = bestSnapY;
          activeLines.push({ orientation: 'horizontal', pos: snapLineY! });
      }

      setSnapLines(activeLines);

      if (bestSnapX === null && canvasSettings.showGuides) {
        newX = snapToGuides(newX, verticalGuides);
      }
      if (bestSnapY === null && canvasSettings.showGuides) {
        newY = snapToGuides(newY, horizontalGuides);
      }

      // Stage constraints
      newX = Math.max(0, Math.min(A4_WIDTH - currentW, newX));
      newY = Math.max(0, Math.min(A4_HEIGHT - currentH, newY));
      
      onUpdate(selectedId, { x: newX, y: newY });

    } else if (mode === 'resizing' && activeHandle) {
      const dx = mouse.x - dragStart.x;
      const dy = mouse.y - dragStart.y;
      const { x, y, w, h } = initialElementState;
      let newX = x, newY = y, newW = w, newH = h;

      if (activeHandle.includes('e')) newW = Math.max(10, w + dx);
      if (activeHandle.includes('w')) { newW = Math.max(10, w - dx); newX = x + dx; }
      if (activeHandle.includes('s')) newH = Math.max(10, h + dy);
      if (activeHandle.includes('n')) { newH = Math.max(10, h - dy); newY = y + dy; }

      onUpdate(selectedId, { x: newX, y: newY, width: newW, height: newH });
    } else if (mode === 'rotating' && initialElementState && initialElementState.startAngle !== undefined) {
      const cx = initialElementState.x + initialElementState.w / 2;
      const cy = initialElementState.y + initialElementState.h / 2;
      const currentAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
      
      const deltaAngle = (currentAngle - initialElementState.startAngle) * 180 / Math.PI;
      let newRotation = (initialElementState.r + deltaAngle) % 360;
      
      onUpdate(selectedId, { rotation: newRotation });
    } else if (mode === 'dragging_radius' && activeRadiusHandle) {
        const initialR = parseInt(initialElementState.borderRadius) || 0;
        const dx = mouse.x - dragStart.x;
        const dy = mouse.y - dragStart.y;

        // Determine change based on which handle is dragged.
        // Moving "inwards" towards center should increase radius.
        // Average the dx/dy movement to create a 1:1 feel on diagonal drags
        let delta = 0;
        
        // Logic: Project vector onto diagonal pointing inwards
        if (activeRadiusHandle === 'tl') delta = (dx + dy) / 2;
        if (activeRadiusHandle === 'tr') delta = (-dx + dy) / 2;
        if (activeRadiusHandle === 'bl') delta = (dx - dy) / 2;
        if (activeRadiusHandle === 'br') delta = (-dx - dy) / 2;

        // Multiply by 2 roughly to match 1:1 pixel movement with mouse on 45deg
        // Or simpler: (dx + dy)/2 is technically the projection on (1,1) scaled by sqrt(2) logic
        // Let's assume standard behavior: moving 10px right should increase R by 10px if TL.
        
        let newR = initialR + delta;
        
        // Clamp between 0 and Max Radius (Half of shortest side)
        const maxR = Math.min(initialElementState.w, initialElementState.h) / 2;
        newR = Math.max(0, Math.min(newR, maxR));

        onUpdate(selectedId, { style: { ...elements.find(e => e.id === selectedId)!.style, borderRadius: `${Math.round(newR)}px` } });
    }
  };

  const handleMouseUp = () => {
    if (mode === 'dragging_guide' && activeGuide) {
      const isRemoval = activeGuide.pos < -20 || 
                       (activeGuide.type === 'horizontal' && activeGuide.pos > A4_HEIGHT + 20) || 
                       (activeGuide.type === 'vertical' && activeGuide.pos > A4_WIDTH + 20);
      
      if (activeGuide.index !== undefined) {
          onRemoveGuide(activeGuide.type, activeGuide.index);
          if (!isRemoval) onAddGuide(activeGuide.type, activeGuide.pos);
      } else {
          if (!isRemoval) onAddGuide(activeGuide.type, activeGuide.pos);
      }
      setActiveGuide(null);
    }
    setMode('idle');
    setActiveHandle(null);
    setActiveRadiusHandle(null);
    setInitialElementState(null);
    setSnapLines([]); 
  };

  const rulerSize = 24; 
  const topRowHeight = canvasSettings.showHorizontalRuler ? `${rulerSize}px` : '0px';
  const leftColWidth = canvasSettings.showVerticalRuler ? `${rulerSize}px` : '0px';

  const toRoman = (num: number) => {
    const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (const i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  const getPaginationText = (footer: FooterSettings) => {
    const current = pageIndex + 1;
    let formatted = '';
    if (footer.paginationFormat === 'numeric') formatted = current.toString();
    else if (footer.paginationFormat === 'roman') formatted = toRoman(current);
    else if (footer.paginationFormat === 'fraction') formatted = `${current} / ${totalPages}`;

    return `${footer.paginationPrefix ? footer.paginationPrefix + ' ' : ''}${formatted}`;
  };

  const header = activePage.headerOverride || canvasSettings.header;
  const footer = activePage.footerOverride || canvasSettings.footer;
  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="flex-1 grid h-full overflow-hidden bg-gray-200 select-none relative" 
         style={{ gridTemplateColumns: `${leftColWidth} 1fr`, gridTemplateRows: `${topRowHeight} 1fr` }}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
    >
      {/* 1. Corner (Top-Left) */}
      <div className="bg-gray-100 border-r border-b border-gray-300 z-50"></div>

      {/* 2. Horizontal Ruler Track */}
      <div className="relative bg-gray-100 border-b border-gray-300 overflow-hidden z-40">
         <div style={{ transform: `translateX(-${scrollPos.x}px)`, marginLeft: '32px' }}> 
           <Ruler orientation="horizontal" length={A4_WIDTH + 200} onDragStart={(e) => handleRulerDragStart(e, 'horizontal')} />
         </div>
      </div>

      {/* 3. Vertical Ruler Track */}
      <div className="relative bg-gray-100 border-r border-gray-300 overflow-hidden z-40">
         <div style={{ transform: `translateY(-${scrollPos.y}px)`, marginTop: '32px' }}>
           <Ruler orientation="vertical" length={A4_HEIGHT + 200} onDragStart={(e) => handleRulerDragStart(e, 'vertical')} />
         </div>
      </div>

      {/* 4. Main Scrollable Area */}
      <div 
        ref={scrollContainerRef}
        id="canvas-container"
        className="overflow-auto bg-gray-200 relative p-8 scroll-smooth"
        onScroll={handleScroll}
      >
        <div 
            ref={canvasRef}
            id="canvas-root"
            className="bg-white shadow-xl relative transition-colors duration-200 print-container"
            style={{ 
            width: `${A4_WIDTH}px`, 
            height: `${A4_HEIGHT}px`,
            minWidth: `${A4_WIDTH}px`, 
            minHeight: `${A4_HEIGHT}px`,
            backgroundColor: canvasSettings.backgroundColor,
            cursor: mode === 'dragging_guide' ? (activeGuide?.type === 'horizontal' ? 'row-resize' : 'col-resize') : 'default'
            }}
        >
            {/* Guides (Manual) */}
            {canvasSettings.showGuides && (
            <>
                {verticalGuides.map((g, i) => (
                <div 
                    key={`v-${i}`} 
                    className="absolute top-0 bottom-0 z-40 w-4 -ml-2 flex justify-center group cursor-col-resize hover:bg-cyan-500/10" 
                    style={{ left: g, display: activeGuide?.index === i && activeGuide?.type === 'vertical' ? 'none' : 'flex' }}
                    onMouseDown={(e) => handleGuideMouseDown(e, 'vertical', i, g)}
                >
                    <div className="h-full w-px bg-cyan-500"></div>
                </div>
                ))}
                {horizontalGuides.map((g, i) => (
                <div 
                    key={`h-${i}`} 
                    className="absolute left-0 right-0 z-40 h-4 -mt-2 flex flex-col justify-center group cursor-row-resize hover:bg-cyan-500/10" 
                    style={{ top: g, display: activeGuide?.index === i && activeGuide?.type === 'horizontal' ? 'none' : 'flex' }}
                    onMouseDown={(e) => handleGuideMouseDown(e, 'horizontal', i, g)}
                >
                    <div className="w-full h-px bg-cyan-500"></div>
                </div>
                ))}
                
                {activeGuide && (
                <div 
                    className={`absolute bg-cyan-500 z-50 pointer-events-none ${activeGuide.type === 'horizontal' ? 'w-full h-px' : 'h-full w-px'}`}
                    style={{ 
                    left: activeGuide.type === 'vertical' ? activeGuide.pos : 0, 
                    top: activeGuide.type === 'horizontal' ? activeGuide.pos : 0 
                    }}
                />
                )}
            </>
            )}

            {/* Smart Snap Lines */}
            {snapLines.map((line, i) => (
               <div 
                  key={`snap-${i}`}
                  className="absolute bg-red-500 z-[60] pointer-events-none"
                  style={{
                      left: line.orientation === 'vertical' ? line.pos : 0,
                      top: line.orientation === 'horizontal' ? line.pos : 0,
                      width: line.orientation === 'vertical' ? '1px' : '100%',
                      height: line.orientation === 'horizontal' ? '1px' : '100%',
                  }}
               />
            ))}

            {/* Margins Reference Lines (Extended to edges) */}
            <div className="absolute inset-0 pointer-events-none z-[4]">
                {/* Top Margin */}
                <div 
                    className="absolute left-0 right-0 border-t border-dashed border-blue-200" 
                    style={{ top: `${canvasSettings.margins.top}px` }}
                />
                {/* Bottom Margin */}
                <div 
                    className="absolute left-0 right-0 border-t border-dashed border-blue-200" 
                    style={{ bottom: `${canvasSettings.margins.bottom}px` }}
                />
                {/* Left Margin */}
                <div 
                    className="absolute top-0 bottom-0 border-l border-dashed border-blue-200" 
                    style={{ left: `${canvasSettings.margins.left}px` }}
                />
                {/* Right Margin */}
                <div 
                    className="absolute top-0 bottom-0 border-l border-dashed border-blue-200" 
                    style={{ right: `${canvasSettings.margins.right}px` }}
                />
            </div>

            {/* Header */}
            {header.enabled && (
                <div 
                    className="absolute top-0 left-0 right-0 border-b border-gray-100 flex items-center px-8 text-gray-600 overflow-hidden pointer-events-none z-[5]"
                    style={{ 
                        height: `${header.height}px`,
                        justifyContent: header.alignment === 'left' ? 'flex-start' : header.alignment === 'right' ? 'flex-end' : 'center'
                    }}
                >
                    <div className="text-xs" dangerouslySetInnerHTML={{ __html: header.htmlContent || '' }} />
                </div>
            )}

            {/* Footer */}
            {footer.enabled && (
                <div 
                    className="absolute bottom-0 left-0 right-0 border-t border-gray-100 flex items-center px-8 text-gray-600 overflow-hidden pointer-events-none z-[5]"
                    style={{ 
                        height: `${footer.height}px`,
                        justifyContent: footer.alignment === 'left' ? 'flex-start' : footer.alignment === 'right' ? 'flex-end' : 'center'
                    }}
                >
                    {footer.type === 'html' ? (
                        <div className="text-xs" dangerouslySetInnerHTML={{ __html: footer.htmlContent || '' }} />
                    ) : (
                        <div className="text-xs font-medium">{getPaginationText(footer)}</div>
                    )}
                </div>
            )}

            {/* Elements */}
            {elements.map(el => {
            if (!el.isVisible) return null;
            const isSelected = selectedId === el.id;
            
            return (
                <div
                key={el.id}
                className={`absolute element-node group ${isSelected ? 'z-20' : 'z-10'}`}
                style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    transform: `rotate(${el.rotation || 0}deg)`,
                    cursor: el.isLocked ? 'default' : 'move'
                }}
                onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                >
                <div className="w-full h-full relative" style={el.type === 'svg' ? {} : el.style}>
                    {el.type === 'text' && <div className="w-full h-full overflow-hidden break-words pointer-events-none whitespace-pre-wrap">{el.content}</div>}
                    {el.type === 'image' && <img src={el.content} className="w-full h-full object-cover pointer-events-none" style={{ borderRadius: el.style.borderRadius }} />}
                    {(el.type === 'box' || el.type === 'circle' || el.type === 'line') && (
                        <div className="w-full h-full pointer-events-none" style={{ borderRadius: el.style.borderRadius }}></div>
                    )}
                    {el.type === 'svg' && (
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full pointer-events-none overflow-visible">
                            <path 
                                d={el.content} 
                                fill={el.style.backgroundColor || 'transparent'} 
                                stroke={el.style.borderColor || 'transparent'}
                                strokeWidth={parseInt(el.style.borderWidth?.toString() || '0') * (100 / el.width)} 
                                strokeDasharray={el.style.borderStyle === 'dashed' ? '5,5' : el.style.borderStyle === 'dotted' ? '2,2' : undefined}
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    )}
                </div>

                {el.isLocked && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 border-2 border-red-400">
                        <Lock className="text-red-500" size={24} />
                    </div>
                )}

                {isSelected && !el.isLocked && (
                    <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>
                    
                    {/* Radius Handles - Box/Image Only */}
                    {(el.type === 'box' || el.type === 'image') && (
                        (() => {
                           const currentR = parseInt(el.style.borderRadius?.toString() || '0');
                           // Dynamic Max Radius (Half of shortest side)
                           const maxR = Math.min(el.width, el.height) / 2;
                           
                           // Visual offset logic: Start at 12px (so handle is inside corner) and move to maxR (center)
                           // The 'Math.max(12, currentR)' ensures handles are visible/clickable even at radius 0.
                           // The 'Math.min(..., maxR)' ensures visual collision at the center.
                           const visualOffset = Math.min(Math.max(12, currentR), maxR); 
                           
                           // Handle styling
                           const handleStyle = "absolute w-3 h-3 bg-white border border-blue-500 rounded-full cursor-grab z-40 hover:scale-125 transition-transform flex items-center justify-center";
                          

                           return (
                             <>
                                {/* Top Left */}
                                <div className={handleStyle}
                                    style={{ top: `${visualOffset}px`, left: `${visualOffset}px`, transform: 'translate(-50%, -50%)' }}
                                    onMouseDown={(e) => handleRadiusMouseDown(e, 'tl')}
                                >
                                </div>
                                
                                {/* Top Right */}
                                <div className={handleStyle}
                                    style={{ top: `${visualOffset}px`, right: `${visualOffset}px`, transform: 'translate(50%, -50%)' }}
                                    onMouseDown={(e) => handleRadiusMouseDown(e, 'tr')}
                                >
                                </div>
                                
                                {/* Bottom Left */}
                                <div className={handleStyle}
                                    style={{ bottom: `${visualOffset}px`, left: `${visualOffset}px`, transform: 'translate(-50%, 50%)' }}
                                    onMouseDown={(e) => handleRadiusMouseDown(e, 'bl')}
                                >
                                </div>
                                
                                {/* Bottom Right */}
                                <div className={handleStyle}
                                    style={{ bottom: `${visualOffset}px`, right: `${visualOffset}px`, transform: 'translate(50%, 50%)' }}
                                    onMouseDown={(e) => handleRadiusMouseDown(e, 'br')}
                                >
                                </div>

                                {/* Radius Tooltip */}
                                {mode === 'dragging_radius' && (
                                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50 font-medium">
                                        Radius {currentR}
                                    </div>
                                )}
                             </>
                           );
                        })()
                    )}

                    {/* Rotation Handle */}
                    {(() => {
                        // Collision avoidance for rotation handle
                        let rotationPos: 'top' | 'bottom' = 'bottom';
                        
                        // If we are currently rotating, use the position from when rotation started
                        if (mode === 'rotating' && initialElementState?.rotationHandlePos) {
                            rotationPos = initialElementState.rotationHandlePos;
                        } else if (toolbarRect) {
                            const handleSize = 24;
                            const handleMargin = 8;
                            
                            // Bottom handle bounds
                            const bHandle = {
                                left: el.x + el.width / 2 - handleSize / 2,
                                right: el.x + el.width / 2 + handleSize / 2,
                                top: el.y + el.height + handleMargin,
                                bottom: el.y + el.height + handleMargin + handleSize
                            };
                            
                            const collidesWithBottom = (
                                toolbarRect.left < bHandle.right &&
                                toolbarRect.left + toolbarRect.width > bHandle.left &&
                                toolbarRect.top < bHandle.bottom &&
                                toolbarRect.top + toolbarRect.height > bHandle.top
                            );
                            
                            if (collidesWithBottom) {
                                rotationPos = 'top';
                            }
                        }

                        // Update ref for the next interaction start
                        currentRotationPosRef.current = rotationPos;

                        const isTop = rotationPos === 'top';
                        const handleClass = isTop ? "-top-8" : "-bottom-8";
                        const lineClass = isTop ? "-top-8" : "-bottom-8";

                        return (
                            <>
                                <div 
                                    className={`absolute ${handleClass} left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-move hover:bg-blue-50 z-[60] shadow-sm`}
                                    onMouseDown={handleRotateMouseDown}
                                >
                                    <RotateCw size={12} className="text-gray-600" />
                                </div>
                                <div className={`absolute ${lineClass} left-1/2 -translate-x-1/2 h-8 w-px bg-blue-500 pointer-events-none z-[59]`}></div>
                            </>
                        );
                    })()}

                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nw-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-n-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-ne-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
                    
                    <div className="absolute top-1/2 -translate-y-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-w-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
                    <div className="absolute top-1/2 -translate-y-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-e-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />

                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-sw-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-s-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-se-resize z-30" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
                    </>
                )}
                </div>
            );
            })}
            
            {/* Floating Shape Toolbar */}
            {selectedElement && !selectedElement.isLocked && (
                <div className="floating-toolbar">
                  <FloatingShapeToolbar 
                    element={selectedElement} 
                    elements={elements} 
                    onUpdate={onUpdate} 
                    onPositionChange={setToolbarRect}
                  />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;