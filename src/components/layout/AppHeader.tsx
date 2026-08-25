import type { Dispatch, SetStateAction } from 'react'
import type { TemplateState } from '@/types'
import { LucideIconComponent } from '@/components/icon'
import ExportMenu from './ExportMenu'

interface AppHeaderProps {
  state: TemplateState
  setState: Dispatch<SetStateAction<TemplateState>>
  isExportOpen: boolean
  setIsExportOpen: (open: boolean) => void
  onOpenGotenberg: () => void
}

export default function AppHeader({
  state,
  setState,
  isExportOpen,
  setIsExportOpen,
  onOpenGotenberg,
}: AppHeaderProps) {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-[100] relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/20">
              T
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2"></div>

          <input
            type="text"
            value={state.name}
            onChange={(e) =>
              setState((prev) => ({ ...prev, name: e.target.value }))
            }
            className="bg-transparent text-sm font-semibold text-white px-2 py-1 rounded hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-blue-500/50 outline-none transition-all w-48 placeholder-slate-500"
            placeholder="Untitled Template"
          />

          <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-1 hidden md:flex">
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  canvasSettings: {
                    ...prev.canvasSettings,
                    showHorizontalRuler: !prev.canvasSettings.showHorizontalRuler,
                  },
                }))
              }
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.showHorizontalRuler ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500'}`}
              title="Toggle Horizontal Ruler"
            >
              <LucideIconComponent icon="MoveHorizontal" size={16} />
            </button>
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  canvasSettings: {
                    ...prev.canvasSettings,
                    showVerticalRuler: !prev.canvasSettings.showVerticalRuler,
                  },
                }))
              }
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.showVerticalRuler ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500'}`}
              title="Toggle Vertical Ruler"
            >
              <LucideIconComponent icon="MoveVertical" size={16} />
            </button>

            <div className="h-6 w-px bg-slate-800 mx-2"></div>

            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  canvasSettings: {
                    ...prev.canvasSettings,
                    autoSave: !prev.canvasSettings.autoSave,
                  },
                }))
              }
              className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.autoSave ? 'text-emerald-400' : 'text-slate-500'}`}
              title="Auto-save"
            >
              <LucideIconComponent icon="Save" size={16} />
              <span className="text-xs font-medium">
                {state.canvasSettings.autoSave ? 'Saved' : 'Save Off'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ExportMenu
          isOpen={isExportOpen}
          onToggle={() => setIsExportOpen(!isExportOpen)}
          onClose={() => setIsExportOpen(false)}
          state={state}
          onOpenGotenberg={() => {
            setIsExportOpen(false)
            onOpenGotenberg()
          }}
        />
      </div>
    </header>
  )
}
