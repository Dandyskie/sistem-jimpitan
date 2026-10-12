import React from 'react';
import { Resident, JimpitanRecord } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Layers } from 'lucide-react';

interface KasPerBlokGridProps {
  residents: Resident[];
  todayRecords: JimpitanRecord[];
}

interface BlokStat {
  blokName: string;
  totalHouses: number;
  paidHouses: number;
  totalNominal: number;
  percent: number;
}

const BLOK_LIST = ['Blok A', 'Blok B', 'Blok C', 'Blok D'];

/**
 * Komponen 2x2 Grid Kas Per Blok sesuai baris tengah OripioFin (dash-reference1.webp)
 */
export const KasPerBlokGrid: React.FC<KasPerBlokGridProps> = ({
  residents,
  todayRecords,
}) => {
  const stats: BlokStat[] = BLOK_LIST.map((blok) => {
    const blokResidents = residents.filter(
      (r) => r.blok === blok && r.status === 'aktif'
    );
    const totalHouses = blokResidents.length;

    const blokRecords = todayRecords.filter((rec) => {
      const matchResident = blokResidents.some(
        (res) => res.id === rec.residentId || res.nama === rec.residentName
      );
      return matchResident || rec.blok === blok;
    });

    const paidHouses = blokRecords.filter(
      (r) => r.status === 'lunas' || r.nominal > 0
    ).length;
    const totalNominal = blokRecords.reduce((sum, r) => sum + r.nominal, 0);
    const percent = totalHouses > 0 ? Math.round((paidHouses / totalHouses) * 100) : 0;

    return {
      blokName: blok,
      totalHouses,
      paidHouses,
      totalNominal,
      percent,
    };
  });

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Kas Ronda Per Blok
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Capaian tarikan jimpitan malam ini per wilayah RT
            </p>
          </div>
        </div>
      </div>

      {/* 2x2 Grid Mini Cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const isComplete = item.percent >= 80;
          return (
            <div
              key={item.blokName}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {item.blokName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.percent}%
                </span>
              </div>

              <div className="text-base font-extrabold text-slate-900 tabular-nums font-mono">
                {formatRupiah(item.totalNominal)}
              </div>

              {/* Progress bar mini */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-emerald-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 mt-1.5 font-medium">
                {item.paidHouses} dari {item.totalHouses} rumah
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KasPerBlokGrid;
