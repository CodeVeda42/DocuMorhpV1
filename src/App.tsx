import { useEffect, useState, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { Upload } from './pages/Upload';
import { supabase } from './lib/supabase';
import { userService } from './services/userService';
import { Loader2 } from 'lucide-react';

// Wrapper to protect routes that require authentication
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // STRICT SECURITY: If Supabase is not configured, deny access.
    // This prevents the "Demo Mode" bypass in production-like environments.
    if (!supabase) {
      setSession(false);
      return;
    }
    
    // 1. Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    // 2. Listen for auth changes (sign out, token expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-classic-dark"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  if (!session) {
    // Redirect to Auth page, saving the location they tried to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  // Sync Supabase Auth with Local User Service
  useEffect(() => {
    if (!supabase) return;

    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Use setLocal to avoid infinite loop (sync only, don't push to server)
        const currentUser = userService.get();
        userService.setLocal({
          ...currentUser,
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: 'user',
          avatarUrl: session.user.user_metadata?.avatar_url
        });
      } else {
        // Explicitly set to guest if no session found (overrides mock data)
        const currentUser = userService.get();
        userService.setLocal({
          ...currentUser,
          id: '',
          name: 'Guest',
          email: '',
          role: 'user',
          avatarUrl: undefined
        });
      }
    });

    // Listen for changes (Sign In, Sign Out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const currentUser = userService.get();
        userService.setLocal({
          ...currentUser,
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: 'user',
          avatarUrl: session.user.user_metadata?.avatar_url
        });
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Reset to a guest state
        const currentUser = userService.get();
        userService.setLocal({
          ...currentUser,
          id: '',
          name: 'Guest',
          email: '',
          role: 'user',
          avatarUrl: undefined
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Application Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="editor" element={<Editor />} />
          <Route path="editor/:id" element={<Editor />} />
          <Route path="upload" element={<Upload />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
