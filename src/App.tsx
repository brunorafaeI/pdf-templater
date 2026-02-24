import React, { useState, useEffect } from 'react';
import {
  EditorElement,
  TemplateState,
  ElementType,
  Page,
} from '@/types';
import LeftSidebar from '@/components/LeftSidebar';
import PropertiesPanel from '@/components/PropertiesPanel';
import LayersPanel from '@/components/LayersPanel';
import PagesPanel from '@/components/PagesPanel';
import Canvas from '@/components/Canvas';
import {
  Download,
  Save,
  ChevronLeft,
  X,
  MoveVertical,
  MoveHorizontal,
  FileImage,
  FileType,
  Code,
  FileText,
  ChevronDown,
  FileCode,
} from 'lucide-react';
import {
  downloadHTML,
  downloadImage,
  printToPDF,
  downloadGotenbergZip,
} from '@/services/export.service';

const App: React.FC = () => {
  const [state, setState] = useState<TemplateState>({
    name: 'Demo Template',
    pages: [{ id: 'page-1', name: 'Page 1', elements: [] }],
    activePageId: 'page-1',
    selectedId: null,
    canvasSettings: {
      backgroundColor: '#ffffff',
      showHorizontalRuler: true,
      showVerticalRuler: true,
      showGuides: true,
      autoSave: true,
      header: {
        enabled: false,
        height: 60,
        htmlContent: '<h1 style="margin:0; font-size: 18px;">Page Title</h1>',
        alignment: 'center'
      },
      footer: {
        enabled: false,
        height: 40,
        type: 'pagination',
        paginationPrefix: 'Page',
        paginationFormat: 'numeric',
        alignment: 'center'
      },
      margins: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
      }
    },
    horizontalGuides: [],
    verticalGuides: []
  });

  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'layers' | 'pages'>('pages');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Helper to get active page index and object
  const activePageIndex = state.pages.findIndex(p => p.id === state.activePageId);
  const activePage = state.pages[activePageIndex] || state.pages[0];

  // Auto-switch to properties tab when an element is selected, and ensure panel is open
  useEffect(() => {
    if (state.selectedId) {
      setActiveRightTab('properties');
      setIsRightPanelOpen(true);
    }
  }, [state.selectedId]);

  const updateActivePageElements = (newElements: EditorElement[]) => {
    const newPages = [...state.pages];
    newPages[activePageIndex] = { ...activePage, elements: newElements };
    setState(prev => ({ ...prev, pages: newPages }));
  };

  const addElement = (type: ElementType, content?: string, extraStyle: any = {}) => {
    const id = Date.now().toString();
    const defaultStyles: React.CSSProperties = {
      backgroundColor: type === 'box' ? '#3b82f6' : 'transparent',
      color: '#000000',
      fontSize: '16px',
      padding: '8px',
      ...extraStyle
    };

    let width = 200;
    let height = 100;

    if (type === 'text') { width = 300; height = 100; }
    if (type === 'image') { width = 300; height = 200; }
    if (type === 'box') { width = 150; height = 150; }
    if (type === 'circle') { width = 150; height = 150; }
    if (type === 'line') { width = 200; height = 2; }

    const newElement: EditorElement = {
      id,
      name: content && type === 'text' ? content.substring(0, 15) : `${type} ${activePage.elements.length + 1}`,
      type,
      x: 50,
      y: 50,
      width,
      height,
      rotation: 0,
      content: content || (type === 'text' ? 'Double click to edit...' : ''),
      style: defaultStyles,
      isVisible: true,
      isLocked: false
    };

    updateActivePageElements([...activePage.elements, newElement]);
    setState(prev => ({ ...prev, selectedId: id }));
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const updatedElements = activePage.elements.map(el => el.id === id ? { ...el, ...updates } : el);
    updateActivePageElements(updatedElements);
  };

  const deleteElement = (id: string) => {
    const updatedElements = activePage.elements.filter(el => el.id !== id);
    updateActivePageElements(updatedElements);
    setState(prev => ({ ...prev, selectedId: null }));
  };

  const duplicateElement = (id: string) => {
    const el = activePage.elements.find(e => e.id === id);
    if (el) {
       const newId = Date.now().toString();
       const newEl = { ...el, id: newId, x: el.x + 20, y: el.y + 20, name: `${el.name} (Copy)` };
       updateActivePageElements([...activePage.elements, newEl]);
       setState(prev => ({ ...prev, selectedId: newId }));
    }
  };

  const reorderElements = (dragIndex: number, hoverIndex: number) => {
      const newElements = [...activePage.elements];
      const [removed] = newElements.splice(dragIndex, 1);
      newElements.splice(hoverIndex, 0, removed);
      updateActivePageElements(newElements);
  };

  // --- Page Operations ---

  const addPage = () => {
      const newId = `page-${Date.now()}`;
      const newPage: Page = {
          id: newId,
          name: `Page ${state.pages.length + 1}`,
          elements: []
      };
      setState(prev => ({ 
          ...prev, 
          pages: [...prev.pages, newPage], 
          activePageId: newId,
          selectedId: null
      }));
  };

  const deletePage = (id: string) => {
      if (state.pages.length <= 1) return;
      const newPages = state.pages.filter(p => p.id !== id);
      const newActiveId = id === state.activePageId ? newPages[0].id : state.activePageId;
      setState(prev => ({ 
          ...prev, 
          pages: newPages, 
          activePageId: newActiveId,
          selectedId: null 
      }));
  };

  const duplicatePage = (id: string) => {
      const pageToDup = state.pages.find(p => p.id === id);
      if (pageToDup) {
          const newId = `page-${Date.now()}`;
          const newPage: Page = {
              ...pageToDup,
              id: newId,
              name: `${pageToDup.name} (Copy)`,
              elements: pageToDup.elements.map(el => ({...el, id: `${el.id}-${Date.now()}`})) // Deep copy elements with new IDs
          };
          setState(prev => ({
              ...prev,
              pages: [...prev.pages, newPage],
              activePageId: newId,
              selectedId: null
          }));
      }
  };

  const renamePage = (id: string, newName: string) => {
      setState(prev => ({
          ...prev,
          pages: prev.pages.map(p => p.id === id ? { ...p, name: newName } : p)
      }));
  };


  const selectedElement = activePage.elements.find(el => el.id === state.selectedId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      {/* Dark Header */}
      {/* Added z-[100] to ensure header (and dropdowns) are always on top of sidebars */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-[100] relative">
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-3">
             {/* Back & Logo */}
             <div className="flex items-center gap-2 cursor-pointer group">
                {/* Reverted Logo to Blue Box 'T' */}
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/20">
                   T
                </div>
             </div>
             
             {/* Divider */}
             <div className="h-6 w-px bg-slate-800 mx-2"></div>

             {/* Template Name Input */}
             <input 
               type="text" 
               value={state.name}
               onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
               className="bg-transparent text-sm font-semibold text-white px-2 py-1 rounded hover:bg-slate-900 focus:bg-slate-900 border border-transparent focus:border-blue-500/50 outline-none transition-all w-48 placeholder-slate-500"
               placeholder="Untitled Template"
             />

             {/* Divider */}
             <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

             {/* Tools (Rulers, Save) - Moved here to match reference image layout */}
             <div className="flex items-center gap-1 hidden md:flex">
                <button onClick={() => setState(prev => ({ ...prev, canvasSettings: { ...prev.canvasSettings, showHorizontalRuler: !prev.canvasSettings.showHorizontalRuler }}))} 
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.showHorizontalRuler ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500'}`} title="Toggle Horizontal Ruler">
                    <MoveHorizontal size={16} />
                </button>
                <button onClick={() => setState(prev => ({ ...prev, canvasSettings: { ...prev.canvasSettings, showVerticalRuler: !prev.canvasSettings.showVerticalRuler }}))} 
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.showVerticalRuler ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500'}`} title="Toggle Vertical Ruler">
                    <MoveVertical size={16} />
                </button>
                
                <div className="h-6 w-px bg-slate-800 mx-2"></div>
                
                <button onClick={() => setState(prev => ({ ...prev, canvasSettings: { ...prev.canvasSettings, autoSave: !prev.canvasSettings.autoSave }}))} 
                    className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 transition-colors ${state.canvasSettings.autoSave ? 'text-emerald-400' : 'text-slate-500'}`} title="Auto-save">
                    <Save size={16} />
                    <span className="text-xs font-medium">{state.canvasSettings.autoSave ? 'Saved' : 'Save Off'}</span>
                </button>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="group relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                onBlur={() => setTimeout(() => setIsExportOpen(false), 200)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Export Dropdown - Improved Z-Index and Styling */}
              <div 
                className={`absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-lg shadow-2xl border border-gray-200 z-[110] transform transition-all duration-200 origin-top-right ${isExportOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              >
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="font-semibold text-sm text-gray-800">Download</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Select a file format</p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button onClick={() => downloadImage('canvas-root', 'jpeg')} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group">
                       <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
                         <FileImage size={18} />
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-800">JPG</div>
                         <div className="text-xs text-gray-500">Ideal for sharing and social media</div>
                       </div>
                    </button>

                    <button onClick={() => downloadImage('canvas-root', 'png')} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group">
                       <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
                         <FileType size={18} />
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-800">PNG</div>
                         <div className="text-xs text-gray-500">Best for complex images & transparency</div>
                       </div>
                    </button>

                    <button onClick={() => printToPDF(state.pages, state.canvasSettings.backgroundColor)} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors group">
                       <div className="p-2 bg-gray-100 rounded group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600">
                         <FileText size={18} />
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-800">PDF</div>
                         <div className="text-xs text-gray-500">Ideal for documents and printing</div>
                       </div>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 p-2 bg-gray-50 rounded-b-lg space-y-1">
                     <button onClick={() => downloadGotenbergZip(state)} className="w-full text-left px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-md flex items-start gap-3 transition-all group">
                       <div className="p-2 bg-orange-100 rounded text-orange-600">
                         <FileCode size={18} />
                       </div>
                       <div>
                         <div className="text-sm font-medium text-orange-700">Gotenberg Package</div>
                         <div className="text-xs text-orange-500/70">ZIP for Chromium PDF API</div>
                       </div>
                    </button>

                     <button onClick={() => downloadHTML(state.pages, state.canvasSettings.backgroundColor)} className="w-full text-left px-3 py-2.5 hover:bg-white hover:shadow-sm rounded-md flex items-start gap-3 transition-all group">
                       <div className="p-2 bg-blue-100 rounded text-blue-600">
                         <Code size={18} />
                       </div>
                       <div>
                         <div className="text-sm font-medium text-blue-700">HTML & CSS</div>
                         <div className="text-xs text-blue-500/70">Get the full source code</div>
                       </div>
                    </button>
                  </div>
              </div>
           </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar (Assets) */}
        <div className="h-full z-40 bg-slate-900 transition-all duration-300 ease-in-out shadow-r-xl">
            <LeftSidebar onAddElement={addElement} />
        </div>
        
        {/* Center Canvas */}
        <div className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out">
            <Canvas 
            pages={state.pages}
            activePageId={state.activePageId}
            selectedId={state.selectedId}
            onSelect={(id) => setState(prev => ({ ...prev, selectedId: id }))}
            onUpdate={updateElement}
            onDelete={deleteElement}
            onDuplicate={duplicateElement}
            canvasSettings={state.canvasSettings}
            horizontalGuides={state.horizontalGuides}
            verticalGuides={state.verticalGuides}
            onAddGuide={(type, pos) => {
                if (type === 'horizontal') setState(prev => ({ ...prev, horizontalGuides: [...prev.horizontalGuides, pos] }));
                else setState(prev => ({ ...prev, verticalGuides: [...prev.verticalGuides, pos] }));
            }}
            onRemoveGuide={(type, index) => {
                if (type === 'horizontal') setState(prev => ({ ...prev, horizontalGuides: prev.horizontalGuides.filter((_, i) => i !== index) }));
                else setState(prev => ({ ...prev, verticalGuides: prev.verticalGuides.filter((_, i) => i !== index) }));
            }}
            />
        </div>

        {/* Floating Right Sidebar (Properties & Layers & Pages) */}
        <div 
            className={`absolute right-4 top-12 bottom-4 w-80 h-[80vh] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col text-slate-800 z-50 transition-transform duration-300 ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}
        >
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 rounded-t-xl px-2">
                <button 
                    onClick={() => setActiveRightTab('properties')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRightTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Properties
                </button>
                <button 
                    onClick={() => setActiveRightTab('layers')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRightTab === 'layers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Layers
                </button>
                <button 
                    onClick={() => setActiveRightTab('pages')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRightTab === 'pages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pages
                </button>
                <button onClick={() => setIsRightPanelOpen(false)} className="px-2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-white rounded-b-xl">
                {activeRightTab === 'properties' && (
                    <PropertiesPanel 
                        element={selectedElement}
                        onChange={updateElement}
                        onDelete={deleteElement}
                        canvasSettings={state.canvasSettings}
                        onCanvasSettingChange={(settings) => setState(prev => ({ ...prev, canvasSettings: { ...prev.canvasSettings, ...settings }}))}
                        activePage={activePage}
                        onPageUpdate={(id, updates) => {
                            setState(prev => ({
                                ...prev,
                                pages: prev.pages.map(p => p.id === id ? { ...p, ...updates } : p)
                            }));
                        }}
                    />
                )}
                {activeRightTab === 'layers' && (
                    <LayersPanel 
                        elements={activePage.elements}
                        selectedId={state.selectedId}
                        onSelect={(id) => setState(prev => ({ ...prev, selectedId: id }))}
                        onUpdate={updateElement}
                        onDelete={deleteElement}
                        onDuplicate={duplicateElement}
                        onReorder={reorderElements}
                    />
                )}
                {activeRightTab === 'pages' && (
                    <PagesPanel 
                        pages={state.pages}
                        activePageId={state.activePageId}
                        onSelectPage={(id) => setState(prev => ({ ...prev, activePageId: id, selectedId: null }))}
                        onAddPage={addPage}
                        onDeletePage={deletePage}
                        onDuplicatePage={duplicatePage}
                        onRenamePage={renamePage}
                    />
                )}
            </div>
        </div>

        {/* Floating Toggle Button (Visible when panel is closed) */}
        {!isRightPanelOpen && (
             <button 
                onClick={() => setIsRightPanelOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-l-lg shadow-lg border border-r-0 border-gray-200 text-blue-600 hover:text-blue-700 hover:pl-4 transition-all z-40"
             >
                <ChevronLeft size={20} />
             </button>
        )}

      </div>
    </div>
  );
};

export default App;