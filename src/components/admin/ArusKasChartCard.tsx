import React, { useState } from 'react';
import { CashTransaction } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

interface ArusKasChartCardProps {
  cashTransactions: CashTransaction[];
}

interface DayData {
  dayName: string;
  pemasukan: number;
  pengeluaran: number;
}

const DUMMY_DAYS: DayData[] = [
  { dayName: 'Sen', pemasukan: 140000, pengeluaran: 25000 },
  { dayName: 'Sel', pemasukan: 136000, pengeluaran: 0 },
  { dayName: 'Rab', pemasukan: 142000, pengeluaran: 50000 },
  { dayName: 'Kam', pemasukan: 138000, pengeluaran: 0 },
  { dayName: 'Jum', pemasukan: 145000, pengeluaran: 80000 },
  { dayName: 'Sab', pemasukan: 152000, pengeluaran: 120000 },
  { dayName: 'Min', pemasukan: 148000, pengeluaran: 15000 },
];

/**
 * Kartu visual grafik arus kas mingguan bergaya OripioFin (dash-reference1.webp)
 */
export const ArusKasChartCard: React.FC<ArusKasChartCardProps> = ({
  cashTransactions: _cashTransactions,
}) => {
  const [filterMode, setFilterMode] = useState<'mingguan' | 'bulanan'>('mingguan');

  const maxVal = Math.max(...DUMMY_DAYS.map((d) => Math.max(d.pemasukan, d.pengeluaran)), 160000);

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Arus Kas Masuk & Keluar
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Statistik perputaran dana lingkungan
            </p>
          </div>
        </div>

        {/* Tab switch Mingguan / Bulanan */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilterMode('mingguan')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'mingguan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Mingguan
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('bulanan')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'bulanan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Bar Chart Bars */}
      <div className="h-44 flex items-end justify-between gap-2 pt-6 px-1">
        {DUMMY_DAYS.map((item) => {
          const heightMasuk = Math.round((item.pemasukan / maxVal) * 120);
          const heightKeluar = Math.round((item.pengeluaran / maxVal) * 120);

          return (
            <div key={item.dayName} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex items-end justify-center gap-1.5 h-32">
                {/* Bar Pemasukan (Merah BDA) */}
                <div
                  className="w-3 sm:w-4 bg-gradient-to-t from-red-600 to-rose-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-xs"
                  style={{ height: `${Math.max(8, heightMasuk)}px` }}
                  title={`Pemasukan: ${formatRupiah(item.pemasukan)}`}
                />
                {/* Bar Pengeluaran (Slate / Dark) */}
                <div
                  className="w-3 sm:w-4 bg-slate-300 rounded-t-lg transition-all duration-300 group-hover:bg-slate-400"
                  style={{ height: `${Math.max(4, heightKeluar)}px` }}
                  title={`Pengeluaran: ${formatRupiah(item.pengeluaran)}`}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                {item.dayName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend Chart */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Pemasukan Jimpitan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span>Pengeluaran Operasional</span>
        </div>
      </div>
    </div>
  );
};

export default ArusKasChartCard;
