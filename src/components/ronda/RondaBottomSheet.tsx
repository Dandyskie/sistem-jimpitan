import React from 'react';
import { X, Check } from 'lucide-react';
import { Resident } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface RondaBottomSheetProps {
  resident: Resident | null;
  customNominal: number;
  customCatatan: string;
  onNominalChange: (val: number) => void;
  onCatatanChange: (val: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

/**
 * Bottom Sheet Input Khusus Tarikan Jimpitan (Mobile).
 * Memfasilitasi input kustom seperti nominal bukan 2.000 atau catatan khusus kaleng.
 */
export const RondaBottomSheet: React.FC<RondaBottomSheetProps> = ({
  resident,
  customNominal,
  customCatatan,
  onNominalChange,
  onCatatanChange,
  onSave,
  onClose,
}) => {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-t-[24px] sm:rounded-[var(--radius-lg)] p-5 shadow-xl border border-[var(--color-border)] space-y-4">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border)]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-full border border-emerald-200">
              Input Tarikan Khusus
            </span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-1.5">
              {resident.blok} No. {resident.noRumah}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">{resident.nama}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sheet"
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pilihan Nominal Cepat */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
            Pilihan Nominal Cepat (Rupiah)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = customNominal === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onNominalChange(amt)}
                  className={`py-2.5 rounded-[var(--radius-sm)] text-xs font-bold font-mono transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)]'
                  }`}
                >
                  {formatRupiah(amt).replace('Rp\u00a0', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Manual Kustom */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
            Atau Ketik Nominal Kustom (Rp)
          </label>
          <input
            type="number"
            value={customNominal || ''}
            onChange={(e) => onNominalChange(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full h-11 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
          />
        </div>

        {/* Catatan Tambahan */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
            Catatan Petugas (Opsional)
          </label>
          <input
            type="text"
            value={customCatatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            placeholder="Contoh: Kaleng kosong, lebihan kas, atau titipan warga"
            className="w-full h-10 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
          />
        </div>

        {/* Tombol Aksi Simpan */}
        <div className="pt-2 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-surface-subtle)] hover:bg-slate-200 text-[var(--color-text-primary)] text-xs font-semibold transition-colors cursor-pointer border border-[var(--color-border)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Tarikan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
