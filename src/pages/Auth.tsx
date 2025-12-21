import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup';

export const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Errors & Feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';

    // Password Validation
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    // Full Name Validation (Sign Up only)
    if (mode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);
    setNeedsVerification(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!supabase) {
        // Mock Auth for demo if Supabase is not configured properly
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        return;
      }

      if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            // emailRedirectTo is optional if confirmation is disabled, but good to keep
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;

        // If 'Confirm email' is disabled in Supabase, data.session will be present immediately.
        if (data.session) {
          navigate('/dashboard');
        } else if (data.user && !data.session) {
          // 'Confirm email' is ENABLED in Supabase
          setSuccessMessage("Account created! Please check your email to confirm your account.");
          setMode('signin'); 
        } 

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle specific error codes
      if (err.code === 'email_not_confirmed' || err.message?.includes("Email not confirmed")) {
        setAuthError("Your email address has not been verified yet.");
        setNeedsVerification(true);
      } else if (err.code === 'invalid_credentials' || err.message?.includes("Invalid login credentials")) {
        setAuthError("Invalid email or password. Please try again.");
      } else if (err.code === 'email_provider_disabled') {
        setAuthError("Email login is disabled. Please enable 'Email' in your Supabase Dashboard > Authentication > Providers.");
      } else if (err.code === 'user_already_exists' || err.message?.includes("already registered")) {
        setAuthError("This email is already registered. Please sign in.");
        // Optional: Automatically switch to sign in mode
        // setMode('signin'); 
      } else {
        console.error("Auth error:", err);
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase!.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      setSuccessMessage("Verification email resent! Please check your inbox.");
      setAuthError(null);
      setNeedsVerification(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setAuthError(null);
    setSuccessMessage(null);
    setNeedsVerification(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-classic-dark p-4 transition-colors">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signin' 
              ? 'Enter your credentials to access your account' 
              : 'Enter your information to get started'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {authError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
              {needsVerification && (
                <button 
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="text-xs font-semibold underline hover:text-red-800 dark:hover:text-red-300 self-start ml-6 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <RefreshCw className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="fullName">Full Name</label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  icon={<User className="h-4 w-4" />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                {mode === 'signin' && (
                  <a href="#" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2" 
              size="lg" 
              isLoading={loading}
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" 
            onClick={handleGoogleLogin}
            type="button"
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={toggleMode}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-all"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
