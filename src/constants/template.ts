import type { TemplateState } from '@/types'

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

export const GOTENBERG_URL_KEY = 'pdf-templater-gotenberg-url'
export const DEFAULT_GOTENBERG_URL =
  'https://n8n.securit.fr/webhook/65bc3e65-3597-4c6f-a0cc-69df4a980239'

export const createInitialTemplateState = (): TemplateState => ({
  name: 'Demo Template',
  pages: [{ id: 'page-1', name: 'Page 1', elements: [] }],
  activePageId: 'page-1',
  selectedId: null,
  canvasSettings: {
    backgroundColor: '#ffffff',
    showHorizontalRuler: true,
    showVerticalRuler: true,
    showGuides: true,
    autoSave: true,
    header: {
      enabled: false,
      height: 60,
      htmlContent: '<h1 style="margin:0; font-size: 18px;">Page Title</h1>',
      alignment: 'center',
    },
    footer: {
      enabled: false,
      height: 40,
      type: 'pagination',
      paginationPrefix: 'Page',
      paginationFormat: 'numeric',
      alignment: 'center',
    },
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  horizontalGuides: [],
  verticalGuides: [],
})
