import { useState } from 'react'
import { useTemplateEditor, useGotenbergExport } from '@/hooks'
import { AppHeader, GotenbergModal, RightPanel } from '@/components/layout'
import LeftSidebar from '@/components/panels/LeftSidebar'
import Canvas from '@/components/canvas/Canvas'

const App = () => {
  const editor = useTemplateEditor()
  const gotenberg = useGotenbergExport()
  const [isExportOpen, setIsExportOpen] = useState(false)

  const { state, setState, activePage, selectedElement } = editor

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      <AppHeader
        state={state}
        setState={setState}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        onOpenGotenberg={gotenberg.openModal}
        onClearSelection={() =>
          setState((prev) => ({ ...prev, selectedId: null }))
        }
      />

      <GotenbergModal
        isOpen={gotenberg.isModalOpen}
        onClose={gotenberg.closeModal}
        url={gotenberg.url}
        onUrlChange={gotenberg.setUrl}
        endpointType={gotenberg.endpointType}
        onEndpointTypeChange={gotenberg.setEndpointType}
        error={gotenberg.error}
        loading={gotenberg.loading}
        defaultUrl={gotenberg.defaultUrl}
        onSend={() => gotenberg.sendAndDownload(state)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="h-full z-40 bg-slate-900 transition-all duration-300 ease-in-out shadow-r-xl">
          <LeftSidebar onAddElement={editor.addElement} />
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out">
          <Canvas
            pages={state.pages}
            activePageId={state.activePageId}
            selectedId={state.selectedId}
            onSelect={(id) => setState((prev) => ({ ...prev, selectedId: id }))}
            onUpdate={editor.updateElement}
            onDelete={editor.deleteElement}
            onDuplicate={editor.duplicateElement}
            canvasSettings={state.canvasSettings}
            horizontalGuides={state.horizontalGuides}
            verticalGuides={state.verticalGuides}
            onAddGuide={(type, pos) => {
              if (type === 'horizontal') {
                setState((prev) => ({
                  ...prev,
                  horizontalGuides: [...prev.horizontalGuides, pos],
                }))
              } else {
                setState((prev) => ({
                  ...prev,
                  verticalGuides: [...prev.verticalGuides, pos],
                }))
              }
            }}
            onRemoveGuide={(type, index) => {
              if (type === 'horizontal') {
                setState((prev) => ({
                  ...prev,
                  horizontalGuides: prev.horizontalGuides.filter(
                    (_, i) => i !== index
                  ),
                }))
              } else {
                setState((prev) => ({
                  ...prev,
                  verticalGuides: prev.verticalGuides.filter(
                    (_, i) => i !== index
                  ),
                }))
              }
            }}
          />
        </div>

        <RightPanel
          isOpen={editor.isRightPanelOpen}
          onClose={() => editor.setIsRightPanelOpen(false)}
          onOpen={() => editor.setIsRightPanelOpen(true)}
          activeTab={editor.activeRightTab}
          onTabChange={editor.setActiveRightTab}
          state={state}
          setState={setState}
          activePage={activePage}
          selectedElement={selectedElement}
          onUpdateElement={editor.updateElement}
          onDeleteElement={editor.deleteElement}
          onDuplicateElement={editor.duplicateElement}
          onReorderElements={editor.reorderElements}
          onAddPage={editor.addPage}
          onDeletePage={editor.deletePage}
          onDuplicatePage={editor.duplicatePage}
          onRenamePage={editor.renamePage}
        />
      </div>
    </div>
  )
}

export default App
