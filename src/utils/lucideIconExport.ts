import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { icons } from 'lucide-react'

/** Serializes a Lucide icon to inline SVG for HTML/PDF export. */
export const buildLucideIconMarkup = (
  iconName: string | undefined,
  style: Record<string, unknown>,
  width: number,
  height: number
): string => {
  if (!iconName || !(iconName in icons)) return ''

  const Icon = icons[iconName as keyof typeof icons]
  const color = String(style.color || '#334155')
  const strokeWidth = Number(style.strokeWidth ?? 2)

  return renderToStaticMarkup(
    createElement(Icon, {
      color,
      strokeWidth,
      width,
      height,
      'aria-hidden': true,
    })
  )
}
