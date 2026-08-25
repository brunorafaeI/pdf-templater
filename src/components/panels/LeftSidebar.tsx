import React, { useState } from 'react'
import { LucideIconComponent } from '@/components/icon'
import {
  SHAPES_LIB,
  TEXT_STYLES,
  FUN_TEXTS,
  UNSPLASH_IMAGES,
  type ShapeDefinition,
} from '@/constants/library'
import { ElementType } from '@/types'
import IconsLibrary from './IconsLibrary'

interface LeftSidebarProps {
  onAddElement: (
    type: ElementType,
    content?: string,
    extraStyle?: React.CSSProperties,
    size?: { width: number; height: number }
  ) => void
}

type SidebarTab = 'text' | 'images' | 'shapes' | 'icons'

const ShapePreview: React.FC<{ shape: ShapeDefinition }> = ({ shape }) => {
  if (shape.lucideIcon) {
    return (
      <LucideIconComponent
        icon={shape.lucideIcon}
        className={
          shape.isOutlined
            ? 'text-gray-300 stroke-current stroke-2 fill-none w-8 h-8'
            : 'text-gray-300 fill-current w-8 h-8'
        }
      />
    )
  }

  switch (shape.preview) {
    case 'box':
      return <div className="w-8 h-8 bg-gray-300 rounded-sm" />
    case 'circle':
      return <div className="w-8 h-8 bg-gray-300 rounded-full" />
    case 'box-outline':
      return <div className="w-8 h-8 border-2 border-gray-300 rounded-sm" />
    case 'circle-outline':
      return <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
    case 'line':
      return <div className="w-8 h-0.5 bg-gray-300" />
    default:
      return null
  }
}

const TAB_LABELS: Record<SidebarTab, string> = {
  text: 'Text',
  images: 'Images',
  shapes: 'Shapes',
  icons: 'Icons',
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAddElement }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab | null>(null)

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab((current) => (current === tab ? null : tab))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onAddElement('image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex h-full transition-all duration-300 ease-in-out">
      <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-6 text-slate-400 border-r border-slate-800 z-30 flex-shrink-0">
        <button
          onClick={() => toggleTab('text')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'text' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <LucideIconComponent icon="Type" size={20} />
          <span className="text-[10px] font-medium">Text</span>
        </button>
        <button
          onClick={() => toggleTab('images')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'images' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <LucideIconComponent icon="Image" size={20} />
          <span className="text-[10px] font-medium">Images</span>
        </button>
        <button
          onClick={() => toggleTab('shapes')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'shapes' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <LucideIconComponent icon="Shapes" size={20} />
          <span className="text-[10px] font-medium">Shapes</span>
        </button>
        <button
          onClick={() => toggleTab('icons')}
          className={`flex flex-col items-center gap-1 p-2 rounded w-full transition-colors ${activeTab === 'icons' ? 'text-white bg-slate-800 border-l-4 border-blue-500' : 'hover:text-white hover:bg-slate-800/50'}`}
        >
          <LucideIconComponent icon="Sparkles" size={20} />
          <span className="text-[10px] font-medium">Icons</span>
        </button>
      </div>

      {activeTab && (
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-20 animate-in slide-in-from-left-5 duration-200">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-semibold">{TAB_LABELS[activeTab]}</h3>
            <button
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-white"
            >
              <LucideIconComponent icon="ChevronLeft" size={20} />
            </button>
          </div>

          <div
            className={`p-4 flex flex-col gap-4 flex-1 min-h-0 ${
              activeTab === 'icons' ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          >
            {activeTab === 'text' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  {TEXT_STYLES.map((style, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        onAddElement('text', style.content, {
                          fontSize: style.fontSize,
                          fontWeight: style.fontWeight,
                        })
                      }
                      className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded text-gray-200 transition-colors"
                      style={{
                        fontSize:
                          style.fontSize === '32px'
                            ? '20px'
                            : style.fontSize === '24px'
                              ? '16px'
                              : '14px',
                        fontWeight:
                          style.fontWeight as React.CSSProperties['fontWeight'],
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <h4 className="text-gray-400 text-sm font-medium pt-2">
                  Combinations
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {FUN_TEXTS.map((style, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        onAddElement('text', style.content, { ...style })
                      }
                      className="h-20 bg-slate-900/50 hover:bg-slate-900 rounded flex items-center justify-center p-2 text-center break-words transition-colors border border-slate-700 hover:border-slate-600"
                      style={{
                        color: style.color,
                        fontFamily: style.fontFamily,
                        fontStyle:
                          'fontStyle' in style
                            ? (style.fontStyle as React.CSSProperties['fontStyle'])
                            : undefined,
                        fontWeight:
                          'fontWeight' in style
                            ? (style.fontWeight as React.CSSProperties['fontWeight'])
                            : undefined,
                        border: 'border' in style ? style.border : undefined,
                      }}
                    >
                      {style.content}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition-colors text-center cursor-pointer relative bg-slate-750">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="text-blue-400 mb-2 flex justify-center">
                    <LucideIconComponent icon="Upload" size={24} />
                  </div>
                  <span className="text-xs text-gray-400 block">
                    Upload media
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 bg-slate-700 p-2 rounded mb-3">
                    <LucideIconComponent
                      icon="Search"
                      size={14}
                      className="text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search Unsplash"
                      className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {UNSPLASH_IMAGES.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => onAddElement('image', url)}
                        className="rounded overflow-hidden hover:opacity-80 transition-opacity h-24"
                      >
                        <img
                          src={url}
                          alt="Stock"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shapes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {SHAPES_LIB.map((shape, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        onAddElement(
                          shape.type,
                          shape.path,
                          {
                            backgroundColor: shape.isOutlined
                              ? 'transparent'
                              : '#d1d5db',
                            borderColor: shape.isOutlined
                              ? '#9ca3af'
                              : 'transparent',
                            borderWidth: shape.isOutlined ? '4px' : '0px',
                            borderRadius: shape.type === 'circle' ? '50%' : '0',
                          },
                          shape.defaultSize
                        )
                      }
                      className="aspect-square bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors group relative"
                      title={shape.label}
                    >
                      <div className="group-hover:scale-110 transition-transform">
                        <ShapePreview shape={shape} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'icons' && (
              <IconsLibrary
                onPick={(iconName) =>
                  onAddElement(
                    'icon',
                    iconName,
                    { color: '#334155' },
                    { width: 64, height: 64 }
                  )
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeftSidebar
