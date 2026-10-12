import React from 'react';
import { Resident } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { Edit2, Trash2, Eye, CheckCircle2, RefreshCw } from 'lucide-react';

interface WargaTableProps {
  residents: Resident[];
  isProcessingId: string | null;
  onToggleBulanan: (res: Resident) => void;
  onView: (res: Resident) => void;
  onEdit: (res: Resident) => void;
  onDelete: (id: string) => void;
}

/**
 * Tabel Data Warga RT 02 / RW 07.
 * Menampilkan daftar KK dengan status iuran bulanan dan tombol aksi cepat.
 */
export const WargaTable: React.FC<WargaTableProps> = ({
  residents,
  isProcessingId,
  onToggleBulanan,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Rumah & Nama</th>
              <th className="py-3 px-4">Tipe Iuran</th>
              <th className="py-3 px-4">Status Bulan Ini</th>
              <th className="py-3 px-4">Aksi Pembayaran</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {residents.map((res) => {
              const isBulanan = res.tipe_iuran === 'bulanan';
              const isLunas = res.status_bulanan === 'lunas';

              return (
                <tr key={res.id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {res.blok ? res.blok.replace('Blok ', '') : ''}-{res.noRumah} &middot; {res.nama}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      {res.noHp || 'Tanpa no. HP'} {res.catatan && `· ${res.catatan}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isBulanan
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isBulanan ? 'Bulanan' : 'Harian'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {isBulanan ? (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isLunas
                            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-emerald-200'
                            : 'bg-[var(--color-warning-bg)] text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isLunas ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-secondary)] text-[11px]">Tarikan Kaleng Ronda</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {isBulanan ? (
                      <button
                        type="button"
                        onClick={() => onToggleBulanan(res)}
                        disabled={isProcessingId === res.id}
                        className={`h-7 px-2.5 rounded-[var(--radius-sm)] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          isLunas
                            ? 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'
                            : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs'
                        }`}
                      >
                        {isProcessingId === res.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : isLunas ? (
                          <span>Tandai Belum</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Bayar {formatRupiah(res.nominal_bulanan || 20000)}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-secondary)]">Rp 2.000 / malam</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(res)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="Lihat Detail Warga"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(res)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="Edit Data Warga"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(res.id)}
                        className="p-1.5 text-[var(--color-text-disabled)] hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="Hapus Warga"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
