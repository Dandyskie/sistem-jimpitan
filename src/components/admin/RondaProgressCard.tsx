import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { JimpitanRecord } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface RondaProgressCardProps {
  paidCount: number;
  totalHouses: number;
  progressPercent: number;
  todayRecords: JimpitanRecord[];
  onNavigateToVerifikasi: () => void;
}

/**
 * Kartu Progres Ronda Malam Ini di Dashboard Bendahara
 * Bergaya OripioFin dengan status progress bar dan entri mutasi terkini
 */
export const RondaProgressCard: React.FC<RondaProgressCardProps> = ({
  paidCount,
  totalHouses,
  progressPercent,
  todayRecords,
  onNavigateToVerifikasi,
}) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Progres Ronda Malam Ini
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {paidCount} dari {totalHouses} rumah terkumpul ({progressPercent}%)
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToVerifikasi}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Verifikasi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar OripioFin */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
        <div
          className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Catatan Terakhir Petugas Lapangan
        </span>
        {todayRecords.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            Belum ada tarikan yang dicatat malam ini.
          </p>
        ) : (
          todayRecords.slice(0, 4).map((rec) => {
            const isKosong = rec.status === 'kosong' || rec.nominal === 0;
            return (
              <div
                key={rec.id}
                className="flex justify-between items-center text-xs py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isKosong ? 'text-slate-300' : 'text-red-600'
                    }`}
                  />
                  <span className="font-semibold text-slate-800">
                    {rec.residentName} ({rec.blok ? rec.blok.replace('Blok ', '') : ''}-{rec.noRumah})
                  </span>
                </div>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isKosong ? 'text-slate-400' : 'text-red-600'
                  }`}
                >
                  {isKosong ? 'Kosong' : `+ ${formatRupiah(rec.nominal)}`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RondaProgressCard;
