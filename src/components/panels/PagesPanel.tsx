import React from 'react'
import { Page } from '@/types'
import { LucideIconComponent } from '@/components/icon'

interface PagesPanelProps {
  pages: Page[]
  activePageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => void
  onDeletePage: (id: string) => void
  onDuplicatePage: (id: string) => void
  onRenamePage: (id: string, newName: string) => void
}

const PagesPanel: React.FC<PagesPanelProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onRenamePage,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 text-sm">Pages</h3>
        <button
          onClick={onAddPage}
          className="p-1 hover:bg-blue-50 text-blue-600 rounded flex items-center gap-1 text-xs font-medium"
        >
          <LucideIconComponent icon="FilePlus" size={14} /> Add Page
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {pages.map((page, index) => (
          <div
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className={`
              relative flex flex-row items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all h-20
              ${activePageId === page.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
            `}
          >
            <div className="h-full aspect-[1/1.41] bg-white border border-gray-200 rounded-sm shadow-sm relative overflow-hidden opacity-90 pointer-events-none flex-shrink-0">
              {page.elements.slice(0, 10).map((el) => (
                <div
                  key={el.id}
                  className="absolute bg-gray-300 opacity-50"
                  style={{
                    left: `${(el.x / 794) * 100}%`,
                    top: `${(el.y / 1123) * 100}%`,
                    width: `${(el.width / 794) * 100}%`,
                    height: `${(el.height / 1123) * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2 font-medium text-xs text-gray-700">
                <LucideIconComponent
                  icon="FileText"
                  size={12}
                  className={
                    activePageId === page.id ? 'text-blue-600' : 'text-gray-400'
                  }
                />
                <input
                  type="text"
                  value={page.name}
                  onChange={(e) => onRenamePage(page.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-xs w-full"
                />
              </div>
              <div className="text-[9px] text-gray-400">
                {index + 1} • {page.elements.length} Elements
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {activePageId === page.id && (
                <LucideIconComponent
                  icon="Check"
                  size={12}
                  className="text-blue-600 self-end"
                />
              )}
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicatePage(page.id)
                  }}
                  className="p-1 hover:bg-white rounded text-gray-500 hover:text-blue-600"
                  title="Duplicate"
                >
                  <LucideIconComponent icon="Copy" size={10} />
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePage(page.id)
                    }}
                    className="p-1 hover:bg-white rounded text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    <LucideIconComponent icon="Trash2" size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PagesPanel
