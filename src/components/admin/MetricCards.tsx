import React from 'react';
import { Wallet, Coins, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface MetricCardsProps {
  currentBalance: number;
  todayJimpitanAmount: number;
  paidCount: number;
  totalIncome: number;
  totalExpense: number;
  monthlyLunasCount: number;
  onNavigateToKeuangan?: () => void;
  onNavigateToVerifikasi?: () => void;
}

/**
 * 4 Kartu Metrik Utama di Dashboard Bendahara
 * Mengadopsi visual OripioFin (dash-reference1.webp):
 * Card 1 Hero Card gradien merah BDA, didampingi 3 kartu putih bersih squircle modern
 */
export const MetricCards: React.FC<MetricCardsProps> = ({
  currentBalance,
  todayJimpitanAmount,
  paidCount,
  totalIncome,
  totalExpense,
  monthlyLunasCount,
  onNavigateToKeuangan,
  onNavigateToVerifikasi,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Hero Card: Saldo Kas RT Saat Ini (Gradien Merah BDA Khas Logo) */}
      <div
        onClick={onNavigateToKeuangan}
        role={onNavigateToKeuangan ? 'button' : undefined}
        tabIndex={onNavigateToKeuangan ? 0 : undefined}
        className="bg-gradient-to-br from-red-600 via-rose-700 to-red-950 text-white rounded-[24px] p-5 sm:p-6 shadow-xl shadow-red-950/15 flex flex-col justify-between cursor-pointer hover:shadow-2xl transition-all active:scale-[0.99] group relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-100/90">
              Total Saldo Kas RT
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-black font-mono tracking-tight tabular-nums text-white">
              {formatRupiah(currentBalance)}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/25">
              <span>Buku Kas Aktif</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-rose-100 group-hover:text-white transition-colors">
          <span>Lihat buku kas</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. Jimpitan Malam Ini */}
      <div
        onClick={onNavigateToVerifikasi}
        role={onNavigateToVerifikasi ? 'button' : undefined}
        tabIndex={onNavigateToVerifikasi ? 0 : undefined}
        className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Jimpitan Malam Ini
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight tabular-nums text-slate-900">
              {formatRupiah(todayJimpitanAmount)}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
              <span>{paidCount} rumah ditarik</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-red-600 transition-colors">
          <span>Verifikasi setoran</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. Pemasukan Kas Akumulatif */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pemasukan Kas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight tabular-nums text-emerald-700">
              {formatRupiah(totalIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {monthlyLunasCount} KK iuran bulanan lunas
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Pemasukan akumulatif</span>
        </div>
      </div>

      {/* 4. Pengeluaran Operasional */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pengeluaran Operasional
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight tabular-nums text-slate-800">
              {formatRupiah(totalExpense)}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Kebersihan, sampah & ronda
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Pengeluaran buku kas</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
