import React from 'react';
import { Modal } from '../../common/Modal';
import { Resident } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

interface WargaDetailModalProps {
  resident: Resident | null;
  onClose: () => void;
}

/**
 * Modal Tampilan Rincian Data Warga.
 */
export const WargaDetailModal: React.FC<WargaDetailModalProps> = ({
  resident,
  onClose,
}) => {
  if (!resident) return null;

  return (
    <Modal
      isOpen={Boolean(resident)}
      onClose={onClose}
      title="Detail Data Warga"
      maxWidth="sm"
    >
      <div className="space-y-3 text-xs">
        <div className="p-3.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-[var(--radius-md)] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">
            Kepala Keluarga
          </span>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">{resident.nama}</p>
          <p className="text-[var(--color-text-secondary)]">
            {resident.blok} No. {resident.noRumah} (RT {resident.rt || '02'} / RW {resident.rw || '07'})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
            <span className="text-[10px] text-[var(--color-text-secondary)] block">Tipe Iuran</span>
            <span className="font-semibold text-[var(--color-text-primary)] capitalize">
              {resident.tipe_iuran === 'bulanan' ? 'Iuran Bulanan' : 'Jimpitan Harian'}
            </span>
          </div>

          <div className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
            <span className="text-[10px] text-[var(--color-text-secondary)] block">Status Iuran</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {resident.tipe_iuran === 'bulanan'
                ? resident.status_bulanan === 'lunas'
                  ? 'Lunas'
                  : 'Belum Lunas'
                : 'Kaleng Ronda'}
            </span>
          </div>
        </div>

        {resident.tipe_iuran === 'bulanan' && (
          <div className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
            <span className="text-[10px] text-[var(--color-text-secondary)] block">Nominal Bulanan</span>
            <span className="font-mono font-bold text-[var(--color-primary)]">
              {formatRupiah(resident.nominal_bulanan || 20000)} / bulan
            </span>
          </div>
        )}

        {resident.noHp && (
          <div className="p-2.5 border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-surface)]">
            <span className="text-[10px] text-[var(--color-text-secondary)] block">Kontak WhatsApp</span>
            <span className="font-mono font-medium text-[var(--color-text-primary)]">{resident.noHp}</span>
          </div>
        )}

        {resident.catatan && (
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-[var(--radius-sm)]">
            <span className="text-[10px] text-amber-800 font-bold block">Catatan Khusus</span>
            <span className="text-amber-900">{resident.catatan}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--color-surface-subtle)] hover:bg-slate-200 text-[var(--color-text-primary)] transition-colors cursor-pointer border border-[var(--color-border)]"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
