import React, { useState, useEffect } from 'react';
import { DailyVerification, AuthUser } from '../../types';
import { DataService } from '../../services/dataService';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { RefreshCw, Clock } from 'lucide-react';
import { VerificationReconciliationCard } from './verifikasi/VerificationReconciliationCard';

interface VerificationCenterModuleProps {
  currentUser: AuthUser;
  todayDate: string;
  onRefreshData?: () => void;
  onAddToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

/** Ambil status verifikasi harian dari DataService */
async function fetchDailyVerificationState(date: string): Promise<DailyVerification | null> {
  try {
    return await DataService.getDailyVerification(date);
  } catch (err) {
    console.warn('Gagal memuat verifikasi harian:', err);
    return null;
  }
}

/**
 * Modul Verification Center di Dashboard Bendahara.
 * Memfasilitasi serah terima dan pencocokan uang fisik dengan data sistem.
 */
export const VerificationCenterModule: React.FC<VerificationCenterModuleProps> = ({
  currentUser,
  todayDate,
  onRefreshData,
  onAddToast,
}) => {
  const [activeVerification, setActiveVerification] = useState<DailyVerification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actualFisikInput, setActualFisikInput] = useState<string>('');
  const [catatanInput, setCatatanInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    fetchDailyVerificationState(todayDate).then((verif) => {
      setActiveVerification(verif);
      const nominal = verif ? (verif.actual_nominal_fisik ?? verif.total_nominal_sistem) : '';
      setActualFisikInput(nominal ? String(nominal) : '');
      setCatatanInput(verif?.catatan_selisih || '');
      setIsLoading(false);
    });
  }, [todayDate]);

  useEffect(() => {
    let isMounted = true;
    fetchDailyVerificationState(todayDate).then((verif) => {
      if (!isMounted) return;
      setActiveVerification(verif);
      const nominal = verif ? (verif.actual_nominal_fisik ?? verif.total_nominal_sistem) : '';
      setActualFisikInput(nominal ? String(nominal) : '');
      setCatatanInput(verif?.catatan_selisih || '');
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [todayDate]);

  const handleVerify = async (status: 'verified' | 'flagged') => {
    if (!activeVerification) return;
    setIsProcessing(true);

    const nominalSistem = activeVerification.total_nominal_sistem || 0;
    const nominalFisik = actualFisikInput ? parseInt(actualFisikInput, 10) || 0 : nominalSistem;
    const selisih = nominalFisik - nominalSistem;

    try {
      await DataService.verifySettlement(
        activeVerification.id,
        nominalFisik,
        status,
        catatanInput,
        currentUser.id,
        activeVerification.tanggal,
        activeVerification.petugas_nama || 'Petugas Ronda'
      );

      if (status === 'verified') {
        onAddToast?.(
          `Setoran ${formatRupiah(nominalFisik)} berhasil diverifikasi & otomatis masuk ke Buku Kas RT!`,
          'success'
        );
      } else {
        onAddToast?.(
          `Setoran ditandai memiliki selisih (${formatRupiah(selisih)}). Catatan tersimpan.`,
          'info'
        );
      }

      const updatedVerif = await fetchDailyVerificationState(todayDate);
      setActiveVerification(updatedVerif);
      onRefreshData?.();
    } catch (err) {
      console.error('Gagal verifikasi:', err);
      onAddToast?.('Terjadi kesalahan saat memproses verifikasi.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Modul */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Rekonsiliasi Kas
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight mt-1.5">
            Verification Center (Serah Terima Setoran Ronda)
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Pusat pencocokan uang fisik dengan catatan digital petugas siskamling malam
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-9 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-12 text-center text-xs text-[var(--color-text-secondary)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
          Memeriksa data serah terima setoran malam...
        </div>
      ) : !activeVerification ? (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-10 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] flex items-center justify-center mx-auto border border-[var(--color-border)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Belum Ada Setoran Dikunci untuk {formatTanggalSingkat(todayDate)}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto mt-1">
              Petugas ronda belum menekan tombol <strong>Kunci Setoran</strong> di aplikasinya. Setelah putaran ronda selesai dan setoran dikunci, modul rekonsiliasi ini akan aktif otomatis.
            </p>
          </div>
        </div>
      ) : (
        <VerificationReconciliationCard
          activeVerification={activeVerification}
          actualFisikInput={actualFisikInput}
          onActualFisikChange={setActualFisikInput}
          catatanInput={catatanInput}
          onCatatanChange={setCatatanInput}
          onVerify={handleVerify}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};
