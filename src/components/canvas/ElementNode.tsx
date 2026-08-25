import React from 'react'
import { EditorElement } from '@/types'
import { LucideIconComponent, type LucideIconName } from '@/components/icon'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
export type RadiusHandle = 'tl' | 'tr' | 'bl' | 'br'

interface ElementNodeProps {
  el: EditorElement
  isSelected: boolean
  mode: string
  toolbarRect: { top: number; left: number; width: number; height: number } | null
  rotationHandlePos?: 'top' | 'bottom'
  currentRotationPosRef: React.MutableRefObject<'top' | 'bottom'>
  onElementMouseDown: (e: React.MouseEvent, id: string) => void
  onResizeMouseDown: (e: React.MouseEvent, handle: ResizeHandle) => void
  onRotateMouseDown: (e: React.MouseEvent) => void
  onRadiusMouseDown: (e: React.MouseEvent, handle: RadiusHandle) => void
}

const ElementNode: React.FC<ElementNodeProps> = ({
  el,
  isSelected,
  mode,
  toolbarRect,
  rotationHandlePos,
  currentRotationPosRef,
  onElementMouseDown,
  onResizeMouseDown,
  onRotateMouseDown,
  onRadiusMouseDown,
}) => {
  return (
    <div
      className={`absolute element-node group ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        transform: `rotate(${el.rotation || 0}deg)`,
        cursor: el.isLocked ? 'default' : 'move',
      }}
      onMouseDown={(e) => onElementMouseDown(e, el.id)}
    >
      <div className="w-full h-full relative" style={el.type === 'svg' || el.type === 'icon' ? {} : el.style}>
        {el.type === 'text' && (
          <div className="w-full h-full overflow-hidden break-words pointer-events-none whitespace-pre-wrap">
            {el.content}
          </div>
        )}
        {el.type === 'image' && (
          <img
            src={el.content}
            className="w-full h-full object-cover pointer-events-none"
            style={{ borderRadius: el.style.borderRadius }}
          />
        )}
        {(el.type === 'box' || el.type === 'circle' || el.type === 'line') && (
          <div
            className="w-full h-full pointer-events-none"
            style={{ borderRadius: el.style.borderRadius }}
          />
        )}
        {el.type === 'icon' && el.content && (
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <LucideIconComponent
              icon={el.content as LucideIconName}
              color={String(el.style.color || '#334155')}
              strokeWidth={Number(el.style.strokeWidth ?? 2)}
              width={el.width}
              height={el.height}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        )}
        {el.type === 'svg' && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full pointer-events-none overflow-visible"
          >
            <path
              d={el.content}
              fill={el.style.backgroundColor || 'transparent'}
              stroke={el.style.borderColor || 'transparent'}
              strokeWidth={
                parseInt(el.style.borderWidth?.toString() || '0') * (100 / el.width)
              }
              strokeDasharray={
                el.style.borderStyle === 'dashed'
                  ? '5,5'
                  : el.style.borderStyle === 'dotted'
                    ? '2,2'
                    : undefined
              }
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      {/* Selection chrome — never captured in image export */}
      <div className="editor-only controls" data-html2canvas-ignore="true">
      {el.isLocked && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 border-2 border-red-400">
          <LucideIconComponent icon="Lock" className="text-red-500" size={24} />
        </div>
      )}

      {isSelected && !el.isLocked && (
        <>
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />

          {(el.type === 'box' || el.type === 'image') &&
            (() => {
              const currentR = parseInt(el.style.borderRadius?.toString() || '0')
              const maxR = Math.min(el.width, el.height) / 2
              const visualOffset = Math.min(Math.max(12, currentR), maxR)
              const handleStyle =
                'absolute w-3 h-3 bg-white border border-blue-500 rounded-full cursor-grab z-40 hover:scale-125 transition-transform flex items-center justify-center'

              return (
                <>
                  <div
                    className={handleStyle}
                    style={{
                      top: `${visualOffset}px`,
                      left: `${visualOffset}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => onRadiusMouseDown(e, 'tl')}
                  />
                  <div
                    className={handleStyle}
                    style={{
                      top: `${visualOffset}px`,
                      right: `${visualOffset}px`,
                      transform: 'translate(50%, -50%)',
                    }}
                    onMouseDown={(e) => onRadiusMouseDown(e, 'tr')}
                  />
                  <div
                    className={handleStyle}
                    style={{
                      bottom: `${visualOffset}px`,
                      left: `${visualOffset}px`,
                      transform: 'translate(-50%, 50%)',
                    }}
                    onMouseDown={(e) => onRadiusMouseDown(e, 'bl')}
                  />
                  <div
                    className={handleStyle}
                    style={{
                      bottom: `${visualOffset}px`,
                      right: `${visualOffset}px`,
                      transform: 'translate(50%, 50%)',
                    }}
                    onMouseDown={(e) => onRadiusMouseDown(e, 'br')}
                  />
                  {mode === 'dragging_radius' && (
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-50 font-medium">
                      Radius {currentR}
                    </div>
                  )}
                </>
              )
            })()}

          {(() => {
            let rotationPos: 'top' | 'bottom' = 'bottom'

            if (mode === 'rotating' && rotationHandlePos) {
              rotationPos = rotationHandlePos
            } else if (toolbarRect) {
              const handleSize = 24
              const handleMargin = 8

              const bHandle = {
                left: el.x + el.width / 2 - handleSize / 2,
                right: el.x + el.width / 2 + handleSize / 2,
                top: el.y + el.height + handleMargin,
                bottom: el.y + el.height + handleMargin + handleSize,
              }

              const collidesWithBottom =
                toolbarRect.left < bHandle.right &&
                toolbarRect.left + toolbarRect.width > bHandle.left &&
                toolbarRect.top < bHandle.bottom &&
                toolbarRect.top + toolbarRect.height > bHandle.top

              if (collidesWithBottom) {
                rotationPos = 'top'
              }
            }

            currentRotationPosRef.current = rotationPos

            const isTop = rotationPos === 'top'
            const handleClass = isTop ? '-top-8' : '-bottom-8'
            const lineClass = isTop ? '-top-8' : '-bottom-8'

            return (
              <>
                <div
                  className={`absolute ${handleClass} left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-move hover:bg-blue-50 z-[60] shadow-sm`}
                  onMouseDown={onRotateMouseDown}
                >
                  <LucideIconComponent
                    icon="RotateCw"
                    size={12}
                    className="text-gray-600"
                  />
                </div>
                <div
                  className={`absolute ${lineClass} left-1/2 -translate-x-1/2 h-8 w-px bg-blue-500 pointer-events-none z-[59]`}
                />
              </>
            )
          })()}

          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-nw-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
          />
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-n-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'n')}
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-ne-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
          />

          <div
            className="absolute top-1/2 -translate-y-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-w-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'w')}
          />
          <div
            className="absolute top-1/2 -translate-y-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-e-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'e')}
          />

          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-sw-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
          />
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-s-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 's')}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-sm cursor-se-resize z-30"
            onMouseDown={(e) => onResizeMouseDown(e, 'se')}
          />
        </>
      )}
      </div>
    </div>
  )
}

export default ElementNode
