import React, { useState } from 'react';
import {
  EditorElement,
  CanvasSettings,
  Page,
  FooterSettings,
  HeaderSettings,
} from '@/types';
import {
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  RotateCw,
  Hash,
  Layout,
} from 'lucide-react';

interface PropertiesPanelProps {
  element: EditorElement | null;
  onChange: (id: string, updates: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
  canvasSettings: CanvasSettings;
  onCanvasSettingChange: (settings: Partial<CanvasSettings>) => void;
  activePage: Page;
  onPageUpdate: (id: string, updates: Partial<Page>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  element, 
  onChange, 
  onDelete,
  canvasSettings,
  onCanvasSettingChange,
  activePage,
  onPageUpdate
}) => {
  const [headerScope, setHeaderScope] = useState<'all' | 'current'>('all');
  const [footerScope, setFooterScope] = useState<'all' | 'current'>('all');

  const handleStyleChange = (key: keyof React.CSSProperties, value: unknown) => {
    if (!element) return;
    onChange(element.id, {
      style: { ...element.style, [key]: value },
    });
  };

  const handleHeaderChange = (updates: Partial<HeaderSettings>) => {
    if (headerScope === 'all') {
      onCanvasSettingChange({
        header: { ...canvasSettings.header, ...updates }
      });
    } else {
      onPageUpdate(activePage.id, {
        headerOverride: { ...(activePage.headerOverride || canvasSettings.header), ...updates }
      });
    }
  };

  const handleFooterChange = (updates: Partial<FooterSettings>) => {
    if (footerScope === 'all') {
      onCanvasSettingChange({
        footer: { ...canvasSettings.footer, ...updates }
      });
    } else {
      onPageUpdate(activePage.id, {
        footerOverride: { ...(activePage.footerOverride || canvasSettings.footer), ...updates }
      });
    }
  };

  if (!element) {
    const header = headerScope === 'all' ? canvasSettings.header : (activePage.headerOverride || canvasSettings.header);
    const footer = footerScope === 'all' ? canvasSettings.footer : (activePage.footerOverride || canvasSettings.footer);

    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Canvas Settings</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Background Color */}
          <section>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Background</label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <input 
                type="color" 
                value={canvasSettings.backgroundColor}
                onChange={(e) => onCanvasSettingChange({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-2 border-white shadow-sm"
              />
              <div>
                <div className="text-xs font-medium text-gray-700 uppercase">{canvasSettings.backgroundColor}</div>
                <div className="text-[10px] text-gray-400">Canvas Background</div>
              </div>
            </div>
          </section>

          {/* Margin Settings */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Margins (px)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Top</label>
                <input 
                  type="number" 
                  value={canvasSettings.margins.top}
                  onChange={(e) => onCanvasSettingChange({ margins: { ...canvasSettings.margins, top: parseInt(e.target.value) || 0 } })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Bottom</label>
                <input 
                  type="number" 
                  value={canvasSettings.margins.bottom}
                  onChange={(e) => onCanvasSettingChange({ margins: { ...canvasSettings.margins, bottom: parseInt(e.target.value) || 0 } })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Left</label>
                <input 
                  type="number" 
                  value={canvasSettings.margins.left}
                  onChange={(e) => onCanvasSettingChange({ margins: { ...canvasSettings.margins, left: parseInt(e.target.value) || 0 } })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Right</label>
                <input 
                  type="number" 
                  value={canvasSettings.margins.right}
                  onChange={(e) => onCanvasSettingChange({ margins: { ...canvasSettings.margins, right: parseInt(e.target.value) || 0 } })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Header Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Header</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={header.enabled}
                  onChange={(e) => handleHeaderChange({ enabled: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {header.enabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Scope Selection */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setHeaderScope('all')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${headerScope === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All Pages
                  </button>
                  <button 
                    onClick={() => setHeaderScope('current')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${headerScope === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Current Page
                  </button>
                </div>

                {/* Height */}
                <div>
                  <div className="flex justify-between mb-1 items-center">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Height</label>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 rounded">{header.height}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" max="200" 
                    value={header.height}
                    onChange={(e) => handleHeaderChange({ height: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* HTML Content */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">HTML Content</label>
                  <textarea 
                    value={header.htmlContent || ''}
                    onChange={(e) => handleHeaderChange({ htmlContent: e.target.value })}
                    className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="<div style='color: red;'>Header</div>"
                  />
                </div>

                {/* Alignment */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">Alignment</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleHeaderChange({ alignment: 'left' })}
                      className={`flex-1 p-2 border rounded-lg transition-all ${header.alignment === 'left' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                      <AlignLeft size={16} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleHeaderChange({ alignment: 'center' })}
                      className={`flex-1 p-2 border rounded-lg transition-all ${header.alignment === 'center' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                      <AlignCenter size={16} className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleHeaderChange({ alignment: 'right' })}
                      className={`flex-1 p-2 border rounded-lg transition-all ${header.alignment === 'right' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    >
                      <AlignRight size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Footer Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Footer</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={footer.enabled}
                  onChange={(e) => handleFooterChange({ enabled: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {footer.enabled && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Scope Selection */}
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button 
                    onClick={() => setFooterScope('all')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${footerScope === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All Pages
                  </button>
                  <button 
                    onClick={() => setFooterScope('current')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${footerScope === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    This Page
                  </button>
                </div>

                {/* Footer Height */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase">Footer Height</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="20" max="100" 
                      value={footer.height}
                      onChange={(e) => handleFooterChange({ height: parseInt(e.target.value) })}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs font-mono text-gray-600 w-8 text-right">{footer.height}</span>
                  </div>
                </div>

                {/* Footer Type */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleFooterChange({ type: 'html' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded border text-[10px] font-bold transition-all ${footer.type === 'html' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Layout size={14} />
                    HTML
                  </button>
                  <button 
                    onClick={() => handleFooterChange({ type: 'pagination' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded border text-[10px] font-bold transition-all ${footer.type === 'pagination' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <Hash size={14} />
                    PAGING
                  </button>
                </div>

                {footer.type === 'html' ? (
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase">HTML Content</label>
                    <textarea 
                      value={footer.htmlContent || ''}
                      onChange={(e) => handleFooterChange({ htmlContent: e.target.value })}
                      placeholder="Enter HTML content..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase">Number Format</label>
                      <select 
                        value={footer.paginationFormat}
                        onChange={(e) => handleFooterChange({ paginationFormat: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="numeric">1, 2, 3...</option>
                        <option value="roman">I, II, III...</option>
                        <option value="fraction">1 / 10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase">Prefix Text (optional)</label>
                      <input 
                        type="text"
                        value={footer.paginationPrefix || ''}
                        onChange={(e) => handleFooterChange({ paginationPrefix: e.target.value })}
                        placeholder="e.g. Page"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Alignment */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase">Position</label>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                    <button 
                      onClick={() => handleFooterChange({ alignment: 'left' })}
                      className={`flex-1 py-1.5 flex justify-center rounded transition-all ${footer.alignment === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button 
                      onClick={() => handleFooterChange({ alignment: 'center' })}
                      className={`flex-1 py-1.5 flex justify-center rounded transition-all ${footer.alignment === 'center' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button 
                      onClick={() => handleFooterChange({ alignment: 'right' })}
                      className={`flex-1 py-1.5 flex justify-center rounded transition-all ${footer.alignment === 'right' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
           <div className="text-[10px] text-gray-400 text-center">
             Select an element on the canvas to edit its properties.
           </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic max radius based on element dimensions (Standard UI behavior like Figma)
  const currentRadius = parseInt(element.style.borderRadius?.toString() || '0');
  const maxRadius = Math.round(Math.min(element.width, element.height) / 2);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 capitalize">{element.type} Properties</h3>
        <button 
          onClick={() => onDelete(element.id)}
          className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
          title="Delete Element"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Layout */}
        <section>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layout</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input 
                type="number" 
                value={Math.round(element.x)} 
                onChange={(e) => onChange(element.id, { x: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input 
                type="number" 
                value={Math.round(element.y)} 
                onChange={(e) => onChange(element.id, { y: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input 
                type="number" 
                value={Math.round(element.width)} 
                onChange={(e) => onChange(element.id, { width: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input 
                type="number" 
                value={Math.round(element.height)} 
                onChange={(e) => onChange(element.id, { height: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="col-span-2">
               <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1"><RotateCw size={10} /> Rotation (deg)</label>
               <input 
                type="number" 
                value={Math.round(element.rotation || 0)}
                onChange={(e) => onChange(element.id, { rotation: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
               />
            </div>
          </div>
        </section>

        {/* Content specific properties */}
        {element.type === 'text' && (
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Typography</h4>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <textarea 
                rows={4}
                value={element.content} 
                onChange={(e) => onChange(element.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                <input 
                  type="number" 
                  value={parseInt(element.style.fontSize?.toString() || '16')}
                  onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              <div>
                 <label className="block text-xs text-gray-500 mb-1">Color</label>
                 <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
                  <input 
                    type="color" 
                    value={element.style.color?.toString() || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-6 h-6 border-0 p-0 text-gray-900"
                  />
                  <span className="text-xs text-gray-600 truncate">{element.style.color}</span>
                 </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => handleStyleChange('fontWeight', element.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-2 rounded border ${element.style.fontWeight === 'bold' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <Bold size={16} />
              </button>
              <button 
                onClick={() => handleStyleChange('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-2 rounded border ${element.style.fontStyle === 'italic' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <Italic size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'left')}
                className={`p-2 rounded border ${element.style.textAlign === 'left' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignLeft size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'center')}
                className={`p-2 rounded border ${element.style.textAlign === 'center' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignCenter size={16} />
              </button>
               <button 
                onClick={() => handleStyleChange('textAlign', 'right')}
                className={`p-2 rounded border ${element.style.textAlign === 'right' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600'}`}
              >
                <AlignRight size={16} />
              </button>
            </div>
          </section>
        )}

        {(element.type === 'box' || element.type === 'text' || element.type === 'image') && (
           <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appearance</h4>
            <div className="space-y-4">
              {(element.type === 'box' || element.type === 'text') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={element.style.backgroundColor?.toString() || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="w-full h-8 cursor-pointer rounded border border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
              )}
               
               {/* Dynamic Border Radius Control (Figma Style) */}
               <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-gray-500">Border Radius</label>
                    {/* Show simple value if uniform, or 'Mixed' if complex string */}
                    <span className="text-[10px] text-gray-400">
                        {element.style.borderRadius?.toString().includes(' ') ? 'Mixed' : (currentRadius + 'px')}
                    </span>
                </div>
                <div className="flex gap-2 items-center">
                    <input 
                        type="range" 
                        min="0"
                        max={maxRadius} // Dynamic max: Half of the smallest dimension
                        value={Math.min(currentRadius, maxRadius)}
                        onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                        className="flex-1 accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input 
                        type="number"
                        min="0"
                        max={maxRadius}
                        value={currentRadius}
                        onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (val > maxRadius) val = maxRadius;
                            handleStyleChange('borderRadius', `${val}px`)
                        }}
                        className="w-14 px-1 py-1 border border-gray-300 rounded text-xs text-right focus:outline-none focus:border-blue-500 font-medium text-gray-900"
                    />
                </div>
              </div>
            </div>
           </section>
        )}

        {element.type === 'image' && (
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Image Source</h4>
            <div className="mb-4">
               <label className="block text-xs text-gray-500 mb-1">URL</label>
               <input 
                 type="text" 
                 value={element.content} 
                 onChange={(e) => onChange(element.id, { content: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
               />
               <p className="text-xs text-gray-400 mt-1">Supports generic image URLs</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Opacity</label>
              <input 
                type="range" 
                min="0" max="1" step="0.1"
                value={element.style.opacity || 1}
                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                className="w-full text-gray-900"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;