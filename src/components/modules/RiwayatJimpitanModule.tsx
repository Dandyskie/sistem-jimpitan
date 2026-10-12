import React, { useState } from 'react';
import { JimpitanRecord, PaymentStatus } from '../../types';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { RiwayatEditModal } from './jimpitan/RiwayatEditModal';

interface RiwayatJimpitanModuleProps {
  records: JimpitanRecord[];
  onUpdateRecord: (id: string, updates: Partial<JimpitanRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

/**
 * Modul Riwayat Pencatatan Jimpitan Warga (Dashboard Bendahara).
 */
export const RiwayatJimpitanModule: React.FC<RiwayatJimpitanModuleProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [dateFilter, setDateFilter] = useState('');

  const [editingRecord, setEditingRecord] = useState<JimpitanRecord | null>(null);
  const [editNominal, setEditNominal] = useState(0);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('lunas');
  const [editCatatan, setEditCatatan] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      r.residentName.toLowerCase().includes(q) ||
      r.noRumah.includes(q) ||
      (r.blok && r.blok.toLowerCase().includes(q)) ||
      (r.petugas && r.petugas.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'semua' || r.status === statusFilter;
    const matchDate = !dateFilter || r.tanggal === dateFilter;

    return matchQuery && matchStatus && matchDate;
  });

  const totalFilteredAmount = filteredRecords.reduce((sum, r) => sum + r.nominal, 0);

  const handleOpenEdit = (rec: JimpitanRecord) => {
    setEditingRecord(rec);
    setEditNominal(rec.nominal);
    setEditStatus(rec.status);
    setEditCatatan(rec.catatan || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    onUpdateRecord(editingRecord.id, {
      nominal: editNominal,
      status: editStatus,
      catatan: editCatatan,
    });
    setEditingRecord(null);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header & Filter Toolbar */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              Riwayat Pencatatan Jimpitan
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Daftar rekapitulasi tarikan jimpitan ronda malam warga perumahan BDA
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--color-text-secondary)]">Total Terfilter:</span>
            <span className="font-bold font-mono text-[var(--color-primary)] tabular-nums">
              {formatRupiah(totalFilteredAmount)}
            </span>
            <span className="text-[var(--color-text-disabled)]">({filteredRecords.length} data)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, rumah, petugas..."
              className="w-full h-9 pl-8 pr-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            <option value="semua">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="sebagian">Sebagian</option>
            <option value="belum_bayar">Kosong / Belum Bayar</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Tabel Desktop */}
      <div className="hidden md:block bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Rumah & Warga</th>
              <th className="py-3 px-4">Tanggal & Waktu</th>
              <th className="py-3 px-4">Nominal</th>
              <th className="py-3 px-4">Petugas</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filteredRecords.map((rec) => {
              const isLunas = rec.status === 'lunas' || rec.nominal > 0;
              return (
                <tr key={rec.id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[var(--color-text-primary)]">
                      {rec.blok ? rec.blok.replace('Blok ', '') : ''}-{rec.noRumah} &middot; {rec.residentName}
                    </div>
                    {rec.catatan && <span className="text-[11px] text-[var(--color-text-secondary)]">{rec.catatan}</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[var(--color-text-primary)]">{formatTanggalSingkat(rec.tanggal)}</div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Pukul {rec.waktuInput || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${isLunas ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-disabled)]'}`}>
                      {isLunas ? formatRupiah(rec.nominal) : 'Kosong'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--color-text-secondary)] font-medium">
                    {rec.petugas || 'Petugas Ronda'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rec)}
                        className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="Koreksi Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(rec.id)}
                        className="p-1.5 text-[var(--color-text-disabled)] hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                        title="Hapus Data"
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

      {/* Kartu Mobile */}
      <div className="md:hidden space-y-2">
        {filteredRecords.map((rec) => (
          <div key={rec.id} className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3.5 shadow-xs space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-[var(--color-text-primary)]">
                  {rec.blok ? rec.blok.replace('Blok ', '') : ''}-{rec.noRumah} &middot; {rec.residentName}
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {formatTanggalSingkat(rec.tanggal)} pukul {rec.waktuInput || '-'}
                </p>
              </div>
              <span className="font-mono font-bold text-xs text-[var(--color-primary)]">
                {formatRupiah(rec.nominal)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
              <span>{rec.petugas || 'Petugas Ronda'}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(rec)}
                  className="font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Koreksi
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(rec.id)}
                  className="font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RiwayatEditModal
        editingRecord={editingRecord}
        editNominal={editNominal}
        onNominalChange={setEditNominal}
        editStatus={editStatus}
        onStatusChange={setEditStatus}
        editCatatan={editCatatan}
        onCatatanChange={setEditCatatan}
        onSave={handleSaveEdit}
        onClose={() => setEditingRecord(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteRecord(deletingId);
            setDeletingId(null);
          }
        }}
        title="Hapus Catatan Jimpitan"
        message="Apakah Anda yakin ingin menghapus catatan jimpitan ini?"
        confirmText="Hapus Catatan"
        variant="danger"
      />
    </div>
  );
};
