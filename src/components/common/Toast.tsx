import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

/* Warna latar dan ikon berdasarkan tipe notifikasi */
const TOAST_STYLES: Record<
  ToastMessage['type'],
  { bg: string; icon: React.ElementType; iconColor: string }
> = {
  success: {
    bg: 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg',
    icon: CheckCircle2,
    iconColor: 'text-[var(--color-success)]',
  },
  error: {
    bg: 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg',
    icon: AlertCircle,
    iconColor: 'text-[var(--color-danger)]',
  },
  info: {
    bg: 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-lg',
    icon: Info,
    iconColor: 'text-[var(--color-monthly)]',
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-[380px] z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] border ${style.bg} transition-all animate-in slide-in-from-top-2`}
          >
            <Icon className={`w-5 h-5 ${style.iconColor} shrink-0 mt-0.5`} />
            <p className="flex-1 text-sm font-medium text-[var(--color-text-primary)] leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] p-0.5 rounded cursor-pointer transition-colors shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
