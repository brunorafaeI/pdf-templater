import { useState, useEffect, useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { EditorElement, ElementType, Page, TemplateState } from '@/types'
import { createInitialTemplateState } from '@/constants/template'
import {
  getDefaultElementSize,
  getDefaultElementStyles,
} from '@/utils/elementDefaults'
import { measureTextBox, getTextPaddingForFontSize } from '@/utils/measureText'

export type RightTab = 'properties' | 'layers' | 'pages'

export function useTemplateEditor() {
  const [state, setState] = useState<TemplateState>(createInitialTemplateState)
  const [activeRightTab, setActiveRightTab] = useState<RightTab>('pages')
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)

  const activePageIndex = state.pages.findIndex((p) => p.id === state.activePageId)
  const activePage = state.pages[activePageIndex] || state.pages[0]
  const selectedElement =
    activePage.elements.find((el) => el.id === state.selectedId) || null

  useEffect(() => {
    if (state.selectedId) {
      setActiveRightTab('properties')
      setIsRightPanelOpen(true)
    }
  }, [state.selectedId])

  const updateActivePageElements = useCallback(
    (newElements: EditorElement[]) => {
      setState((prev) => {
        const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
        if (idx < 0) return prev
        const newPages = [...prev.pages]
        newPages[idx] = { ...newPages[idx], elements: newElements }
        return { ...prev, pages: newPages }
      })
    },
    []
  )

  const addElement = useCallback(
    (
      type: ElementType,
      content?: string,
      extraStyle: CSSProperties = {},
      size?: { width: number; height: number }
    ) => {
      const id = Date.now().toString()
      // Strip non-CSS keys that FUN_TEXTS may spread (e.g. content)
      const { content: _c, ...styleOnly } = extraStyle as CSSProperties & {
        content?: string
      }
      let resolvedStyles = getDefaultElementStyles(type, styleOnly)
      if (type === 'text') {
        resolvedStyles = {
          ...resolvedStyles,
          padding: getTextPaddingForFontSize(resolvedStyles.fontSize),
          lineHeight: resolvedStyles.lineHeight ?? 1.3,
        }
      }

      let { width, height } = getDefaultElementSize(type, size)
      if (type === 'text' && !size) {
        const measured = measureTextBox(
          content || 'Double click to edit...',
          resolvedStyles
        )
        width = measured.width
        height = measured.height
      }

      setState((prev) => {
        const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
        const page = prev.pages[idx] || prev.pages[0]
        const newElement: EditorElement = {
          id,
          name:
            type === 'icon' && content
              ? content
              : content && type === 'text'
                ? content.substring(0, 15)
                : `${type} ${page.elements.length + 1}`,
          type,
          x: 50,
          y: 50,
          width,
          height,
          rotation: 0,
          content: content || (type === 'text' ? 'Double click to edit...' : ''),
          style: resolvedStyles,
          isVisible: true,
          isLocked: false,
        }
        const newPages = [...prev.pages]
        newPages[idx] = {
          ...page,
          elements: [...page.elements, newElement],
        }
        return { ...prev, pages: newPages, selectedId: id }
      })
    },
    []
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<EditorElement>) => {
      setState((prev) => {
        const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
        if (idx < 0) return prev
        const page = prev.pages[idx]
        const updatedElements = page.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        )
        const newPages = [...prev.pages]
        newPages[idx] = { ...page, elements: updatedElements }
        return { ...prev, pages: newPages }
      })
    },
    []
  )

  const deleteElement = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
      if (idx < 0) return prev
      const page = prev.pages[idx]
      const newPages = [...prev.pages]
      newPages[idx] = {
        ...page,
        elements: page.elements.filter((el) => el.id !== id),
      }
      return { ...prev, pages: newPages, selectedId: null }
    })
  }, [])

  const duplicateElement = useCallback((id: string) => {
    setState((prev) => {
      const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
      if (idx < 0) return prev
      const page = prev.pages[idx]
      const el = page.elements.find((e) => e.id === id)
      if (!el) return prev
      const newId = Date.now().toString()
      const newEl = {
        ...el,
        id: newId,
        x: el.x + 20,
        y: el.y + 20,
        name: `${el.name} (Copy)`,
      }
      const newPages = [...prev.pages]
      newPages[idx] = { ...page, elements: [...page.elements, newEl] }
      return { ...prev, pages: newPages, selectedId: newId }
    })
  }, [])

  const reorderElements = useCallback((dragIndex: number, hoverIndex: number) => {
    setState((prev) => {
      const idx = prev.pages.findIndex((p) => p.id === prev.activePageId)
      if (idx < 0) return prev
      const page = prev.pages[idx]
      const newElements = [...page.elements]
      const [removed] = newElements.splice(dragIndex, 1)
      newElements.splice(hoverIndex, 0, removed)
      const newPages = [...prev.pages]
      newPages[idx] = { ...page, elements: newElements }
      return { ...prev, pages: newPages }
    })
  }, [])

  const addPage = useCallback(() => {
    const newId = `page-${Date.now()}`
    setState((prev) => {
      const newPage: Page = {
        id: newId,
        name: `Page ${prev.pages.length + 1}`,
        elements: [],
      }
      return {
        ...prev,
        pages: [...prev.pages, newPage],
        activePageId: newId,
        selectedId: null,
      }
    })
  }, [])

  const deletePage = useCallback((id: string) => {
    setState((prev) => {
      if (prev.pages.length <= 1) return prev
      const newPages = prev.pages.filter((p) => p.id !== id)
      const newActiveId =
        id === prev.activePageId ? newPages[0].id : prev.activePageId
      return {
        ...prev,
        pages: newPages,
        activePageId: newActiveId,
        selectedId: null,
      }
    })
  }, [])

  const duplicatePage = useCallback((id: string) => {
    setState((prev) => {
      const pageToDup = prev.pages.find((p) => p.id === id)
      if (!pageToDup) return prev
      const newId = `page-${Date.now()}`
      const newPage: Page = {
        ...pageToDup,
        id: newId,
        name: `${pageToDup.name} (Copy)`,
        elements: pageToDup.elements.map((el) => ({
          ...el,
          id: `${el.id}-${Date.now()}`,
        })),
      }
      return {
        ...prev,
        pages: [...prev.pages, newPage],
        activePageId: newId,
        selectedId: null,
      }
    })
  }, [])

  const renamePage = useCallback((id: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === id ? { ...p, name: newName } : p)),
    }))
  }, [])

  return {
    state,
    setState,
    activePage,
    selectedElement,
    activeRightTab,
    setActiveRightTab,
    isRightPanelOpen,
    setIsRightPanelOpen,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    reorderElements,
    addPage,
    deletePage,
    duplicatePage,
    renamePage,
    updateActivePageElements,
  }
}
