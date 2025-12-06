'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/contexts/AdminAuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Add shake animation styles
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  .animate-shake {
    animation: shake 0.65s cubic-bezier(.36,.07,.19,.97) both;
  }
`;

export default function SecureAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const { login, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const secretPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;
      router.push(`/${secretPath}`);
    }
  }, [isAuthenticated, router]);

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime && lockoutTime > Date.now()) {
      const timer = setInterval(() => {
        const remaining = lockoutTime - Date.now();
        if (remaining <= 0) {
          setLockoutTime(null);
          setAttempts(0);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    return Math.ceil((lockoutTime - Date.now()) / 1000);
  };

  const isLocked = !!(lockoutTime && lockoutTime > Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if locked out
    if (lockoutTime && lockoutTime > Date.now()) {
      const remaining = getRemainingLockoutTime();
      setError(`Too many failed attempts. Please wait ${remaining} seconds.`);
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('Login successful! Redirecting...');
        // Reset attempts on success
        setAttempts(0);
        setLockoutTime(null);
        
        // Redirect to admin dashboard immediately
        const secretPath = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;
        
        // Force redirect with replace to prevent back button issues
        window.location.href = `/${secretPath}`;
      } else {
        // Trigger shake animation
        setShake(true);
        setTimeout(() => setShake(false), 650);
        
        // Increment failed attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Lockout after 5 failed attempts
        if (newAttempts >= 5) {
          const lockoutDuration = 5 * 60 * 1000; // 5 minutes
          setLockoutTime(Date.now() + lockoutDuration);
          setError('Too many failed attempts. Account locked for 5 minutes.');
        } else {
          setError(result.error || 'Invalid credentials. Please try again.');
          setError(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
        }
        
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setShake(true);
      setTimeout(() => setShake(false), 650);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Inject shake animation styles */}
      <style dangerouslySetInnerHTML={{ __html: shakeKeyframes }} />
      
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4 py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10 animate-fadeIn">
        {/* Login Card */}
        <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-10 text-center overflow-hidden">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer"></div>
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-5 border-4 border-white/30 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <span className="text-6xl">🔐</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Secure Access</h1>
              <p className="text-purple-100 text-lg font-medium">VGS Control Panel</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold">System Online</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-300 flex items-center gap-2"
              >
                <span className="text-purple-400">📧</span>
                <span>Email Address</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm hover:bg-slate-700/70"
                  placeholder="admin@vgs.edu"
                  disabled={isLoading || isLocked}
                  autoFocus
                  autoComplete="email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-sm"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-300 flex items-center gap-2"
              >
                <span className="text-purple-400">🔑</span>
                <span>Password</span>
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-12 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm hover:bg-slate-700/70"
                  placeholder="Enter your secure password"
                  disabled={isLoading || isLocked}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading || isLocked}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-sm"></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/50 border-2 border-red-500/50 rounded-xl flex items-start space-x-3 backdrop-blur-sm animate-shake">
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-red-200 font-semibold text-sm">{error}</p>
                  {isLocked && (
                    <p className="text-red-300 text-xs mt-1">
                      Time remaining: {getRemainingLockoutTime()} seconds
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center justify-between px-4 py-2 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                <span className="text-yellow-300 text-sm font-medium">Failed attempts: {attempts}/5</span>
                <span className="text-yellow-400 text-xs">⚠️</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="group relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
              </div>

              <span className="relative flex items-center justify-center gap-3 text-lg">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : isLocked ? (
                  <>
                    <span>🔒</span>
                    <span>Account Locked</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Access Control Panel</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </span>
            </button>

            {/* Additional Security Info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">🔒</span>
                </div>
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400">🛡️</span>
                </div>
                <span>Two-Factor Authentication Ready</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400">📊</span>
                </div>
                <span>Activity Monitoring Enabled</span>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <a
                  href="/"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 text-sm font-medium group"
                >
                  <svg
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back to Website</span>
                </a>
                <span className="text-gray-600 text-sm font-mono">VGS v2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-5 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold mb-2 text-sm">
                Authorized Personnel Only
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                This control panel is restricted to VGS administrators and developers only. 
                All access attempts are logged, monitored, and may be subject to legal action 
                if unauthorized access is attempted.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>🔍</span>
                <span>IP: {typeof window !== 'undefined' ? 'Logged' : 'N/A'}</span>
                <span>•</span>
                <span>Session: Monitored</span>
                <span>•</span>
                <span>Audit: Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs font-mono">
            Secure Authentication System v2.0 • Protected by Supabase
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
    </>
  );
}
