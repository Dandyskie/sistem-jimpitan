import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Info, Calendar } from 'lucide-react';
import { JimpitanRecord, PaymentStatus } from '../../types';
import { formatRupiah, formatTanggalLengkap } from '../../utils/formatters';

interface PortalWargaHistoryProps {
  records: JimpitanRecord[];
  isBulanan?: boolean;
}

/**
 * Render chip penanda status tarikan jimpitan harian warga.
 */
function renderStatusBadge(status: PaymentStatus) {
  if (status === 'lunas') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
        <CheckCircle2 className="w-3 h-3" />
        <span>Tercatat</span>
      </span>
    );
  }

  if (status === 'kosong') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
        <XCircle className="w-3 h-3" />
        <span>Kosong</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
      <span>Sebagian</span>
    </span>
  );
}

/**
 * Komponen Daftar Riwayat Tarikan Jimpitan Rumah Warga.
 */
export const PortalWargaHistory: React.FC<PortalWargaHistoryProps> = ({
  records,
  isBulanan,
}) => {
  const [filterStatus, setFilterStatus] = useState<'semua' | 'lunas' | 'kosong'>('semua');

  const filteredRecords = records.filter((r) => {
    if (filterStatus === 'semua') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-xs space-y-4">
      {/* Header Bagian & Filter Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
            Catatan Tarikan Ronda
          </h2>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterStatus('semua')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'semua'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('lunas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'lunas'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tercatat
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('kosong')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'kosong'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kosong
          </button>
        </div>
      </div>

      {/* Catatan Khusus Warga Iuran Bulanan */}
      {isBulanan && (
        <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl flex items-start gap-2.5 text-xs text-teal-900">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Rumah Terdaftar Skema Iuran Bulanan</p>
            <p className="text-[11px] text-teal-800 mt-0.5">
              Tarikan harian tidak ditarik di kaleng ronda karena pembayaran dilakukan langsung ke
              Bendahara RT sebesar Rp 20.000 / bulan.
            </p>
          </div>
        </div>
      )}

      {/* List Catatan Tarikan Jimpitan */}
      {filteredRecords.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-medium text-slate-500">
            Belum ada catatan tarikan untuk periode ini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">
                  {formatTanggalLengkap(item.tanggal)}
                </span>
                <span className="text-[11px] text-slate-500">
                  {item.waktuInput ? `Pukul ${item.waktuInput} WIB` : 'Malam Ronda'}
                  {item.petugas ? ` • Petugas: ${item.petugas}` : ''}
                </span>
                {item.catatan && (
                  <span className="text-[11px] text-slate-600 italic block mt-0.5">
                    Catatan: &ldquo;{item.catatan}&rdquo;
                  </span>
                )}
              </div>

              <div className="text-right space-y-1 shrink-0">
                <span className="font-bold text-slate-900 tabular-nums block">
                  {item.status === 'lunas' ? formatRupiah(item.nominal) : 'Rp 0'}
                </span>
                {renderStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edukasi Transparansi Alokasi Kas RT */}
      <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Uang jimpitan yang terkumpul disetorkan petugas ronda setiap malam ke Bendahara RT 02 untuk
          membiayai keamanan lingkungan, operasional siskamling, dan santunan sosial warga.
        </p>
      </div>
    </div>
  );
};
