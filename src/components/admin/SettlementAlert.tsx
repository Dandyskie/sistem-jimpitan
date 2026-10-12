import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { DailyVerification } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface SettlementAlertProps {
  pendingVerif: DailyVerification | null;
  onNavigateToVerifikasi: () => void;
}

/**
 * Notifikasi Rekonsiliasi Kas (iOS & Fintech themed banner)
 * Menampilkan pengingat jika ada setoran ronda malam yang belum diverifikasi bendahara
 */
export const SettlementAlert: React.FC<SettlementAlertProps> = ({
  pendingVerif,
  onNavigateToVerifikasi,
}) => {
  if (!pendingVerif || pendingVerif.status !== 'pending') {
    return null;
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-[22px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Setoran Ronda Menunggu Verifikasi
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            {pendingVerif.petugas_nama || 'Petugas'} menyetor {formatRupiah(pendingVerif.total_nominal_sistem)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingVerif.total_rumah_tercatat} rumah terkumpul. Silakan cocokkan dengan uang fisik toples/kaleng.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNavigateToVerifikasi}
        className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 inline-flex items-center gap-1.5 self-start sm:self-center"
      >
        <span>Buka Verifikasi</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SettlementAlert;
