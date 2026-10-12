import React from 'react';
import { DailyVerification } from '../../../types';
import { formatRupiah, formatTanggalSingkat } from '../../../utils/formatters';
import { CheckCircle2, AlertTriangle, FileCheck2, Check, AlertCircle } from 'lucide-react';

interface VerificationReconciliationCardProps {
  activeVerification: DailyVerification;
  actualFisikInput: string;
  onActualFisikChange: (val: string) => void;
  catatanInput: string;
  onCatatanChange: (val: string) => void;
  onVerify: (status: 'verified' | 'flagged') => void;
  isProcessing: boolean;
}

/**
 * Kartu Rekonsiliasi & Komparasi Serah Terima Kas (Digital vs Fisik).
 */
export const VerificationReconciliationCard: React.FC<VerificationReconciliationCardProps> = ({
  activeVerification,
  actualFisikInput,
  onActualFisikChange,
  catatanInput,
  onCatatanChange,
  onVerify,
  isProcessing,
}) => {
  const nominalSistem = activeVerification.total_nominal_sistem || 0;
  const nominalFisik = actualFisikInput ? parseInt(actualFisikInput, 10) || 0 : nominalSistem;
  const selisih = nominalFisik - nominalSistem;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-border)] gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
              activeVerification.status === 'verified'
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : activeVerification.status === 'flagged'
                ? 'bg-[var(--color-danger-bg)] text-rose-800'
                : 'bg-[var(--color-warning-bg)] text-amber-800'
            }`}
          >
            {activeVerification.status === 'verified' ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            ) : activeVerification.status === 'flagged' ? (
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            ) : (
              <FileCheck2 className="w-6 h-6 stroke-[2]" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Status Serah Terima
            </span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {activeVerification.status === 'verified'
                ? 'Setoran Telah Terverifikasi & Masuk Buku Kas'
                : activeVerification.status === 'flagged'
                ? 'Setoran Ditandai Ada Selisih'
                : 'Menunggu Verifikasi & Penghitungan Fisik'}
            </h3>
          </div>
        </div>

        <div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${
              activeVerification.status === 'verified'
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-emerald-300'
                : activeVerification.status === 'flagged'
                ? 'bg-[var(--color-danger-bg)] text-rose-900 border border-rose-300'
                : 'bg-[var(--color-warning-bg)] text-amber-900 border border-amber-300'
            }`}
          >
            {activeVerification.status === 'verified'
              ? 'TERVERIFIKASI ✓'
              : activeVerification.status === 'flagged'
              ? 'ADA SELISIH'
              : 'MENUNGGU VERIFIKASI'}
          </span>
        </div>
      </div>

      {/* Komparasi Sisi ke Sisi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Catatan Digital Sistem */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-1">
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
            Catatan Digital Sistem
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-text-primary)] tabular-nums">
            {formatRupiah(nominalSistem)}
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] block">
            {activeVerification.total_rumah_tercatat} rumah terkumpul
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] block pt-1 border-t border-[var(--color-border)] mt-2">
            Petugas: <strong>{activeVerification.petugas_nama || 'Petugas'}</strong>
          </span>
        </div>

        {/* Uang Fisik Aktual */}
        <div className="p-4 rounded-[var(--radius-md)] bg-emerald-50/60 border border-emerald-200 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
            Uang Fisik Dihitung (Toples)
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-primary)] tabular-nums">
            {formatRupiah(nominalFisik)}
          </div>
          <span className="text-[11px] text-emerald-700 block">
            Koin & uang kertas dihitung bersama
          </span>
          <span className="text-[10px] text-emerald-600 block pt-1 border-t border-emerald-200 mt-2">
            Dihitung pada: {formatTanggalSingkat(activeVerification.tanggal)}
          </span>
        </div>

        {/* Selisih */}
        <div
          className={`p-4 rounded-[var(--radius-md)] border space-y-1 ${
            selisih === 0
              ? 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]'
              : selisih > 0
              ? 'bg-blue-50/60 border-blue-200'
              : 'bg-rose-50/60 border-rose-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
            Hasil Rekonsiliasi (Selisih)
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
              selisih === 0
                ? 'text-[var(--color-primary)]'
                : selisih > 0
                ? 'text-blue-700'
                : 'text-rose-700'
            }`}
          >
            {selisih === 0 ? 'Cocok (Rp 0)' : `${selisih > 0 ? '+' : ''}${formatRupiah(selisih)}`}
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] block">
            {selisih === 0 ? 'Fisik pas dengan sistem' : selisih > 0 ? 'Ada lebihan fisik' : 'Ada kekurangan fisik'}
          </span>
        </div>
      </div>

      {/* Form Input Uang Fisik & Verifikasi */}
      {activeVerification.status === 'pending' && (
        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Input Jumlah Uang Fisik yang Diterima Bendahara (Rp)
            </label>
            <input
              type="number"
              value={actualFisikInput}
              onChange={(e) => onActualFisikChange(e.target.value)}
              placeholder="0"
              className="w-full h-11 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">
              Catatan Rekonsiliasi (Wajib diisi jika ada selisih)
            </label>
            <input
              type="text"
              value={catatanInput}
              onChange={(e) => onCatatanChange(e.target.value)}
              placeholder="Contoh: Selisih Rp 1.000 karena ada koin rusak/tidak terbaca"
              className="w-full h-10 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => onVerify('verified')}
              disabled={isProcessing}
              className="flex-1 h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Cocok & Verifikasi (Otomatis Masuk Buku Kas)</span>
            </button>

            {selisih !== 0 && (
              <button
                type="button"
                onClick={() => onVerify('flagged')}
                disabled={isProcessing}
                className="h-11 px-5 rounded-[var(--radius-sm)] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Tandai Selisih</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
