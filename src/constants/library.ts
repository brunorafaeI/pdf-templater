import type { ElementType } from '@/types'
import type { LucideIconName } from '@/components/icon'

export interface Size {
  width: number
  height: number
}

export type ShapePreview =
  | 'box'
  | 'circle'
  | 'line'
  | 'box-outline'
  | 'circle-outline'

export interface ShapeDefinition {
  type: ElementType
  label: string
  isOutlined: boolean
  defaultSize: Size
  /** SVG path data when type is `svg`. */
  path?: string
  /** Lucide icon used as preview for path-based shapes. */
  lucideIcon?: LucideIconName
  /** CSS preview for primitive shapes (box/circle/line). */
  preview?: ShapePreview
}

export const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
  'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=400&q=80',
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
  'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=400&q=80',
] as const

export const TEXT_STYLES = [
  {
    label: 'Add a heading',
    fontSize: '32px',
    fontWeight: 'bold',
    content: 'Heading',
  },
  {
    label: 'Add a subheading',
    fontSize: '24px',
    fontWeight: '600',
    content: 'Subheading',
  },
  {
    label: 'Add body text',
    fontSize: '16px',
    fontWeight: 'normal',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
] as const

export const SHAPES_LIB: ShapeDefinition[] = [
  {
    type: 'box',
    label: 'Square (Filled)',
    isOutlined: false,
    defaultSize: { width: 150, height: 150 },
    preview: 'box',
  },
  {
    type: 'circle',
    label: 'Circle (Filled)',
    isOutlined: false,
    defaultSize: { width: 150, height: 150 },
    preview: 'circle',
  },
  {
    type: 'svg',
    path: 'M 50 5 L 95 90 L 5 90 Z',
    lucideIcon: 'Triangle',
    label: 'Triangle (Filled)',
    isOutlined: false,
    defaultSize: { width: 200, height: 150 },
  },
  {
    type: 'svg',
    path: 'M 50 0 L 61 35 H 98 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 H 39 Z',
    lucideIcon: 'Star',
    label: 'Star (Filled)',
    isOutlined: false,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'svg',
    path: 'M50 92 C20 70 8 50 8 32 C8 18 18 8 32 8 C40 8 46 12 50 20 C54 12 60 8 68 8 C82 8 92 18 92 32 C92 50 80 70 50 92 Z',
    lucideIcon: 'Heart',
    label: 'Heart (Filled)',
    isOutlined: false,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'svg',
    path: 'M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z',
    lucideIcon: 'Hexagon',
    label: 'Hexagon (Filled)',
    isOutlined: false,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'box',
    label: 'Square (Outlined)',
    isOutlined: true,
    defaultSize: { width: 150, height: 150 },
    preview: 'box-outline',
  },
  {
    type: 'circle',
    label: 'Circle (Outlined)',
    isOutlined: true,
    defaultSize: { width: 150, height: 150 },
    preview: 'circle-outline',
  },
  {
    type: 'svg',
    path: 'M 50 5 L 95 90 L 5 90 Z',
    lucideIcon: 'Triangle',
    label: 'Triangle (Outlined)',
    isOutlined: true,
    defaultSize: { width: 200, height: 150 },
  },
  {
    type: 'svg',
    path: 'M 50 0 L 61 35 H 98 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 H 39 Z',
    lucideIcon: 'Star',
    label: 'Star (Outlined)',
    isOutlined: true,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'svg',
    path: 'M50 92 C20 70 8 50 8 32 C8 18 18 8 32 8 C40 8 46 12 50 20 C54 12 60 8 68 8 C82 8 92 18 92 32 C92 50 80 70 50 92 Z',
    lucideIcon: 'Heart',
    label: 'Heart (Outlined)',
    isOutlined: true,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'svg',
    path: 'M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z',
    lucideIcon: 'Hexagon',
    label: 'Hexagon (Outlined)',
    isOutlined: true,
    defaultSize: { width: 150, height: 150 },
  },
  {
    type: 'line',
    label: 'Line',
    isOutlined: false,
    defaultSize: { width: 200, height: 2 },
    preview: 'line',
  },
]

export const FUN_TEXTS = [
  {
    content: 'SPECIAL OFFER',
    color: '#ef4444',
    fontFamily: 'Anton, sans-serif',
    fontSize: '28px',
  },
  {
    content: 'BUY ONE GET ONE',
    color: '#bef264',
    fontFamily: 'Oswald, sans-serif',
    fontWeight: 'bold',
    fontSize: '24px',
  },
  {
    content: 'Family Friendly',
    color: '#c084fc',
    fontFamily: 'Pacifico, cursive',
    fontSize: '24px',
  },
  {
    content: 'Winter Collection',
    color: '#60a5fa',
    fontFamily: 'Playfair Display, serif',
    fontWeight: 'bold',
    fontSize: '24px',
  },
  {
    content: 'FOLLOW US',
    color: '#ffffff',
    fontFamily: 'Anton, sans-serif',
    letterSpacing: '2px',
    fontSize: '28px',
  },
  {
    content: 'DOWNLOAD NOW',
    color: '#4ade80',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '900',
    fontSize: '20px',
  },
  {
    content: 'COMING SOON',
    color: '#60a5fa',
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: 'bold',
    fontSize: '22px',
  },
  {
    content: "Don't miss out!",
    color: '#facc15',
    fontFamily: 'Caveat, cursive',
    fontSize: '32px',
  },
  {
    content: 'SALE ENDS SOON',
    color: '#fb923c',
    fontFamily: 'Anton, sans-serif',
    fontStyle: 'italic',
    fontSize: '24px',
  },
  {
    content: 'Premium Quality',
    color: '#a78bfa',
    fontFamily: 'Playfair Display, serif',
    fontSize: '24px',
  },
  {
    content: 'Thank you!',
    color: '#f472b6',
    fontFamily: 'Caveat, cursive',
    fontSize: '28px',
  },
  {
    content: 'JOIN US TODAY',
    color: '#818cf8',
    fontFamily: 'Oswald, sans-serif',
    fontSize: '24px',
  },
  {
    content: 'BEST SELLER',
    color: '#38bdf8',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '700',
    border: '2px solid #38bdf8',
    padding: '5px',
    fontSize: '20px',
  },
  {
    content: 'Made with love',
    color: '#fbbf24',
    fontFamily: 'Pacifico, cursive',
    fontSize: '22px',
  },
  {
    content: 'LIMITED EDITION',
    color: '#f87171',
    fontFamily: 'Abril Fatface, cursive',
    fontSize: '24px',
  },
  {
    content: 'FESTIVAL',
    color: '#e879f9',
    fontFamily: 'Lobster, cursive',
    fontSize: '28px',
  },
  {
    content: 'Fresh Arrival',
    color: '#fbbf24',
    fontFamily: 'Sacramento, cursive',
    fontSize: '28px',
  },
  {
    content: 'Handmade Goods',
    color: '#86efac',
    fontFamily: 'Playfair Display, serif',
    fontWeight: 'bold',
    fontSize: '22px',
  },
] as const
