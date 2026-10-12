import React from 'react';
import { Search, Plus } from 'lucide-react';

interface WargaFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  blockFilter: string;
  onBlockFilterChange: (block: string) => void;
  tipeIuranFilter: 'semua' | 'bulanan' | 'harian';
  onTipeIuranFilterChange: (filter: 'semua' | 'bulanan' | 'harian') => void;
  totalCount: number;
  monthlyCount: number;
  dailyCount: number;
  onOpenAdd: () => void;
}

const AVAILABLE_BLOCKS = ['semua', 'Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

/**
 * Toolbar Penyaringan Data Warga.
 * Mengelola filter blok, pengelompokan iuran bulanan vs harian, dan tombol tambah warga baru.
 */
export const WargaFilterToolbar: React.FC<WargaFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  blockFilter,
  onBlockFilterChange,
  tipeIuranFilter,
  onTipeIuranFilterChange,
  totalCount,
  monthlyCount,
  dailyCount,
  onOpenAdd,
}) => {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
            Master Data 170 Warga Lingkungan BDA
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Kelola status kepala keluarga, tipe iuran (bulanan vs harian), dan kontak warga
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          className="h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Warga Baru</span>
        </button>
      </div>

      <div className="pt-3 border-t border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills Tipe Iuran */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => onTipeIuranFilterChange('semua')}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              tipeIuranFilter === 'semua'
                ? 'bg-[var(--color-text-primary)] text-white shadow-xs'
                : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:bg-slate-200'
            }`}
          >
            Semua ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onTipeIuranFilterChange('bulanan')}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              tipeIuranFilter === 'bulanan'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            Iuran Bulanan ({monthlyCount})
          </button>

          <button
            type="button"
            onClick={() => onTipeIuranFilterChange('harian')}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              tipeIuranFilter === 'harian'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'bg-emerald-50 text-[var(--color-primary)] hover:bg-emerald-100'
            }`}
          >
            Jimpitan Harian ({dailyCount})
          </button>
        </div>

        {/* Filter Blok dan Pencarian */}
        <div className="flex items-center gap-2">
          <select
            value={blockFilter}
            onChange={(e) => onBlockFilterChange(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {AVAILABLE_BLOCKS.map((b) => (
              <option key={b} value={b}>
                {b === 'semua' ? 'Semua Blok' : b}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama/rumah..."
              className="w-40 sm:w-48 h-9 pl-8 pr-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
