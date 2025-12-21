import { useState, useEffect } from 'react';
import { Plus, Layout, Type, MoreVertical, Trash2, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Template } from '../types';
import { templateService } from '../services/templateService';
import { cn } from '../lib/utils';

export const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State for New Template
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [headingFont, setHeadingFont] = useState('Helvetica');
  const [bodyFont, setBodyFont] = useState('Georgia');
  const [columns, setColumns] = useState<1 | 2>(1);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(templateService.getAll());
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName) return;

    templateService.add({
      name: newTemplateName,
      description: newTemplateDesc || 'Custom template',
      layout: {
        pageSize: 'A4',
        orientation: 'portrait',
        marginTop: 1,
        marginBottom: 1,
        marginLeft: 1,
        marginRight: 1,
        columns: columns,
      },
      styles: {
        h1: { family: headingFont, size: 24, bold: true, italic: false, color: primaryColor, alignment: 'left' },
        h2: { family: headingFont, size: 18, bold: true, italic: false, color: primaryColor, alignment: 'left' },
        h3: { family: headingFont, size: 14, bold: true, italic: false, color: '#475569', alignment: 'left' },
        body: { family: bodyFont, size: 11, bold: false, italic: false, color: '#334155', alignment: 'left', spacing: 1.5 },
        caption: { family: bodyFont, size: 9, bold: false, italic: true, color: '#64748b', alignment: 'center' },
        header: { family: headingFont, size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'right' },
        footer: { family: headingFont, size: 9, bold: false, italic: false, color: '#94a3b8', alignment: 'center' },
      },
      elements: { showPageNumbers: true, showToc: true }
    });

    setIsModalOpen(false);
    loadTemplates();
    resetForm();
  };

  const handleDelete = (id: string) => {
    templateService.delete(id);
    loadTemplates();
    setActiveMenuId(null);
  };

  const resetForm = () => {
    setNewTemplateName('');
    setNewTemplateDesc('');
    setPrimaryColor('#4f46e5');
    setHeadingFont('Helvetica');
    setBodyFont('Georgia');
    setColumns(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" onClick={() => setActiveMenuId(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Templates</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your document styles and layouts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full">
            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
                {/* Visual Representation of Template */}
                <div className="absolute inset-4 bg-white shadow-sm p-4 transform group-hover:scale-105 transition-transform duration-300 flex flex-col">
                    <div className="space-y-2 flex-1">
                        {/* Header Simulation */}
                        <div className="flex justify-end mb-2">
                             <div className="h-1 w-1/4 bg-slate-200 rounded-full" />
                        </div>
                        
                        {/* Title */}
                        <div 
                            className="h-3 w-3/4 rounded-sm mb-3" 
                            style={{ backgroundColor: template.styles.h1.color }} 
                        />
                        
                        {/* Subtitle */}
                        <div className="h-2 w-1/2 bg-slate-300 rounded-sm mb-4" />
                        
                        {/* Body Content */}
                        <div className={cn("space-y-1.5", template.layout.columns === 2 ? "columns-2 gap-2" : "")}>
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className="h-1.5 w-full bg-slate-100 rounded-sm" />
                            ))}
                        </div>
                    </div>
                    
                    {/* Footer Simulation */}
                    <div className="mt-auto pt-2 flex justify-center">
                         <div className="h-1 w-8 bg-slate-200 rounded-full" />
                    </div>
                </div>

                {/* System Badge */}
                {template.isSystem && (
                    <div className="absolute top-2 right-2 bg-slate-900/10 dark:bg-slate-100/10 backdrop-blur-sm text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        System
                    </div>
                )}
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start relative">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2" title={template.name}>{template.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-10">{template.description}</p>
                </div>
                
                <div className="relative shrink-0">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === template.id ? null : template.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenuId === template.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                             <button className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Copy className="h-3 w-3" /> Duplicate
                             </button>
                             {!template.isSystem && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(template.id);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <Trash2 className="h-3 w-3" /> Delete
                                </button>
                             )}
                        </div>
                    )}
                </div>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                    <Layout className="h-3 w-3 mr-1.5 text-slate-400" />
                    {template.layout.columns === 1 ? 'Single Col' : 'Two Cols'}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 truncate max-w-[120px]">
                    <Type className="h-3 w-3 mr-1.5 text-slate-400" />
                    {template.styles.h1.family}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Template"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate} disabled={!newTemplateName}>Create Template</Button>
          </>
        }
      >
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Template Name</label>
                <Input 
                    placeholder="e.g., My Custom Report" 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <Input 
                    placeholder="Brief description of usage..." 
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Heading Font</label>
                    <select 
                        className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={headingFont}
                        onChange={(e) => setHeadingFont(e.target.value)}
                    >
                        <option value="Helvetica">Helvetica (Sans)</option>
                        <option value="Arial">Arial (Sans)</option>
                        <option value="Times New Roman">Times New Roman (Serif)</option>
                        <option value="Georgia">Georgia (Serif)</option>
                        <option value="Courier New">Courier New (Mono)</option>
                        <option value="Verdana">Verdana (Sans)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Body Font</label>
                    <select 
                        className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={bodyFont}
                        onChange={(e) => setBodyFont(e.target.value)}
                    >
                        <option value="Georgia">Georgia (Serif)</option>
                        <option value="Times New Roman">Times New Roman (Serif)</option>
                        <option value="Helvetica">Helvetica (Sans)</option>
                        <option value="Arial">Arial (Sans)</option>
                        <option value="Verdana">Verdana (Sans)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Color</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-10 w-10 p-1 rounded border border-slate-300 dark:border-slate-700 cursor-pointer bg-white dark:bg-slate-900"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400 uppercase">{primaryColor}</span>
                    </div>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Layout</label>
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => setColumns(1)}
                            className={cn(
                                "flex-1 py-2 border rounded-md text-sm font-medium transition-all",
                                columns === 1 
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            Single Col
                        </button>
                        <button 
                            type="button"
                            onClick={() => setColumns(2)}
                            className={cn(
                                "flex-1 py-2 border rounded-md text-sm font-medium transition-all",
                                columns === 2 
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            Two Cols
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};
