import React from 'react'
import { EditorElement } from '@/types'
import { LucideIconComponent } from '@/components/icon'

interface LayersPanelProps {
  elements: EditorElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<EditorElement>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onReorder,
}) => {
  const reversedElements = [...elements].reverse()

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('index'))
    const actualDragIndex = elements.length - 1 - dragIndex
    const actualDropIndex = elements.length - 1 - dropIndex

    if (actualDragIndex !== actualDropIndex) {
      onReorder(actualDragIndex, actualDropIndex)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 text-sm">Calques (Layers)</h3>
        <span className="text-xs text-gray-400">{elements.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {reversedElements.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No layers yet. Add something!
          </div>
        )}
        {reversedElements.map((el, visualIndex) => (
          <div
            key={el.id}
            draggable
            onDragStart={(e) => handleDragStart(e, visualIndex)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, visualIndex)}
            onClick={() => onSelect(el.id)}
            className={`
              flex items-center gap-2 p-2 px-3 border-b border-gray-50 cursor-pointer group hover:bg-blue-50 transition-colors
              ${selectedId === el.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
            `}
          >
            <div className="text-gray-500">
              {el.type === 'text' && <LucideIconComponent icon="Type" size={14} />}
              {el.type === 'image' && <LucideIconComponent icon="Image" size={14} />}
              {(el.type === 'box' || el.type === 'circle' || el.type === 'line') && (
                <LucideIconComponent icon="Square" size={14} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                {el.name || el.content || 'Untitled Layer'}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate(el.id, { isLocked: !el.isLocked })
                }}
                className={`p-1 hover:bg-gray-200 rounded ${el.isLocked ? 'text-red-500 opacity-100' : 'text-gray-400'}`}
              >
                {el.isLocked ? (
                  <LucideIconComponent icon="Lock" size={12} />
                ) : (
                  <LucideIconComponent icon="Unlock" size={12} />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate(el.id, { isVisible: !el.isVisible })
                }}
                className={`p-1 hover:bg-gray-200 rounded ${!el.isVisible ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {el.isVisible ? (
                  <LucideIconComponent icon="Eye" size={12} />
                ) : (
                  <LucideIconComponent icon="EyeOff" size={12} />
                )}
              </button>

              <div className="relative group/menu">
                <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                  <LucideIconComponent icon="MoreHorizontal" size={12} />
                </button>
                <div className="absolute right-0 top-full hidden group-hover/menu:block bg-white shadow-xl border border-gray-200 rounded-md z-50 w-32 py-1">
                  <button
                    onClick={() => onDuplicate(el.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LucideIconComponent icon="Copy" size={12} /> Duplicate
                  </button>
                  <button
                    onClick={() => onDelete(el.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LucideIconComponent icon="Trash2" size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
            {el.isLocked && (
              <div className="text-red-400 opacity-100 group-hover:hidden">
                <LucideIconComponent icon="Lock" size={10} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LayersPanel
