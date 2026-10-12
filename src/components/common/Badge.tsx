import React from 'react';
import { PaymentStatus, ResidentStatus } from '../../types';

interface BadgeProps {
  status: PaymentStatus | ResidentStatus | 'pemasukan' | 'pengeluaran' | string;
  size?: 'sm' | 'md';
  customLabel?: string;
}

/*
  Peta warna status finansial sesuai DESIGN.md Section 3.2.
  Dot berwarna dipertahankan karena menandakan state riil (lunas/belum/sebagian),
  bukan dekoratif (sesuai antislop-ui R-31: dot harus mark real state).
*/
const STATUS_MAP: Record<string, { colors: string; dot: string; label: string }> = {
  lunas: {
    colors: 'bg-[var(--color-success-bg)] text-emerald-800 border-emerald-200',
    dot: 'bg-[var(--color-success)]',
    label: 'Lunas',
  },
  belum_bayar: {
    colors: 'bg-[var(--color-danger-bg)] text-red-800 border-red-200',
    dot: 'bg-[var(--color-danger)]',
    label: 'Belum Bayar',
  },
  sebagian: {
    colors: 'bg-[var(--color-warning-bg)] text-amber-800 border-amber-200',
    dot: 'bg-[var(--color-warning)]',
    label: 'Sebagian',
  },
  aktif: {
    colors: 'bg-[var(--color-neutral-bg)] text-[var(--color-text-primary)] border-slate-300',
    dot: 'bg-[var(--color-success)]',
    label: 'Aktif',
  },
  nonaktif: {
    colors: 'bg-[var(--color-neutral-bg)] text-[var(--color-text-secondary)] border-slate-200',
    dot: 'bg-[var(--color-text-disabled)]',
    label: 'Nonaktif',
  },
  pemasukan: {
    colors: 'bg-[var(--color-success-bg)] text-emerald-800 border-emerald-200',
    dot: 'bg-[var(--color-success)]',
    label: 'Pemasukan',
  },
  pengeluaran: {
    colors: 'bg-[var(--color-danger-bg)] text-red-800 border-red-200',
    dot: 'bg-[var(--color-danger)]',
    label: 'Pengeluaran',
  },
};

const FALLBACK = {
  colors: 'bg-[var(--color-neutral-bg)] text-[var(--color-text-secondary)] border-slate-200',
  dot: 'bg-[var(--color-text-disabled)]',
  label: '',
};

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm', customLabel }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const config = STATUS_MAP[status] ?? FALLBACK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border font-medium whitespace-nowrap ${config.colors} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {customLabel ?? config.label ?? status}
    </span>
  );
};
