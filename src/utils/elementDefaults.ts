import type { CSSProperties } from 'react'
import type { ElementType } from '@/types'
import type { Size } from '@/constants/library'

const DEFAULT_SIZES: Record<ElementType, Size> = {
  text: { width: 300, height: 100 },
  image: { width: 300, height: 200 },
  box: { width: 150, height: 150 },
  circle: { width: 150, height: 150 },
  line: { width: 200, height: 2 },
  svg: { width: 200, height: 150 },
  icon: { width: 64, height: 64 },
}

export const getDefaultElementSize = (
  type: ElementType,
  override?: Partial<Size>
): Size => {
  const base = DEFAULT_SIZES[type] ?? { width: 200, height: 100 }
  return {
    width: override?.width ?? base.width,
    height: override?.height ?? base.height,
  }
}

export const getDefaultElementStyles = (
  type: ElementType,
  extraStyle: CSSProperties = {}
): CSSProperties => ({
  backgroundColor: type === 'box' ? '#3b82f6' : 'transparent',
  color: type === 'icon' ? '#334155' : '#000000',
  fontSize: '16px',
  padding: type === 'text' ? '2px' : '0px',
  ...extraStyle,
})
