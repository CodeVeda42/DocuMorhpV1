import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { format } from 'date-fns';
import { Eye, Download, Trash2, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Wand2 } from 'lucide-react';
import { db } from '../services/db';
import { Document } from '../types';

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Document; direction: 'asc' | 'desc' }>({ key: 'uploadDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const itemsPerPage = 8;

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await db.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await db.deleteDocument(deleteId);
      setDocuments(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleSort = (key: keyof Document) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedDocs = useMemo(() => {
    let result = [...documents];
    
    // Filter
    if (filter !== 'all') {
      result = result.filter(doc => doc.type === filter);
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [documents, filter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedDocs.length / itemsPerPage);
  const paginatedDocs = filteredAndSortedDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Documents</h1>
          <p className="text-slate-500">Manage and view your processed files.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                    className="h-10 pl-9 pr-4 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                >
                    <option value="all">All Types</option>
                    <option value="general">General</option>
                    <option value="invoice">Invoices</option>
                    <option value="resume">Resumes</option>
                </select>
            </div>
            <Link to="/dashboard/upload">
              <Button>New Upload</Button>
            </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('type')}>
                   <div className="flex items-center gap-1">Type <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('uploadDate')}>
                   <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDocs.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No documents found. Click "New Upload" to get started.
                    </td>
                </tr>
              ) : (
                paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                {doc.type.substring(0, 3)}
                            </div>
                            <div className="max-w-[150px] sm:max-w-[200px] truncate" title={doc.title}>{doc.title}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-500">{doc.type}</td>
                    <td className="px-6 py-4 text-slate-500">
                        {format(new Date(doc.uploadDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                        {doc.result?.confidenceScore ? (
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ width: `${doc.result.confidenceScore * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500">
                                    {Math.round(doc.result.confidenceScore * 100)}%
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-400">-</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <Badge
                        variant={
                            doc.status === 'completed'
                            ? 'success'
                            : doc.status === 'processing'
                            ? 'warning'
                            : doc.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                        >
                        {doc.status}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Link to={`/dashboard/editor/${doc.id}`}>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Open Editor">
                                    <Wand2 className="h-4 w-4" />
                                </button>
                            </Link>
                            <Link to={`/dashboard/documents/${doc.id}`}>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="View Details">
                                    <Eye className="h-4 w-4" />
                                </button>
                            </Link>
                            <button 
                                onClick={() => setDeleteId(doc.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                    Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </Card>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Document"
        footer={
            <>
                <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </>
        }
      >
        <p className="text-slate-600">
            Are you sure you want to delete this document? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
