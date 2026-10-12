import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'primary' | 'warning';
}

/**
 * Modal dialog konfirmasi tindakan penting (misal hapus data atau reset status).
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = false,
  variant,
}) => {
  const isDangerous = isDestructive || variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-[var(--radius-md)] shrink-0 ${
              isDangerous
                ? 'bg-[var(--color-danger-bg)] text-rose-700 border border-rose-200'
                : 'bg-[var(--color-warning-bg)] text-amber-800 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-1">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
          <Button variant="secondary" size="md" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
