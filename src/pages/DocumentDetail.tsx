import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, FileText, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../services/db';
import { Document } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      db.getDocumentById(id).then(doc => {
        setDocument(doc || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleCopy = () => {
    if (document?.result) {
      navigator.clipboard.writeText(JSON.stringify(document.result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600"/></div>;
  if (!document) return <div className="p-10 text-center">Document not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/documents">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2"/> Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {document.title}
              <Badge variant="outline" className="ml-2 uppercase text-xs">{document.type}</Badge>
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {format(new Date(document.uploadDate), 'PPP')}</span>
              <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> {document.result?.confidenceScore ? `${Math.round(document.result.confidenceScore * 100)}% Confidence` : 'No Score'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2 text-green-600"/> : <Copy className="h-4 w-4 mr-2"/>}
            {copied ? 'Copied JSON' : 'Copy JSON'}
          </Button>
          <Button>Download Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Summary & Tables */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                {document.result?.summary || "No summary available for this document."}
              </p>
            </CardContent>
          </Card>

          {document.result?.tables && document.result.tables.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">Extracted Tables</h3>
              {document.result.tables.map((table, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-medium text-sm text-slate-700">
                    {table.title || `Table ${idx + 1}`}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                          {table.headers.map((h, i) => <th key={i} className="px-6 py-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {row.map((cell, cIdx) => <td key={cIdx} className="px-6 py-3 text-slate-700">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Entities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.result?.entities && document.result.entities.length > 0 ? (
                document.result.entities.map((entity, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">{entity.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{entity.value}</p>
                    </div>
                    {entity.category && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 capitalize">
                        {entity.category}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No specific entities found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
