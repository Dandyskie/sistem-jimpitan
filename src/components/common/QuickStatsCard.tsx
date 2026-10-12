import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  actionText?: string;
}

/**
 * Kartu metrik ringkas dengan gaya desain fintech modern.
 * Varian 'primary' menampilkan latar belakang hijau emerald kontras tinggi (ala OripioFin).
 */
export const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'default',
  onClick,
  actionText,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`p-5 rounded-[var(--radius-lg)] border transition-all ${
        isPrimary
          ? 'bg-[var(--color-primary)] border-[var(--color-primary-hover)] text-white shadow-sm'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-slate-300 shadow-xs'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              isPrimary ? 'text-emerald-100' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight font-mono tabular-nums leading-none">
              {value}
            </span>
          </div>
          {subValue && (
            <p
              className={`text-xs mt-2 flex items-center gap-1.5 ${
                isPrimary ? 'text-emerald-200' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {subValue}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
              isPrimary
                ? 'bg-white/15 text-white'
                : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      {actionText && (
        <div
          className={`mt-4 pt-3 border-t text-xs font-medium flex items-center justify-between ${
            isPrimary
              ? 'border-white/15 text-emerald-100 hover:text-white'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
          }`}
        >
          <span>{actionText}</span>
          <span aria-hidden="true">&rarr;</span>
        </div>
      )}
    </div>
  );
};
