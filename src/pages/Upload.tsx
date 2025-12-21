import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn, formatBytes } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import { extractTextFromFile, processDocumentWithAI } from '../services/ai';
import { DocumentType } from '../types';

export const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null); // Clear previous errors on new drop
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1
  });

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((f) => f.name !== name));
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(10);
    setError(null);

    let docId = '';

    try {
        const file = files[0];
        
        // 1. Create Document Record
        const doc = await db.createDocument({
            title: file.name,
            type: 'general', // Default, will update after AI
            size: file.size,
            uploaderId: 'current-user',
            organizationId: 'current-org'
        });
        docId = doc.id;
        
        setProgress(30);

        // 2. Extract Text (Client-side)
        const text = await extractTextFromFile(file);
        setProgress(60);

        // 3. Process with AI
        // Heuristic to guess type for better prompting
        const guessedType: DocumentType = 
            file.name.toLowerCase().includes('invoice') ? 'invoice' :
            file.name.toLowerCase().includes('resume') ? 'resume' : 'general';

        const aiResult = await processDocumentWithAI(text, guessedType);
        setProgress(90);

        // 4. Save Results (Include rawContent for Editor re-morphing)
        await db.saveExtractionResult(doc.id, { ...aiResult, rawContent: text });
        setProgress(100);

        // Redirect directly to Editor
        setTimeout(() => {
            navigate(`/dashboard/editor/${doc.id}`);
        }, 500);

    } catch (err: any) {
        console.error("Upload failed", err);
        setError(err.message || "Failed to process document. Please try again.");
        setUploading(false);
        
        // Optional: Mark document as failed in DB if it was created
        if (docId) {
            // We could implement a updateStatus method in db service
        }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Documents</h1>
        <p className="text-slate-500">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50',
              files.length > 0 && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">
                  {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  AI will automatically detect document type and extract data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
        </div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded text-slate-600">
                      <File className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                        onClick={() => removeFile(file.name)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Processing...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleUpload} 
                isLoading={uploading} 
                className="w-full sm:w-auto"
                disabled={uploading}
              >
                {uploading ? 'Analyzing Document...' : 'Start Processing'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
