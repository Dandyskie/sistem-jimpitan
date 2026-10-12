import React from 'react';
import { Share2, CheckCircle2, ShieldCheck, MapPin, Lock } from 'lucide-react';
import { Resident } from '../../types';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { FullscreenButton } from '../common/FullscreenButton';

interface PortalWargaHeaderProps {
  resident: Resident;
  totalNominalMonth: number;
  paidDaysCount: number;
  lastPaymentDate?: string;
  onShareLink: () => void;
}

/**
 * Header Identitas Rumah & Ringkasan Kontribusi Jimpitan Warga (Privasi Terjaga).
 * JIMPITANKU by Perum BDA (Perumahan Bumi Dukuh Asri).
 */
export const PortalWargaHeader: React.FC<PortalWargaHeaderProps> = ({
  resident,
  totalNominalMonth,
  paidDaysCount,
  lastPaymentDate,
  onShareLink,
}) => {
  const isBulanan = resident.tipe_iuran === 'bulanan';
  const isBulananLunas = isBulanan && resident.status_bulanan === 'lunas';

  return (
    <div className="space-y-4">
      {/* Top Banner & Identitas Rumah */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>JIMPITANKU by Perum BDA</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] leading-tight pt-1">
              {resident.nama}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {resident.blok} No. {resident.noRumah} — Perumahan Bumi Dukuh Asri
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tombol Fullscreen khusus mobile */}
            <FullscreenButton />

            <button
              type="button"
              onClick={onShareLink}
              title="Salin Tautan Halaman Rumah Ini"
              className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Iuran Rumah & Perlindungan Privasi */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {isBulanan ? (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                isBulananLunas
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isBulananLunas
                  ? 'Iuran Bulanan (Lunas Rp 20.000)'
                  : 'Iuran Bulanan (Menunggu Pembayaran)'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jimpitan Harian Aktif (Rp 2.000 / Malam Ronda)</span>
            </div>
          )}

          {/* Indikator Privasi: Warga hanya bisa melihat rumah miliknya dari QR ini */}
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Privasi Rumah Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Tiga Kartu Metrik Ringkasan Kontribusi */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 sm:p-4 text-center shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Bulan Ini
          </span>
          <span className="text-sm sm:text-lg font-black text-emerald-700 tabular-nums block mt-1">
            {formatRupiah(totalNominalMonth)}
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 sm:p-4 text-center shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Frekuensi
          </span>
          <span className="text-sm sm:text-lg font-black text-slate-800 tabular-nums block mt-1">
            {paidDaysCount} Malam
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 sm:p-4 text-center shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
            Terakhir
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 block mt-1.5 truncate">
            {lastPaymentDate ? formatTanggalSingkat(lastPaymentDate) : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
