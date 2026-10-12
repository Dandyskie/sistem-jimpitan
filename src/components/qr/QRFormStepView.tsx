import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Resident, JimpitanRecord } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QRFormStepViewProps {
  resident: Resident;
  existingRecord: JimpitanRecord | null;
  isCorrecting: boolean;
  nominal: number;
  onNominalChange: (val: number) => void;
  isCustomNominal: boolean;
  onToggleCustomNominal: (val: boolean) => void;
  customNominal: string;
  onCustomNominalChange: (val: string) => void;
  catatan: string;
  onCatatanChange: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

/**
 * Tampilan Formulir Konfirmasi Tarikan Hasil Scan QR.
 */
export const QRFormStepView: React.FC<QRFormStepViewProps> = ({
  resident,
  isCorrecting,
  nominal,
  onNominalChange,
  isCustomNominal,
  onToggleCustomNominal,
  customNominal,
  onCustomNominalChange,
  catatan,
  onCatatanChange,
  onSave,
  onCancel,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-4">
      {/* Kartu Rumah Terpilih */}
      <div className="p-3.5 bg-[var(--color-primary-light)] border border-emerald-200 rounded-[var(--radius-md)] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-[var(--color-primary)] tracking-wider">
            QR Teridentifikasi
          </span>
          <h4 className="text-sm font-extrabold text-[var(--color-text-primary)] mt-0.5">
            {resident.blok} No. {resident.noRumah}
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)] font-medium">{resident.nama}</p>
        </div>
        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-emerald-200 flex items-center justify-center font-bold text-xs text-[var(--color-primary)] shadow-2xs">
          {resident.noRumah}
        </div>
      </div>

      {isCorrecting && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-[var(--radius-sm)] flex items-center gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Mode Koreksi: Anda memperbarui catatan setoran yang sudah tersimpan sebelumnya.</span>
        </div>
      )}

      {/* Pilihan Nominal Cepat */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--color-text-primary)]">
          Nominal Tarikan Jimpitan
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = !isCustomNominal && nominal === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  onToggleCustomNominal(false);
                  onNominalChange(amt);
                }}
                className={`py-2 rounded-[var(--radius-sm)] text-xs font-bold font-mono transition-colors cursor-pointer border ${
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

      {/* Input Nominal Kustom */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-[var(--color-text-primary)]">
            Nominal Kustom (Lainnya)
          </label>
          <button
            type="button"
            onClick={() => onToggleCustomNominal(!isCustomNominal)}
            className="text-[11px] text-[var(--color-primary)] font-semibold cursor-pointer"
          >
            {isCustomNominal ? 'Pakai Preset' : 'Ketik Manual'}
          </button>
        </div>

        {isCustomNominal && (
          <input
            type="number"
            value={customNominal}
            onChange={(e) => onCustomNominalChange(e.target.value)}
            placeholder="Ketik nominal rupiah..."
            className="w-full h-10 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
          />
        )}
      </div>

      {/* Catatan Petugas */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
          Catatan Lapangan (Opsional)
        </label>
        <input
          type="text"
          value={catatan}
          onChange={(e) => onCatatanChange(e.target.value)}
          placeholder="Contoh: Kaleng kosong / lebihan kas"
          className="w-full h-10 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
        />
      </div>

      <div className="pt-2 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-surface-subtle)] hover:bg-slate-200 text-[var(--color-text-primary)] text-xs font-semibold transition-colors cursor-pointer border border-[var(--color-border)]"
        >
          Scan Ulang
        </button>
        <button
          type="submit"
          className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          <span>Simpan Tarikan</span>
        </button>
      </div>
    </form>
  );
};
