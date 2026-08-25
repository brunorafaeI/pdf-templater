import type { GotenbergEndpointType } from '@/services/gotenberg.client'
import { LucideIconComponent } from '@/components/icon'

interface GotenbergModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  onUrlChange: (url: string) => void
  endpointType: GotenbergEndpointType
  onEndpointTypeChange: (type: GotenbergEndpointType) => void
  error: string | null
  loading: boolean
  defaultUrl: string
  onSend: () => void
}

export default function GotenbergModal({
  isOpen,
  onClose,
  url,
  onUrlChange,
  endpointType,
  onEndpointTypeChange,
  error,
  loading,
  defaultUrl,
  onSend,
}: GotenbergModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Export to PDF via API</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <LucideIconComponent icon="X" size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Send the template HTML to your endpoint and download the generated PDF.
        </p>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Endpoint URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={defaultUrl}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <label className="block text-sm font-medium text-gray-700">
            Endpoint type
          </label>
          <select
            value={endpointType}
            onChange={(e) =>
              onEndpointTypeChange(e.target.value as GotenbergEndpointType)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="n8n">n8n webhook (form field &quot;data&quot;)</option>
            <option value="gotenberg">
              Gotenberg API (Chromium convert/html)
            </option>
          </select>
        </div>
        {error && (
          <div className="mt-3 p-2 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onSend}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-2"
          >
            {loading ? 'Sending…' : 'Send & download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
