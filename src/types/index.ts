import type React from 'react';

export type ElementType =
  | 'text'
  | 'image'
  | 'box'
  | 'circle'
  | 'line'
  | 'svg';

export interface EditorElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content?: string;
  style: React.CSSProperties;
  isVisible: boolean;
  isLocked: boolean;
}

export interface HeaderSettings {
  enabled: boolean;
  height: number;
  htmlContent?: string;
  alignment: 'left' | 'center' | 'right';
}

export interface FooterSettings {
  enabled: boolean;
  height: number;
  type: 'html' | 'pagination';
  htmlContent?: string;
  paginationPrefix?: string;
  paginationFormat: 'numeric' | 'roman' | 'fraction';
  alignment: 'left' | 'center' | 'right';
}

export interface Page {
  id: string;
  name: string;
  elements: EditorElement[];
  headerOverride?: HeaderSettings;
  footerOverride?: FooterSettings;
}

export interface CanvasSettings {
  backgroundColor: string;
  showHorizontalRuler: boolean;
  showVerticalRuler: boolean;
  showGuides: boolean;
  autoSave: boolean;
  header: HeaderSettings;
  footer: FooterSettings;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface TemplateState {
  name: string;
  pages: Page[];
  activePageId: string;
  selectedId: string | null;
  canvasSettings: CanvasSettings;
  horizontalGuides: number[];
  verticalGuides: number[];
}

export { A4_WIDTH, A4_HEIGHT } from '@/constants/template'
