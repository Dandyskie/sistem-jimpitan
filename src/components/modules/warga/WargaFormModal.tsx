import React from 'react';
import { Modal } from '../../common/Modal';
import { Resident, ResidentStatus, TipeIuran } from '../../../types';

interface WargaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingResident: Resident | null;
  formNama: string;
  onNamaChange: (val: string) => void;
  formNoRumah: string;
  onNoRumahChange: (val: string) => void;
  formBlok: string;
  onBlokChange: (val: string) => void;
  formNoHp: string;
  onNoHpChange: (val: string) => void;
  formStatus: ResidentStatus;
  onStatusChange: (val: ResidentStatus) => void;
  formTipeIuran: TipeIuran;
  onTipeIuranChange: (val: TipeIuran) => void;
  formNominalBulanan: number;
  onNominalBulananChange: (val: number) => void;
  formCatatan: string;
  onCatatanChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const BLOCKS = ['Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

/**
 * Modal Tambah / Edit Data Warga RT 02 / RW 07.
 */
export const WargaFormModal: React.FC<WargaFormModalProps> = ({
  isOpen,
  onClose,
  editingResident,
  formNama,
  onNamaChange,
  formNoRumah,
  onNoRumahChange,
  formBlok,
  onBlokChange,
  formNoHp,
  onNoHpChange,
  formStatus,
  onStatusChange,
  formTipeIuran,
  onTipeIuranChange,
  formNominalBulanan,
  onNominalBulananChange,
  formCatatan,
  onCatatanChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isEdit = Boolean(editingResident);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Data Warga' : 'Tambah Warga Baru'}
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
            Nama Kepala Keluarga
          </label>
          <input
            type="text"
            required
            value={formNama}
            onChange={(e) => onNamaChange(e.target.value)}
            placeholder="Contoh: Bpk. Joko Susilo"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Blok
            </label>
            <select
              value={formBlok}
              onChange={(e) => onBlokChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            >
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Nomor Rumah
            </label>
            <input
              type="text"
              required
              value={formNoRumah}
              onChange={(e) => onNoRumahChange(e.target.value)}
              placeholder="01"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Nomor HP (WhatsApp)
            </label>
            <input
              type="text"
              value={formNoHp}
              onChange={(e) => onNoHpChange(e.target.value)}
              placeholder="0812xxxx"
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Status Hunian
            </label>
            <select
              value={formStatus}
              onChange={(e) => onStatusChange(e.target.value as ResidentStatus)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            >
              <option value="aktif">Aktif (Dihuni)</option>
              <option value="nonaktif">Kosong / Pindah</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
            Tipe Iuran
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTipeIuranChange('harian')}
              className={`p-2.5 rounded-[var(--radius-sm)] border text-xs font-semibold text-left transition-colors cursor-pointer ${
                formTipeIuran === 'harian'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'
              }`}
            >
              <div>Jimpitan Harian</div>
              <span className="text-[10px] text-[var(--color-text-secondary)] font-normal">Tarikan kaleng ronda malam</span>
            </button>

            <button
              type="button"
              onClick={() => onTipeIuranChange('bulanan')}
              className={`p-2.5 rounded-[var(--radius-sm)] border text-xs font-semibold text-left transition-colors cursor-pointer ${
                formTipeIuran === 'bulanan'
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'
              }`}
            >
              <div>Iuran Bulanan</div>
              <span className="text-[10px] text-[var(--color-text-secondary)] font-normal">Transfer bank / cash bendahara</span>
            </button>
          </div>
        </div>

        {formTipeIuran === 'bulanan' && (
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Nominal Iuran Bulanan (Rp)
            </label>
            <input
              type="number"
              value={formNominalBulanan}
              onChange={(e) => onNominalBulananChange(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
            Catatan Tambahan
          </label>
          <input
            type="text"
            value={formCatatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            placeholder="Lokasi kaleng, pesan khusus, dll"
            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-colors cursor-pointer active:scale-[0.98] shadow-xs"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Warga'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
