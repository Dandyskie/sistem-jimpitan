import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'crimson'
    | 'emerald'
    | 'income'
    | 'expense';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors select-none';

  const variants: Record<string, string> = {
    default:
      'border-slate-200 bg-slate-100 text-slate-800',
    secondary:
      'border-slate-200 bg-slate-50 text-slate-700',
    outline:
      'border-slate-200 text-slate-700 bg-white',
    destructive:
      'border-rose-200 bg-rose-50 text-rose-700',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning:
      'border-amber-200 bg-amber-50 text-amber-700',
    crimson:
      'border-rose-200 bg-rose-50 text-rose-700',
    emerald:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
    income:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
    expense:
      'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div
      className={`${base} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
