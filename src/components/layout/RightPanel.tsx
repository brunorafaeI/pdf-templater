import type { Dispatch, SetStateAction } from 'react'
import type {
  CanvasSettings,
  EditorElement,
  Page,
  TemplateState,
} from '@/types'
import type { RightTab } from '@/hooks'
import { LucideIconComponent } from '@/components/icon'
import PropertiesPanel from '@/components/panels/PropertiesPanel'
import LayersPanel from '@/components/panels/LayersPanel'
import PagesPanel from '@/components/panels/PagesPanel'

interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  activeTab: RightTab
  onTabChange: (tab: RightTab) => void
  state: TemplateState
  setState: Dispatch<SetStateAction<TemplateState>>
  activePage: Page
  selectedElement: EditorElement | null
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void
  onDeleteElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onReorderElements: (dragIndex: number, hoverIndex: number) => void
  onAddPage: () => void
  onDeletePage: (id: string) => void
  onDuplicatePage: (id: string) => void
  onRenamePage: (id: string, name: string) => void
}

export default function RightPanel({
  isOpen,
  onClose,
  onOpen,
  activeTab,
  onTabChange,
  state,
  setState,
  activePage,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElements,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onRenamePage,
}: RightPanelProps) {
  return (
    <>
      <div
        className={`absolute right-4 top-12 bottom-4 w-80 h-[80vh] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col text-slate-800 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}
      >
        <div className="flex border-b border-gray-100 bg-gray-50 rounded-t-xl px-2">
          <button
            onClick={() => onTabChange('properties')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Properties
          </button>
          <button
            onClick={() => onTabChange('layers')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'layers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Layers
          </button>
          <button
            onClick={() => onTabChange('pages')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'pages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pages
          </button>
          <button
            onClick={onClose}
            className="px-2 text-gray-400 hover:text-gray-600"
          >
            <LucideIconComponent icon="X" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-white rounded-b-xl">
          {activeTab === 'properties' && (
            <PropertiesPanel
              element={selectedElement}
              onChange={onUpdateElement}
              onDelete={onDeleteElement}
              canvasSettings={state.canvasSettings}
              onCanvasSettingChange={(settings: Partial<CanvasSettings>) =>
                setState((prev) => ({
                  ...prev,
                  canvasSettings: { ...prev.canvasSettings, ...settings },
                }))
              }
              activePage={activePage}
              onPageUpdate={(id, updates) => {
                setState((prev) => ({
                  ...prev,
                  pages: prev.pages.map((p) =>
                    p.id === id ? { ...p, ...updates } : p
                  ),
                }))
              }}
            />
          )}
          {activeTab === 'layers' && (
            <LayersPanel
              elements={activePage.elements}
              selectedId={state.selectedId}
              onSelect={(id) =>
                setState((prev) => ({ ...prev, selectedId: id }))
              }
              onUpdate={onUpdateElement}
              onDelete={onDeleteElement}
              onDuplicate={onDuplicateElement}
              onReorder={onReorderElements}
            />
          )}
          {activeTab === 'pages' && (
            <PagesPanel
              pages={state.pages}
              activePageId={state.activePageId}
              onSelectPage={(id) =>
                setState((prev) => ({
                  ...prev,
                  activePageId: id,
                  selectedId: null,
                }))
              }
              onAddPage={onAddPage}
              onDeletePage={onDeletePage}
              onDuplicatePage={onDuplicatePage}
              onRenamePage={onRenamePage}
            />
          )}
        </div>
      </div>

      {!isOpen && (
        <button
          onClick={onOpen}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-l-lg shadow-lg border border-r-0 border-gray-200 text-blue-600 hover:text-blue-700 hover:pl-4 transition-all z-40"
        >
          <LucideIconComponent icon="ChevronLeft" size={20} />
        </button>
      )}
    </>
  )
}
