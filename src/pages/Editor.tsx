import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Wand2, UploadCloud, FileText, ChevronLeft, Settings2, Eye, ZoomIn, ZoomOut, Maximize, ChevronDown, FileType, Printer, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DEFAULT_TEMPLATES } from '../lib/mockData';
import { Document, Template, DocumentSection } from '../types';
import { extractTextFromFile } from '../services/ai';
import { generateDocx, generateMd, generateTxt } from '../services/docGen';
import { db } from '../services/db';
import { cn } from '../lib/utils';
import OpenAI from 'openai';
import { Badge } from '../components/ui/Badge';

// --- Components for the Editor ---

const ZoomControls = ({ scale, setScale }: { scale: number, setScale: (s: number) => void }) => {
  return (
    <div className="absolute bottom-6 right-6 flex items-center bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1.5 z-20 select-none">
      <button 
        onClick={() => setScale(Math.max(0.3, scale - 0.05))}
        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      
      <span className="text-sm font-medium w-14 text-center text-slate-700 dark:text-slate-200 tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      
      <button 
        onClick={() => setScale(Math.min(1.5, scale + 0.05))}
        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      
      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />
      
      <button 
        onClick={() => setScale(0.55)}
        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
        title="Fit to Screen"
      >
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  );
};

const PreviewPage = ({ doc, template, scale }: { doc: Document; template: Template; scale: number }) => {
  const getTextAlign = (align: string) => {
    if (align === 'justify') return 'justify';
    return align;
  };

  // Calculate dimensions based on template page size
  const width = template.layout.pageSize === 'A4' ? '210mm' : '216mm'; // Letter is 8.5in (~216mm)
  const minHeight = template.layout.pageSize === 'A4' ? '297mm' : '279mm'; // Letter is 11in (~279mm)

  return (
    <div className="relative w-full h-full bg-slate-100/50 dark:bg-slate-950 overflow-hidden flex flex-col">
       {/* Scrollable Container */}
       <div className="flex-1 overflow-auto p-8 md:p-12 flex justify-center items-start custom-scrollbar">
          <div 
            id="preview-content"
            className="bg-white shadow-2xl transition-all duration-200 ease-out border border-slate-200 shrink-0 origin-top print:shadow-none print:border-none print:m-0 print:transform-none"
            style={{
              width: width,
              minHeight: minHeight,
              paddingTop: `${template.layout.marginTop}in`,
              paddingBottom: `${template.layout.marginBottom}in`,
              paddingLeft: `${template.layout.marginLeft}in`,
              paddingRight: `${template.layout.marginRight}in`,
              transform: `scale(${scale})`,
              marginBottom: '100px' // Extra space for scrolling
            }}
          >
            {/* Header */}
            <div className="mb-8 text-right select-none pointer-events-none opacity-50" style={{ 
                fontFamily: template.styles.header.family, 
                fontSize: `${template.styles.header.size}pt`,
                color: template.styles.header.color 
            }}>
                {template.elements.logoPosition === 'header-right' && <span className="font-bold">[LOGO] </span>}
                {doc.title} - Draft
            </div>

            {/* Content Columns */}
            <div style={{ 
                columnCount: template.layout.columns, 
                columnGap: '0.5in',
                height: '100%'
            }}>
                {doc.sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300 select-none border-2 border-dashed border-slate-100 rounded-lg">
                        <FileText className="h-12 w-12 mb-2 opacity-20" />
                        <p className="text-sm">Start typing or upload a document</p>
                    </div>
                ) : (
                    doc.sections.map((section, idx) => {
                        let style = template.styles.body;
                        let Tag: any = 'p';

                        if (section.type === 'h1') { style = template.styles.h1; Tag = 'h1'; }
                        else if (section.type === 'h2') { style = template.styles.h2; Tag = 'h2'; }
                        else if (section.type === 'h3') { style = template.styles.h3; Tag = 'h3'; }

                        return (
                            <Tag 
                                key={idx}
                                style={{
                                    fontFamily: style.family,
                                    fontSize: `${style.size}pt`,
                                    fontWeight: style.bold ? 'bold' : 'normal',
                                    fontStyle: style.italic ? 'italic' : 'normal',
                                    color: style.color,
                                    textAlign: getTextAlign(style.alignment),
                                    marginBottom: '1em',
                                    lineHeight: style.spacing || 1.4,
                                    textTransform: style.uppercase ? 'uppercase' : 'none',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    maxWidth: '100%'
                                }}
                            >
                                {section.content}
                            </Tag>
                        );
                    })
                )}
            </div>
            
            {/* Footer */}
            {template.elements.showPageNumbers && (
                <div className="mt-8 text-center border-t border-slate-100 pt-4 absolute bottom-10 left-0 right-0 mx-10 select-none pointer-events-none opacity-50" style={{ 
                    fontFamily: template.styles.footer.family, 
                    fontSize: `${template.styles.footer.size}pt`,
                    color: template.styles.footer.color 
                }}>
                    Page 1
                </div>
            )}
          </div>
       </div>
    </div>
  );
};

