import { useState, useCallback } from 'react'
import type { TemplateState } from '@/types'
import {
  GOTENBERG_URL_KEY,
  DEFAULT_GOTENBERG_URL,
} from '@/constants/template'
import {
  sendHtmlToPdfAndDownload,
  type GotenbergEndpointType,
} from '@/services/gotenberg.client'

export function useGotenbergExport() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [url, setUrl] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(GOTENBERG_URL_KEY) || DEFAULT_GOTENBERG_URL
      : DEFAULT_GOTENBERG_URL
  )
  const [endpointType, setEndpointType] =
    useState<GotenbergEndpointType>('n8n')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const openModal = useCallback(() => {
    setError(null)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const sendAndDownload = useCallback(
    async (state: TemplateState) => {
      setError(null)
      try {
        if (url.trim()) localStorage.setItem(GOTENBERG_URL_KEY, url.trim())
        setLoading(true)
        await sendHtmlToPdfAndDownload(state, {
          url: url.trim() || DEFAULT_GOTENBERG_URL,
          endpointType,
          outputFilename: state.name || 'template',
        })
        setIsModalOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    },
    [url, endpointType]
  )

  return {
    isModalOpen,
    openModal,
    closeModal,
    url,
    setUrl,
    endpointType,
    setEndpointType,
    error,
    loading,
    sendAndDownload,
    defaultUrl: DEFAULT_GOTENBERG_URL,
  }
}
