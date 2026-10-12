import React from 'react';
import { TransactionCategory, TransactionType } from '../../../types';
import { Modal } from '../../common/Modal';

interface CategoryOption {
  value: TransactionCategory;
  label: string;
}

interface TransaksiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  categoryOptions: CategoryOption[];
  deskripsi: string;
  onDeskripsiChange: (val: string) => void;
  nominal: string;
  onNominalChange: (val: string) => void;
  kategori: TransactionCategory;
  onKategoriChange: (val: TransactionCategory) => void;
  tanggal: string;
  onTanggalChange: (val: string) => void;
  penanggungJawab: string;
  onPenanggungJawabChange: (val: string) => void;
  catatan: string;
  onCatatanChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Modal Formulir Catatan Transaksi Kas RT (Pemasukan / Pengeluaran).
 */
export const TransaksiFormModal: React.FC<TransaksiFormModalProps> = ({
  isOpen,
  onClose,
  type,
  categoryOptions,
  deskripsi,
  onDeskripsiChange,
  nominal,
  onNominalChange,
  kategori,
  onKategoriChange,
  tanggal,
  onTanggalChange,
  penanggungJawab,
  onPenanggungJawabChange,
  catatan,
  onCatatanChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isIncome = type === 'pemasukan';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? 'Catat Pemasukan Kas Baru' : 'Catat Pengeluaran Kas Baru'}
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
            Deskripsi Transaksi
          </label>
          <input
            type="text"
            required
            value={deskripsi}
            onChange={(e) => onDeskripsiChange(e.target.value)}
            placeholder={isIncome ? 'Contoh: Iuran Warga Blok A-01' : 'Contoh: Beli Lampu Pos Ronda'}
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              required
              value={nominal}
              onChange={(e) => onNominalChange(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => onKategoriChange(e.target.value as TransactionCategory)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => onTanggalChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Penanggung Jawab
            </label>
            <input
              type="text"
              required
              value={penanggungJawab}
              onChange={(e) => onPenanggungJawabChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={catatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            placeholder="Keterangan tambahan atau nomor nota"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-sm)] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-[var(--radius-sm)] font-semibold text-white transition-colors cursor-pointer shadow-xs active:scale-[0.98] ${
              isIncome
                ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            Simpan Transaksi
          </button>
        </div>
      </form>
    </Modal>
  );
};