export const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [doc, setDoc] = useState<Document | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template>(DEFAULT_TEMPLATES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rawText, setRawText] = useState('');
  const [scale, setScale] = useState(0.55); // Default zoom level set to 55%
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  
  // Load initial data
  useEffect(() => {
    const loadDocument = async () => {
        if (id) {
            setIsLoading(true);
            try {
                const found = await db.getDocumentById(id);
                if (found) {
                    setDoc(found);
                    // Load raw content if available for re-morphing
                    if (found.rawContent) setRawText(found.rawContent);
                    
                    const tpl = DEFAULT_TEMPLATES.find(t => t.id === found.templateId);
                    if (tpl) setActiveTemplate(tpl);
                    setActiveTab('preview');
                } else {
                    // Handle not found
                    navigate('/dashboard/documents');
                }
            } catch (error) {
                console.error("Failed to load document", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // New Document State
            setDoc({
                id: 'new',
                title: 'Untitled Document',
                originalFileName: '',
                updatedAt: new Date().toISOString(),
                status: 'draft',
                templateId: DEFAULT_TEMPLATES[0].id,
                sections: []
            });
        }
    };
    loadDocument();
  }, [id, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
        const text = await extractTextFromFile(file);
        setRawText(text);
        
        // Simulate AI Structuring (In real app, call OpenAI here)
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const sections: DocumentSection[] = [];
        
        lines.forEach((line, i) => {
            if (i === 0) sections.push({ id: `s-${i}`, type: 'h1', content: line });
            else if (line.length < 50 && !line.endsWith('.')) sections.push({ id: `s-${i}`, type: 'h2', content: line });
            else sections.push({ id: `s-${i}`, type: 'paragraph', content: line });
        });

        setDoc(prev => prev ? { 
            ...prev, 
            title: file.name.split('.')[0], 
            originalFileName: file.name,
            sections 
        } : null);
        
        // Switch to preview after upload on mobile
        setActiveTab('preview');

    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  const runAiStructure = async () => {
    if (!rawText) return;
    setIsProcessing(true);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        // Mock delay if no key
        setTimeout(() => setIsProcessing(false), 1500);
        return;
    }

    try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a document structure analyzer. Return a JSON object with a 'sections' array. Each section has 'type' (h1, h2, h3, paragraph) and 'content'." },
                { role: "user", content: `Analyze this text:\n\n${rawText.substring(0, 4000)}` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });
        
        const result = JSON.parse(completion.choices[0].message.content || '{}');
        if (result.sections) {
            setDoc(prev => prev ? { ...prev, sections: result.sections.map((s: any, i: number) => ({ ...s, id: `ai-${i}` })) } : null);
        }
        setActiveTab('preview');
    } catch (e) {
        console.error("AI Error", e);
    } finally {
        setIsProcessing(false);
    }
  };

  const saveToDatabase = async () => {
    if (!doc) return;
    setIsSaving(true);
    
    try {
        // Calculate Word Count
        const wordCount = doc.sections.reduce((acc, section) => {
            return acc + (section.content ? section.content.split(/\s+/).length : 0);
        }, 0);

        // If it's a new document (id === 'new')
        if (doc.id === 'new') {
            const newDoc = await db.createDocument({
                title: doc.title,
                type: 'general', // Could infer from content
                size: doc.rawContent?.length || 0,
                wordCount: wordCount,
                uploaderId: 'current-user', // Handled in db service
                organizationId: 'current-org'
            });
            
            // Save content
            await db.saveExtractionResult(newDoc.id, {
                sections: doc.sections,
                rawContent: doc.rawContent,
                confidenceScore: 1.0, // Manual/AI
                summary: 'Generated via Editor'
            });
            
            // Update local state and URL
            setDoc(prev => prev ? { ...prev, id: newDoc.id, status: 'completed', wordCount } : null);
            navigate(`/dashboard/editor/${newDoc.id}`, { replace: true });
            return newDoc.id;
        } else {
            // Existing document - update content
            await db.saveExtractionResult(doc.id, {
                sections: doc.sections,
                rawContent: doc.rawContent,
                confidenceScore: doc.result?.confidenceScore || 1.0,
                summary: doc.result?.summary
            });
            // Update timestamp, title & word count
            await db.updateDocument(doc.id, { 
                title: doc.title,
                wordCount: wordCount,
                updatedAt: new Date().toISOString() 
            });
            return doc.id;
        }
    } catch (error) {
        console.error("Failed to save document:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleExport = async (type: 'docx' | 'txt' | 'md' | 'pdf') => {
    if (!doc) return;
    
    // Auto-save on export to update dashboard stats
    await saveToDatabase();
    
    switch (type) {
        case 'docx':
            generateDocx(doc, activeTemplate);
            break;
        case 'txt':
            generateTxt(doc);
            break;
        case 'md':
            generateMd(doc);
            break;
        case 'pdf':
            window.print();
            break;
    }
    setIsExportOpen(false);
  };

  if (isLoading || !doc) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] flex flex-col -m-4 md:-m-6">
      {/* Toolbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 z-10 transition-colors">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-sm font-medium"
            >
                <ChevronLeft className="h-4 w-4" /> Back
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
            
            <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight truncate max-w-[200px] md:max-w-md" title={doc.title}>
                    {doc.title}
                </h1>
                <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'draft' ? 'secondary' : 'success'} className="text-[10px] px-1.5 py-0 h-4">
                        {doc.status}
                    </Badge>
                    {isSaving && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={runAiStructure} disabled={!rawText || isProcessing} className="hidden md:flex">
                <Wand2 className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                {isProcessing ? 'Morphing...' : 'Re-Morph'}
            </Button>
            
            <div className="relative">
                <Button 
                    size="sm" 
                    onClick={() => setIsExportOpen(!isExportOpen)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2"
                    disabled={isSaving}
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">Export</span>
                    <ChevronDown className="h-3 w-3 opacity-80" />
                </Button>

                {isExportOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Download As
                            </div>
                            <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div>
                                    <span className="font-medium">Word Document</span>
                                    <span className="block text-xs text-slate-400">.docx</span>
                                </div>
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                                <FileType className="h-4 w-4 text-slate-500" />
                                <div>
                                    <span className="font-medium">Plain Text</span>
                                    <span className="block text-xs text-slate-400">.txt</span>
                                </div>
                            </button>
                            <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                                <FileType className="h-4 w-4 text-slate-800 dark:text-slate-200" />
                                <div>
                                    <span className="font-medium">Markdown</span>
                                    <span className="block text-xs text-slate-400">.md</span>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="flex md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button 
            onClick={() => setActiveTab('config')}
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'config' ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 dark:text-slate-400")}
        >
            <Settings2 className="h-4 w-4 inline mr-2" /> Config
        </button>
        <button 
            onClick={() => setActiveTab('preview')}
            className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'preview' ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 dark:text-slate-400")}
        >
            <Eye className="h-4 w-4 inline mr-2" /> Preview
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Configuration */}
        <div className={cn(
            "w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto absolute inset-0 md:static transition-transform duration-300 z-10 shadow-xl md:shadow-none",
            activeTab === 'config' ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            
            {/* 1. Content Source */}
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                    Source Content
                </h3>
                {doc.sections.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 transition-all relative group">
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileUpload}
                            accept=".txt,.docx,.md"
                        />
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">Upload Document</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">DOCX or TXT</p>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded text-indigo-600 dark:text-indigo-400">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={doc.originalFileName}>{doc.originalFileName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{doc.sections.length} sections</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setDoc(d => d ? {...d, sections: []} : null)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                Replace
                             </button>
                        </div>
                        <Button variant="outline" size="sm" onClick={runAiStructure} disabled={isProcessing} className="w-full mt-3 md:hidden">
                            <Wand2 className="h-3 w-3 mr-2 text-indigo-600 dark:text-indigo-400" />
                            {isProcessing ? 'Morphing...' : 'Re-Morph with AI'}
                        </Button>
                    </div>
                )}
            </div>

            {/* 2. Template Selection */}
            <div className="p-4 md:p-6 pb-20 md:pb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                    Select Template
                </h3>
                <div className="space-y-3">
                    {DEFAULT_TEMPLATES.map(t => (
                        <div 
                            key={t.id}
                            onClick={() => setActiveTemplate(t)}
                            className={cn(
                                "cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden",
                                activeTemplate.id === t.id 
                                    ? "border-indigo-600 bg-white dark:bg-slate-800 ring-1 ring-indigo-600 shadow-md" 
                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm"
                            )}
                        >
                            {activeTemplate.id === t.id && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                            )}
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{t.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Center Panel: Preview */}
        <div className={cn(
            "flex-1 bg-slate-100 dark:bg-classic-dark relative overflow-hidden w-full absolute inset-0 md:static transition-transform duration-300",
            activeTab === 'preview' ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
            <PreviewPage doc={doc} template={activeTemplate} scale={scale} />
            <ZoomControls scale={scale} setScale={setScale} />
        </div>
      </div>
    </div>
  );
};
