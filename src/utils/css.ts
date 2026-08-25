export const cssToStyleString = (style: Record<string, unknown>): string => {
  if (!style) return ''
  return Object.entries(style)
    .map(([key, value]) => {
      if (value === undefined || value === null) return ''
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      return `${kebabKey}: ${value};`
    })
    .filter((s) => s !== '')
    .join(' ')
}
