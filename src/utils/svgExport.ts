/** SVG shapes store fill/stroke in style; path data in content. Match Canvas rendering. */
export const buildSvgMarkup = (
  content: string | undefined,
  style: Record<string, unknown>,
  width: number
): string => {
  const fill = String(style.backgroundColor || 'transparent')
  const stroke = String(style.borderColor || 'transparent')
  const borderWidth = parseInt(String(style.borderWidth ?? '0'), 10) || 0
  const strokeWidth = borderWidth * (100 / Math.max(width, 1))
  const borderStyle = String(style.borderStyle || '')
  const dash =
    borderStyle === 'dashed'
      ? ' stroke-dasharray="5,5"'
      : borderStyle === 'dotted'
        ? ' stroke-dasharray="2,2"'
        : ''

  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible; display: block;">
          <path d="${content || ''}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${dash} vector-effect="non-scaling-stroke" />
        </svg>`
}
