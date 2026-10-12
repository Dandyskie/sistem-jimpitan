import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const BASE =
  'inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] active:transition-transform';

const SIZE_MAP = {
  sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5 rounded-[var(--radius-sm)]',
  md: 'text-sm px-3.5 py-2 h-9 gap-2 rounded-[var(--radius-sm)]',
  lg: 'text-sm px-5 py-2.5 h-11 gap-2.5 font-semibold rounded-[var(--radius-sm)]',
};

const VARIANT_MAP = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)]',
  outline: 'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)]',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
  success: 'bg-[var(--color-success)] text-white hover:opacity-90',
  ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-bg)] hover:text-[var(--color-text-primary)]',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    BASE,
    SIZE_MAP[size],
    VARIANT_MAP[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
