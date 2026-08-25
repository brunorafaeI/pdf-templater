import type { CSSProperties } from 'react'
import type { Size } from '@/constants/library'

/** Soft cap so long body copy wraps instead of becoming one huge line. */
const MAX_TEXT_WIDTH = 480

/** Vertical safety margin as a fraction of font-size (ascenders / descenders / script fonts). */
const V_MARGIN_RATIO = 0.35
/** Horizontal safety margin as a fraction of font-size (italic / cursive overhang). */
const H_MARGIN_RATIO = 0.2

export function getTextPaddingForFontSize(fontSize: string | number | undefined): string {
  const fs = parseFloat(String(fontSize ?? '16')) || 16
  return `${Math.max(4, Math.ceil(fs * 0.25))}px`
}

/**
 * Measures how large a text element should be so the selection box
 * hugs the rendered content without clipping glyphs.
 */
export function measureTextBox(
  content: string,
  style: CSSProperties = {}
): Size {
  if (typeof document === 'undefined') {
    return { width: 200, height: 40 }
  }

  const fontSizePx = parseFloat(String(style.fontSize ?? '16')) || 16
  const padding =
    style.padding != null
      ? String(style.padding)
      : getTextPaddingForFontSize(fontSizePx)

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
  el.style.letterSpacing =
    style.letterSpacing != null ? String(style.letterSpacing) : ''
  // Slightly taller line-box than 1.0 so ascenders are not cramped
  el.style.lineHeight =
    style.lineHeight != null ? String(style.lineHeight) : '1.3'
  el.style.padding = padding
  if (style.border) el.style.border = String(style.border)

  el.textContent = content || ' '

  document.body.appendChild(el)
  const rect = el.getBoundingClientRect()
  document.body.removeChild(el)

  const vMargin = Math.ceil(fontSizePx * V_MARGIN_RATIO)
  const hMargin = Math.ceil(fontSizePx * H_MARGIN_RATIO)

  return {
    width: Math.max(24, Math.ceil(rect.width) + hMargin),
    height: Math.max(20, Math.ceil(rect.height) + vMargin),
  }
}
