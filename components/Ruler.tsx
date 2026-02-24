import React from 'react';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  length: number;
  scale?: number;
  onDragStart: (e: React.MouseEvent) => void;
}

const Ruler: React.FC<RulerProps> = ({ orientation, length, scale = 1, onDragStart }) => {
  const isHorizontal = orientation === 'horizontal';
  const size = 24; // Thickness of ruler

  // Simple visual ticks
  const ticks = [];
  for (let i = 0; i < length; i += 50) {
    if (i === 0) continue;
    ticks.push(
      <div 
        key={i}
        className="absolute bg-gray-400 text-[9px] text-gray-500 pointer-events-none"
        style={{
          left: isHorizontal ? i : undefined,
          top: isHorizontal ? undefined : i,
          width: isHorizontal ? '1px' : '6px',
          height: isHorizontal ? '6px' : '1px',
        }}
      >
        <span className="absolute left-1 top-1 select-none">{i}</span>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gray-50 border-gray-300 ${isHorizontal ? 'border-b w-full' : 'border-r h-full'} relative overflow-hidden cursor-crosshair hover:bg-gray-100 transition-colors z-40`}
      style={{
        width: isHorizontal ? '100%' : `${size}px`,
        height: isHorizontal ? `${size}px` : `${length}px`,
      }}
      onMouseDown={onDragStart}
    >
      {ticks}
    </div>
  );
};

export default Ruler;