import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Palette, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DEFAULT_TEMPLATES } from '../lib/mockData';
import { db } from '../services/db';
import { Document } from '../types';
import { format, subDays, isAfter } from 'date-fns';
import { useUser } from '../hooks/useUser';

export const Dashboard = () => {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const docs = await db.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Dynamic Calculations ---

  // 1. Total Documents
  const totalDocs = documents.length;

  // 2. Saved This Week
  const oneWeekAgo = subDays(new Date(), 7);
  const savedThisWeek = documents.filter(doc => 
    doc.updatedAt && isAfter(new Date(doc.updatedAt), oneWeekAgo)
  ).length;

  // 3. Words Processed (Estimate)
  const totalWords = documents.reduce((acc, doc) => {
    // If we have parsed sections, count the words in them
    const sectionWords = doc.sections?.reduce((count, section) => {
      return count + (section.content ? section.content.split(/\s+/).length : 0);
    }, 0) || 0;
    return acc + sectionWords;
  }, 0);

  const formattedWords = totalWords > 1000 
    ? `${(totalWords / 1000).toFixed(1)}k` 
    : totalWords.toString();

  const recentDocs = documents.slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ready to morph some documents today?</p>
        </div>
        <Link to="/dashboard/editor" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        {/* Card 1: Total Documents */}
        <Card className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-none dark:from-indigo-600 dark:to-violet-700">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <p className="text-indigo-100 font-medium mb-1">Total Documents</p>
              <h3 className="text-4xl font-bold">{totalDocs}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100 bg-white/10 w-fit px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span>{savedThisWeek} saved this week</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Card 2: Active Templates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Templates</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
                    <Palette className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{DEFAULT_TEMPLATES.length}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Custom & System</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Card 3: Words Processed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Words Processed</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formattedWords}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">All time estimate</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
        </div>
        
        {recentDocs.length > 0 ? (
          <div className="grid gap-4">
              {recentDocs.map(doc => (
                  <div key={doc.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all gap-4">
                      <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                              <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate">{doc.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Edited {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : 'Unknown'}</p>
                          </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                              {DEFAULT_TEMPLATES.find(t => t.id === doc.templateId)?.name || 'Unknown'}
                          </span>
                          <Link to={`/dashboard/editor/${doc.id}`}>
                              <Button variant="outline" size="sm">Open Editor</Button>
                          </Link>
                      </div>
                  </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No documents found. Start by creating a new project!</p>
            <Link to="/dashboard/editor">
              <Button>Create First Document</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
