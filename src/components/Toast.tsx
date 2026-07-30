import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100'
              : toast.type === 'success'
              ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100'
              : 'bg-stone-50 border-stone-200 text-stone-900 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{toast.message}</div>
          <button
            onClick={() => onClose(toast.id)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 shrink-0 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
