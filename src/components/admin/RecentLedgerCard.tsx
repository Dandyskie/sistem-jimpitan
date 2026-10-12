import React from 'react';
import { ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CashTransaction } from '../../types';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';

interface RecentLedgerCardProps {
  cashTransactions: CashTransaction[];
  onNavigateToKeuangan: () => void;
}

/**
 * Kartu Buku Kas Terkini di Dashboard Bendahara
 * Mengadopsi visual tabel OripioFin dengan indikator mutasi masuk/keluar yang jelas
 */
export const RecentLedgerCard: React.FC<RecentLedgerCardProps> = ({
  cashTransactions,
  onNavigateToKeuangan,
}) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Mutasi Kas Terkini
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transaksi kas masuk & keluar terakhir
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToKeuangan}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {cashTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3">
            Belum ada transaksi kas yang dicatat.
          </p>
        ) : (
          cashTransactions.slice(0, 4).map((tx) => {
            const isPemasukan = tx.tipe === 'pemasukan';
            return (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between text-xs gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isPemasukan
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}
                  >
                    {isPemasukan ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {tx.deskripsi}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatTanggalSingkat(tx.tanggal)} &middot; {tx.penanggungJawab || tx.penanggung_jawab}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-mono font-bold tabular-nums shrink-0 ${
                    isPemasukan ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isPemasukan ? '+' : '-'} {formatRupiah(tx.nominal)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentLedgerCard;
