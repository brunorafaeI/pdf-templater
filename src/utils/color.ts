export interface Hsva {
  h: number
  s: number
  v: number
  a: number
}

/** Converts HEX (3, 6 or 8 digits) or `transparent` to HSVA. */
export const hexToHsva = (hex: string): Hsva => {
  let r = 0
  let g = 0
  let b = 0
  let a = 1
  if (hex === 'transparent') return { h: 0, s: 0, v: 0, a: 0 }

  hex = hex.replace('#', '')

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
    a = parseInt(hex.substring(6, 8), 16) / 255
  }

  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, v: v * 100, a }
}

/** Converts HSVA to HEX6 or HEX8 (when alpha < 1). */
export const hsvaToHex = (h: number, s: number, v: number, a: number): string => {
  if (a === 0 && h === 0 && s === 0 && v === 0) return 'transparent'

  const vNorm = v / 100
  const S = s / 100
  const C = vNorm * S
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vNorm - C

  let R1 = 0
  let G1 = 0
  let B1 = 0
  if (h >= 0 && h < 60) {
    R1 = C
    G1 = X
    B1 = 0
  } else if (h >= 60 && h < 120) {
    R1 = X
    G1 = C
    B1 = 0
  } else if (h >= 120 && h < 180) {
    R1 = 0
    G1 = C
    B1 = X
  } else if (h >= 180 && h < 240) {
    R1 = 0
    G1 = X
    B1 = C
  } else if (h >= 240 && h < 300) {
    R1 = X
    G1 = 0
    B1 = C
  } else if (h >= 300 && h < 360) {
    R1 = C
    G1 = 0
    B1 = X
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const alphaHex = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')

  return `#${toHex(R1)}${toHex(G1)}${toHex(B1)}${alphaHex === 'ff' ? '' : alphaHex}`
}

export const DEFAULT_COLORS = [
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#B7B7B7',
  '#CCCCCC',
  '#D9D9D9',
  '#FFFFFF',
  '#980000',
  '#FF0000',
  '#FF9900',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#4A86E8',
  '#0000FF',
  '#9900FF',
  '#FF00FF',
  '#E6B8AF',
  '#F4CCCC',
  '#FCE5CD',
  '#FFF2CC',
  '#D9EAD3',
  '#D0E0E3',
  '#C9DAF8',
  '#CFE2F3',
  '#D9D2E9',
  '#EAD1DC',
  '#DD7E6B',
  '#EA9999',
  '#F9CB9C',
  '#FFE599',
]

/** Session-scoped recent colors store. */
export const recentColorsStore: string[] = []
