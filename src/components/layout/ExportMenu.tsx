import type { TemplateState } from '@/types'
import { LucideIconComponent } from '@/components/icon'
import {
  downloadHTML,
  downloadImage,
  printToPDF,
  downloadGotenbergZip,
} from '@/services/export.service'

interface ExportMenuProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  state: TemplateState
  onOpenGotenberg: () => void
  /** Clears canvas selection so chrome is not captured in raster exports. */
  onClearSelection?: () => void
}

export default function ExportMenu({
  isOpen,
  onToggle,
  onClose,
  state,
  onOpenGotenberg,
  onClearSelection,
}: ExportMenuProps) {
  const exportImage = async (format: 'jpeg' | 'png') => {
    onClearSelection?.()
    // Wait for React to unmount selection chrome
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
    await downloadImage('canvas-root', format)
  }

  return (
    <div className="group relative">
      <button
        onClick={onToggle}
        onBlur={() => setTimeout(onClose, 200)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        <LucideIconComponent icon="Download" size={16} />
        Export
        <LucideIconComponent
          icon="ChevronDown"
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-lg shadow-2xl border border-gray-200 z-[110] transform transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="p-3 border-b border-gray-100">
          <h4 className="font-semibold text-sm text-gray-800">Download</h4>
          <p className="text-xs text-gray-400 mt-0.5">Select a file format</p>
        </div>

        <div className="p-2 space-y-1">
          <button
            onClick={() => exportImage('jpeg')}
            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
              <LucideIconComponent icon="FileImage" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">JPG</div>
              <div className="text-xs text-gray-500">
                Ideal for sharing and social media
              </div>
            </div>
          </button>

          <button
            onClick={() => exportImage('png')}
            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
              <LucideIconComponent icon="FileType" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">PNG</div>
              <div className="text-xs text-gray-500">
                Best for complex images & transparency
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              printToPDF(state.pages, state.canvasSettings.backgroundColor)
            }
            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group"
          >
            <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
              <LucideIconComponent icon="FileText" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">PDF</div>
              <div className="text-xs text-gray-500">
                Ideal for documents and printing
              </div>
            </div>
          </button>
        </div>

        <div className="border-t border-gray-100 p-2 bg-gray-50 rounded-b-lg space-y-1">
          <button
            onClick={() => downloadGotenbergZip(state)}
            className="w-full text-left px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-md flex items-start gap-3 transition-all group"
          >
            <div className="p-2 bg-orange-100 rounded text-orange-600">
              <LucideIconComponent icon="FileCode" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-orange-700">
                Gotenberg Package
              </div>
              <div className="text-xs text-orange-500/70">
                ZIP for Chromium PDF API
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              downloadHTML(state.pages, state.canvasSettings.backgroundColor)
            }
            className="w-full text-left px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-md flex items-start gap-3 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded text-blue-600">
              <LucideIconComponent icon="Code" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">HTML & CSS</div>
              <div className="text-xs text-blue-500/70">
                Get the full source code
              </div>
            </div>
          </button>

          <button
            onClick={onOpenGotenberg}
            className="w-full text-left px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-md flex items-start gap-3 transition-all group"
          >
            <div className="p-2 bg-emerald-100 rounded text-emerald-600">
              <LucideIconComponent icon="Send" size={18} />
            </div>
            <div>
              <div className="text-sm font-medium text-emerald-700">
                Send to API → PDF
              </div>
              <div className="text-xs text-emerald-500/70">
                n8n webhook or Gotenberg, get PDF
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
