import type { TemplateState } from '@/types'
import { generateGotenbergHTML } from './export.service'

/** Convert px to inches at 96 DPI (A4 canvas). */
const pxToInches = (px: number) => px / 96

export type GotenbergEndpointType = 'n8n' | 'gotenberg'

export interface GotenbergClientOptions {
  /** Full URL: n8n webhook or Gotenberg API (e.g. .../forms/chromium/convert/html). */
  url: string
  /** How the endpoint expects the request. */
  endpointType: GotenbergEndpointType
  /** Optional custom filename for the PDF (without .pdf). */
  outputFilename?: string
}

const DEFAULT_N8N_WEBHOOK_URL =
  'https://n8n.securit.fr/webhook/65bc3e65-3597-4c6f-a0cc-69df4a980239'

/**
 * Sends the current template as HTML to the configured endpoint and returns the PDF blob.
 * - n8n: POST form-data with field "data" (binary file index.html). Response = PDF.
 * - gotenberg: POST multipart with index.html, header.html, footer.html + form fields. Response = PDF.
 */
export async function sendHtmlToPdf(
  state: TemplateState,
  options: GotenbergClientOptions
): Promise<Blob> {
  const { url, endpointType, outputFilename } = options
  const baseUrl = (url || DEFAULT_N8N_WEBHOOK_URL).trim()
  if (!baseUrl) throw new Error('Gotenberg endpoint URL is required.')

  const { indexHtml, headerHtml, footerHtml, margins } = generateGotenbergHTML(state)

  if (endpointType === 'n8n') {
    const form = new FormData()
    const blob = new Blob([indexHtml], { type: 'text/html' })
    form.append('data', blob, 'index.html')
    const res = await fetch(baseUrl, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`n8n webhook error ${res.status}: ${text || res.statusText}`)
    }
    return res.blob()
  }

  // Direct Gotenberg API: form field "files" with filename index.html (and optional header/footer)
  const form = new FormData()
  form.append('files', new Blob([indexHtml], { type: 'text/html' }), 'index.html')
  if (headerHtml) {
    form.append('files', new Blob([headerHtml], { type: 'text/html' }), 'header.html')
  }
  if (footerHtml) {
    form.append('files', new Blob([footerHtml], { type: 'text/html' }), 'footer.html')
  }
  form.append('paperWidth', '8.27')
  form.append('paperHeight', '11.7')
  form.append('printBackground', 'true')
  form.append('marginTop', String(pxToInches(margins.top)))
  form.append('marginBottom', String(pxToInches(margins.bottom)))
  form.append('marginLeft', String(pxToInches(margins.left)))
  form.append('marginRight', String(pxToInches(margins.right)))

  const headers: Record<string, string> = {}
  if (outputFilename) {
    headers['Gotenberg-Output-Filename'] = outputFilename.replace(/\.pdf$/i, '')
  }

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gotenberg API error ${res.status}: ${text || res.statusText}`)
  }
  return res.blob()
}

/**
 * Sends HTML to the endpoint and triggers download of the returned PDF.
 */
export async function sendHtmlToPdfAndDownload(
  state: TemplateState,
  options: GotenbergClientOptions
): Promise<void> {
  const blob = await sendHtmlToPdf(state, options)
  const name = state.name || 'template'
  const filename = (options.outputFilename || name).replace(/\.pdf$/i, '') + '.pdf'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
