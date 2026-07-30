import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { registerUser, validatePassword } from '../firebase/auth';
import { DepartmentCode, UserProfile } from '../types';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  addToast
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState<DepartmentCode>('CSE');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDepartment('CSE');
      setErrorMessage(null);
      setVerificationNotice(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDepartment('CSE');
    setErrorMessage(null);
    setVerificationNotice(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const val = validatePassword(password);
    if (!val.valid) {
      setErrorMessage(val.message || 'Invalid password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(name, email, password, department);
      setVerificationNotice(true);
      addToast('success', 'Account created successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative text-center max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold text-[#8B4513] dark:text-amber-500 font-['Courgette',cursive] mb-1">
          Create Account
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-5">
          Join StudyStash Anna University Notes Community
        </p>

        {verificationNotice ? (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-amber-700" />
              <span>Account Created!</span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Your account <strong>{email}</strong> has been registered successfully.
            </p>
            <button
              onClick={() => {
                setVerificationNotice(false);
                onClose();
                onSwitchToLogin();
              }}
              className="w-full mt-2 py-2.5 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-xs rounded-lg transition"
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

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
                    placeholder="student@college.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value as DepartmentCode)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  >
                    <option value="CSE">CSE - Computer Science & Engineering</option>
                    <option value="IT">IT - Information Technology</option>
                    <option value="AIDS">AIDS - Artificial Intelligence & Data Science</option>
                    <option value="ECE">ECE - Electronics & Communication</option>
                    <option value="CSBS">CSBS - Computer Science & Business Systems</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 chars, A-z, 0-9, @#$"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 number & 1 special character.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 px-4 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 text-xs text-stone-600 dark:text-stone-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { onClose(); onSwitchToLogin(); }}
                className="text-[#8B4513] font-bold hover:underline"
              >
                Log in here
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
