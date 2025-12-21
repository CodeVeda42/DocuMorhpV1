import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Palette, Settings, LogOut, Wand2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wand2, label: 'Morph Editor', path: '/dashboard/editor' },
  { icon: Palette, label: 'Templates', path: '/dashboard/templates' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6">
          <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 text-xl">
            <Wand2 className="h-6 w-6" />
            <span>DocuMorph</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
          <div className="mb-4 px-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Workspace
              </span>
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose} // Close on navigation
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <NavLink to="/">
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
              </button>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
