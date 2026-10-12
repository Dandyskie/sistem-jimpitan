import React from 'react';
import { JimpitanRecord, PaymentStatus } from '../../../types';
import { Modal } from '../../common/Modal';

interface RiwayatEditModalProps {
  editingRecord: JimpitanRecord | null;
  editNominal: number;
  onNominalChange: (val: number) => void;
  editStatus: PaymentStatus;
  onStatusChange: (val: PaymentStatus) => void;
  editCatatan: string;
  onCatatanChange: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const RiwayatEditModal: React.FC<RiwayatEditModalProps> = ({
  editingRecord,
  editNominal,
  onNominalChange,
  editStatus,
  onStatusChange,
  editCatatan,
  onCatatanChange,
  onSave,
  onClose,
}) => {
  if (!editingRecord) return null;

  return (
    <Modal
      isOpen={Boolean(editingRecord)}
      onClose={onClose}
      title="Koreksi Data Jimpitan"
      size="sm"
    >
      <form onSubmit={onSave} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Warga Terkait
          </span>
          <p className="font-bold text-slate-900">
            {editingRecord.residentName} ({editingRecord.blok} No. {editingRecord.noRumah})
          </p>
          <p className="text-slate-500">Tanggal: {editingRecord.tanggal}</p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nominal Setoran (Rp)
          </label>
          <input
            type="number"
            value={editNominal}
            onChange={(e) => onNominalChange(parseInt(e.target.value, 10) || 0)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Status Tarikan
          </label>
          <select
            value={editStatus}
            onChange={(e) => onStatusChange(e.target.value as PaymentStatus)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
          >
            <option value="lunas">Lunas</option>
            <option value="sebagian">Sebagian</option>
            <option value="belum_bayar">Kosong / Belum Bayar</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Catatan Petugas (Opsional)
          </label>
          <input
            type="text"
            value={editCatatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};
