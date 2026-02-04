'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { login as loginApi, signup as signupApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface LoginSignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  loginOnly?: boolean;
}

export default function LoginSignupDialog({ isOpen, onClose, onLoginSuccess, loginOnly = false }: LoginSignupDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(loginForm.email, loginForm.password);
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Clear form
        setLoginForm({ email: '', password: '' });
        
        // Call success callback or close dialog
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
          // Refresh the page to update header/auth state
          window.location.reload();
        }
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate password length
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await signupApi({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        role: 'customer', // Default role for client signups
      });
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Clear form
        setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
        
        // Close dialog and refresh
        onClose();
        window.location.reload();
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login
    // For now, we'll redirect to Google OAuth URL
    // You'll need to set up Google OAuth in your backend
    const googleAuthUrl = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || '/api/auth/google';
    window.location.href = googleAuthUrl;
  };

  const dialog = (
    <>
      {/* Backdrop only below header – header stays clear */}
      <div
        className="fixed top-14 left-0 right-0 bottom-0 z-[100] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Center modal in area below header */}
      <div className="fixed top-14 left-0 right-0 bottom-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md relative max-h-[calc(100vh-5rem)] overflow-y-auto border border-gray-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Login"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title - Login Only or Tabs */}
        {loginOnly ? (
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-600 mt-1">Enter your credentials to continue</p>
          </div>
        ) : (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'login'
                  ? 'text-[#ff006e] border-b-2 border-[#ff006e]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'signup'
                  ? 'text-[#ff006e] border-b-2 border-[#ff006e]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {(loginOnly || activeTab === 'login') && (
          <div className="p-6">
            {!loginOnly && <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#ff006e] hover:underline">
                  Forgot Password?
                </a>
              </div>
                             <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-[#ff006e] text-white py-3 rounded-lg font-semibold hover:bg-[#d4005a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? 'Logging in...' : 'Login'}
               </button>
               
               {/* Divider */}
               <div className="flex items-center my-4">
                 <div className="flex-1 border-t border-gray-300"></div>
                 <span className="px-4 text-sm text-gray-500">or</span>
                 <div className="flex-1 border-t border-gray-300"></div>
               </div>

               {/* Google Login Button */}
               <button
                 type="button"
                 onClick={handleGoogleLogin}
                 className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path
                     fill="#4285F4"
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                   />
                   <path
                     fill="#34A853"
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                   />
                   <path
                     fill="#FBBC05"
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                   />
                   <path
                     fill="#EA4335"
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                   />
                 </svg>
                 Continue with Google
               </button>
             </form>
           </div>
         )}

        {/* Signup Form */}
        {!loginOnly && activeTab === 'signup' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  required
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff006e] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-2" required />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-[#ff006e] hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#ff006e] hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
                             <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-[#ff006e] text-white py-3 rounded-lg font-semibold hover:bg-[#d4005a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? 'Creating Account...' : 'Create Account'}
               </button>
               
               {/* Divider */}
               <div className="flex items-center my-4">
                 <div className="flex-1 border-t border-gray-300"></div>
                 <span className="px-4 text-sm text-gray-500">or</span>
                 <div className="flex-1 border-t border-gray-300"></div>
               </div>

               {/* Google Sign Up Button */}
               <button
                 type="button"
                 onClick={handleGoogleLogin}
                 className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path
                     fill="#4285F4"
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                   />
                   <path
                     fill="#34A853"
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                   />
                   <path
                     fill="#FBBC05"
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                   />
                   <path
                     fill="#EA4335"
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                   />
                 </svg>
                 Sign up with Google
               </button>
             </form>
           </div>
         )}
        </div>
      </div>
    </>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
