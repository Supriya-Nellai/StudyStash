import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginUser, loginWithGoogle, sendPasswordReset } from '../firebase/auth';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onLoginSuccess,
  addToast
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrorMessage(null);
      setIsResetMode(false);
      setResetSent(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMessage(null);
    setIsResetMode(false);
    setResetSent(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isResetMode) {
        if (newPassword !== confirmNewPassword) {
          throw new Error('New passwords do not match.');
        }
        await sendPasswordReset(email, newPassword);
        setResetSent(true);
        addToast('success', 'Password updated successfully! Please log in with your new password.');
        setIsResetMode(false);
        setPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const profile = await loginUser(email, password);
        addToast('success', `Welcome back, ${profile.name}!`);
        onLoginSuccess(profile);
        handleClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const profile = await loginWithGoogle();
      addToast('success', `Welcome back, ${profile.name}!`);
      onLoginSuccess(profile);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container styling matching .popup-box1 from StudyStash */}
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative text-center">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold text-[#8B4513] dark:text-amber-500 font-['Courgette',cursive] mb-1">
          {isResetMode ? 'Reset Password' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
          {isResetMode
            ? 'Enter your registered email and choose a new password.'
            : 'Access StudyStash Anna University Notes & Materials'}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {resetSent && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs text-left flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password updated successfully! You can now log in below.</span>
          </div>
        )}

        {!isResetMode && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 mb-4 rounded-xl border border-[#8B4513] bg-white hover:bg-[#FAF7F2] text-[#8B4513] font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        {!isResetMode && (
          <div className="relative my-4 flex items-center justify-center">
            <hr className="w-full border-stone-200 dark:border-stone-800" />
            <span className="absolute bg-white dark:bg-stone-900 px-3 text-xs text-stone-500">
              OR EMAIL
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
              />
            </div>
          </div>

          {isResetMode ? (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setIsResetMode(true); setErrorMessage(null); setResetSent(false); }}
                  className="text-xs text-[#8B4513] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-2.5 px-4 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : isResetMode ? (
              <span>Reset Password & Save</span>
            ) : (
              <>
                <span>Login to StudyStash</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-xs text-stone-600 dark:text-stone-400">
          {isResetMode ? (
            <button
              onClick={() => { setIsResetMode(false); setErrorMessage(null); }}
              className="text-[#8B4513] font-bold hover:underline"
            >
              ← Back to Login
            </button>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { onClose(); onSwitchToSignup(); }}
                className="text-[#8B4513] font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
