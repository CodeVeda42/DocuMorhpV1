import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wand2, Layout, FileText, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Threads from '../components/ui/Threads';
import { useTheme } from '../components/ThemeProvider';

export const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-500 text-xl">
            <Wand2 className="h-6 w-6" />
            <span>DocuMorph AI</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-none">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
             {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
               {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button 
              className="p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4 shadow-lg absolute w-full animate-in slide-in-from-top-5">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Sign In</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Get Started</Button>
                </Link>
            </div>
        )}
      </nav>

      {/* Hero Section with Threads Background */}
      <section className="relative overflow-hidden bg-slate-950 pt-12 pb-16 lg:pt-32 lg:pb-24">
        {/* Threads Animation Background */}
        <div className="absolute inset-0 z-0 opacity-40">
            <Threads 
                color={[0.4, 0.3, 1]} // Original Indigo/Purple tint
                amplitude={1.5} 
                distance={0} 
                enableMouseInteraction={true} 
            />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Removed Here */}
          
          <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-8 delay-100 leading-tight">
            Stop Formatting Manually. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Let AI Morph Your Docs.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 mb-10 animate-in fade-in slide-in-from-bottom-8 delay-200 px-4">
            Upload your rough draft, choose a professional template (IEEE, Corporate, Legal), and get a perfectly formatted document instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 delay-300 px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20 border-none font-bold">
                Try for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Feature Preview */}
          <div className="mt-16 sm:mt-24 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl animate-in fade-in zoom-in-95 delay-500 mx-4 sm:mx-auto backdrop-blur-sm">
             <div className="aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden relative flex flex-col sm:flex-row border border-slate-800">
                <div className="w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-slate-800 p-4 sm:p-8 space-y-4">
                    <div className="text-xs font-bold text-slate-500 uppercase">Input: Raw Text</div>
                    <div className="font-mono text-xs sm:text-sm text-slate-400 space-y-2">
                        <p>introduction to neural networks</p>
                        <p>neural networks are a subset of machine learning...</p>
                        <p>figure 1 shows the architecture</p>
                    </div>
                </div>
                <div className="w-full sm:w-1/2 p-4 sm:p-8 space-y-4 bg-slate-900/50">
                    <div className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
                        <Wand2 className="h-3 w-3" /> Output: Formatted
                    </div>
                    <div className="bg-white shadow-sm border border-slate-200 p-4 sm:p-6 h-full rounded-lg transform scale-95 origin-top-left sm:origin-top">
                        <h1 className="text-lg sm:text-xl font-bold font-serif text-center mb-4 text-black">Introduction to Neural Networks</h1>
                        <p className="text-[10px] sm:text-xs font-serif text-justify leading-relaxed text-black">
                            <span className="font-bold">Abstract—</span> Neural networks are a subset of machine learning...
                        </p>
                    </div>
                </div>
                
                {/* Floating Arrow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full p-2 text-white shadow-lg hidden sm:block ring-4 ring-slate-950">
                    <ArrowRight className="h-6 w-6" />
                </div>
             </div>
          </div>
        </div>
        
        {/* Gradient Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Everything you need</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Professional formatting tools at your fingertips</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: Layout, title: "Smart Templates", desc: "Define fonts, margins, and layouts once. Apply them to any document forever." },
                    { icon: Wand2, title: "AI Structure Detection", desc: "Our AI automatically identifies headings, captions, and lists in your raw text." },
                    { icon: FileText, title: "Instant Export", desc: "Download ready-to-print DOCX files compatible with Microsoft Word." }
                ].map((f, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                            <f.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">{f.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};
