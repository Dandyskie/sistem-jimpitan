import React from 'react';
import { JimpitanRecord } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface PetugasRiwayatTabProps {
  todayRecords: JimpitanRecord[];
}

/**
 * Tab riwayat tarikan jimpitan petugas ronda malam
 * Menggunakan kartu squircle modern dan tipografi finansial yang bersih
 */
export const PetugasRiwayatTab: React.FC<PetugasRiwayatTabProps> = ({ todayRecords }) => {
  if (todayRecords.length === 0) {
    return (
      <div className="bg-white rounded-[22px] border border-slate-200/90 p-8 text-center text-slate-400 text-xs shadow-xs">
        Belum ada tarikan jimpitan yang dicatat malam ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Entri Tarikan Malam Ini ({todayRecords.length} Rumah)
        </h2>
      </div>

      <div className="space-y-2">
        {todayRecords.map((rec) => {
          const isLunas = rec.status === 'lunas' || rec.nominal > 0;
          return (
            <div
              key={rec.id}
              className="bg-white rounded-[20px] border border-slate-200/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                    {rec.blok ? rec.blok.replace('Blok ', '') : ''}
                  </span>
                  <span className="text-xs font-black text-slate-800 leading-tight">
                    {rec.noRumah}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {rec.residentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Pukul {rec.waktuInput || '-'}</span>
                    {rec.catatan && <span>&middot; {rec.catatan}</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono font-bold text-xs ${
                    isLunas ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  {isLunas ? formatRupiah(rec.nominal) : 'Kosong'}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {rec.status === 'lunas' ? 'Lunas' : 'Tidak Ditarik'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PetugasRiwayatTab;
