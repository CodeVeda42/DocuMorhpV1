import { useState, useRef, useEffect } from 'react';
import { Search, User as UserIcon, Menu, Upload, LogOut, Settings as SettingsIcon, Camera, FileText, AlertCircle, Sun, Moon, Loader2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useUser } from '../../hooks/useUser';
import { db } from '../../services/db';
import { Document } from '../../types';
import { cn } from '../../lib/utils';
import { useTheme } from '../ThemeProvider';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, updateProfile, uploadAvatar } = useUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Logic
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const docs = await db.getDocuments();
        const filtered = docs.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5); // Limit to top 5 results
        setSearchResults(filtered);
      } catch (error) {
        console.error("Search failed", error);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate File Type (Only JPG/PNG)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Only JPG and PNG images are allowed.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);

      try {
        // 1. Upload to Storage
        const publicUrl = await uploadAvatar(file);
        
        if (publicUrl) {
          // 2. Update User Profile
          await updateProfile({ avatarUrl: publicUrl });
          setUploadSuccess(true);
          
          // Close dropdown after a brief success message
          setTimeout(() => {
            setIsProfileOpen(false);
            setUploadSuccess(false);
          }, 1500);
        } else {
          throw new Error("Upload failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Avatar upload failed", error);
        setUploadError(error.message || "Upload failed. Ensure you have an 'avatars' bucket.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResultClick = (docId: string) => {
    navigate(`/dashboard/editor/${docId}`);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  const handleSignOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 shrink-0 transition-colors">
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-1/3">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden -ml-2 px-2 text-slate-600 dark:text-slate-300" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm hidden sm:block" ref={searchRef}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
          />
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                    Documents
                  </div>
                  {searchResults.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleResultClick(doc.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 last:border-0"
                    >
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Edited {new Date(doc.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No documents found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Search Icon */}
        <button className="sm:hidden p-2 text-slate-500 dark:text-slate-400">
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Profile Dropdown Section */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3 md:pl-4 ml-1 md:ml-0 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-1 transition-colors outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
            </div>
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center group">
               {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                  <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
               )}
               {/* Hover Overlay for Desktop */}
               <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center">
                  <Camera className="h-3 w-3 text-white" />
               </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                
                {uploadError && (
                  <div className="px-4 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {uploadError}
                  </div>
                )}

                <button 
                  onClick={triggerFileUpload}
                  disabled={isUploading || uploadSuccess}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors",
                    uploadSuccess 
                      ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" 
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Uploaded!
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-slate-400" />
                      Upload Photo
                    </>
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, .jpg, .png" 
                  onChange={handleFileChange}
                />

                <Link 
                  to="/dashboard/settings" 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <SettingsIcon className="h-4 w-4 text-slate-400" />
                  Settings
                </Link>
                
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
