import * as React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'crimson'
    | 'emerald'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variantStyles: Record<string, string> = {
      default:
        'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-xs',
      crimson:
        'bg-rose-700 text-white hover:bg-rose-800 active:scale-[0.99] shadow-xs',
      emerald:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] shadow-xs',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.99]',
      outline:
        'border border-slate-200/90 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs',
      ghost:
        'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
      destructive:
        'bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100/80',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      default: 'h-10 px-4 text-xs sm:text-sm rounded-lg gap-2',
      lg: 'h-11 px-5 text-sm rounded-lg gap-2',
      icon: 'h-9 w-9 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variantStyles[variant] || variantStyles.default} ${
          sizeStyles[size] || sizeStyles.default
        } ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
