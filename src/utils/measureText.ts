import type { CSSProperties } from 'react'
import type { Size } from '@/constants/library'

/** Soft cap so long body copy wraps instead of becoming one huge line. */
const MAX_TEXT_WIDTH = 480

/**
 * Measures how large a text element should be so the selection box
 * hugs the rendered content (same fonts/styles as the editor).
 */
export function measureTextBox(
  content: string,
  style: CSSProperties = {}
): Size {
  if (typeof document === 'undefined') {
    return { width: 200, height: 40 }
  }

  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.pointerEvents = 'none'
  el.style.left = '-99999px'
  el.style.top = '0'
  el.style.whiteSpace = 'pre-wrap'
  el.style.overflowWrap = 'break-word'
  el.style.wordBreak = 'break-word'
  el.style.boxSizing = 'border-box'
  el.style.width = 'max-content'
  el.style.maxWidth = `${MAX_TEXT_WIDTH}px`
  el.style.height = 'auto'

  el.style.fontSize = String(style.fontSize ?? '16px')
  el.style.fontWeight = String(style.fontWeight ?? 'normal')
  el.style.fontFamily = String(style.fontFamily ?? 'Inter, sans-serif')
  el.style.fontStyle = String(style.fontStyle ?? 'normal')
  el.style.letterSpacing = style.letterSpacing != null ? String(style.letterSpacing) : ''
  el.style.lineHeight = style.lineHeight != null ? String(style.lineHeight) : '1.25'
  el.style.padding = style.padding != null ? String(style.padding) : '0'
  if (style.border) el.style.border = String(style.border)

  el.textContent = content || ' '

  document.body.appendChild(el)
  const rect = el.getBoundingClientRect()
  document.body.removeChild(el)

  // +2px fudge for subpixel / italic overhang so glyphs aren't clipped
  return {
    width: Math.max(24, Math.ceil(rect.width) + 2),
    height: Math.max(20, Math.ceil(rect.height) + 2),
  }
}
