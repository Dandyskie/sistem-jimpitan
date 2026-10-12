import React from 'react';
import { Check, X, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Resident, JimpitanRecord } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QuickTapHouseListProps {
  residents: Resident[];
  recordMap: Map<string, JimpitanRecord>;
  selectedBlock: string;
  onSelectBlock: (block: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyDailyTarget: boolean;
  onToggleDailyTarget: () => void;
  onQuickTap: (resident: Resident, status: 'lunas' | 'kosong', amount?: number) => void;
  onOpenCustomModal: (resident: Resident) => void;
}

const AVAILABLE_BLOCKS = ['semua', 'Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

/**
 * Komponen daftar rumah warga untuk petugas ronda mobile
 * Disesuaikan dengan desain mobile-reference1.webp: squircle cards, soft shadows, dan aksen BDA
 */
export const QuickTapHouseList: React.FC<QuickTapHouseListProps> = ({
  residents,
  recordMap,
  selectedBlock,
  onSelectBlock,
  searchQuery,
  onSearchChange,
  onlyDailyTarget,
  onToggleDailyTarget,
  onQuickTap,
  onOpenCustomModal,
}) => {
  return (
    <div className="space-y-3.5">
      {/* Kolom pencarian dengan rounded modern */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama warga, no. rumah, atau blok..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs transition-all"
        />
      </div>

      {/* Filter kategori blok (Horizontal pill buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {AVAILABLE_BLOCKS.map((blk) => {
          const isSelected = selectedBlock === blk;
          return (
            <button
              key={blk}
              type="button"
              onClick={() => onSelectBlock(blk)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {blk === 'semua' ? 'Semua Blok' : blk}
            </button>
          );
        })}
      </div>

      {/* Switch toggle hanya target harian */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 text-xs shadow-xs">
        <span className="font-semibold text-slate-700">
          Target Harian Saja (Sembunyikan Warga Bulanan)
        </span>
        <button
          type="button"
          onClick={onToggleDailyTarget}
          aria-label="Toggle target harian"
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            onlyDailyTarget ? 'bg-red-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
              onlyDailyTarget ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Daftar kartu rumah warga */}
      <div className="space-y-2.5">
        {residents.length === 0 ? (
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-8 text-center text-slate-400 text-xs shadow-xs">
            Tidak ada rumah warga yang cocok dengan kriteria pencarian ini.
          </div>
        ) : (
          residents.map((res) => {
            const rec = recordMap.get(res.id);
            const isPrepaidMonthly = res.tipe_iuran === 'bulanan' && res.status_bulanan === 'lunas';
            const isLunas = rec?.status === 'lunas' || (rec?.nominal || 0) > 0;
            const isKosong = rec?.status === 'kosong';

            return (
              <div
                key={res.id}
                className={`rounded-[22px] border p-3 sm:p-3.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 ${
                  isPrepaidMonthly
                    ? 'bg-teal-50/50 border-teal-200/80'
                    : isLunas
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isKosong
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Bagian identitas rumah & avatar squircle */}
                <button
                  type="button"
                  onClick={() => onOpenCustomModal(res)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0 cursor-pointer group"
                >
                  {/* Badge squircle nomor rumah */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                      {res.blok ? res.blok.replace('Blok ', '') : ''}
                    </span>
                    <span className="text-xs font-black text-slate-800 leading-tight mt-0.5">
                      {res.noRumah}
                    </span>
                  </div>

                  {/* Detail nama warga dan status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors truncate">
                        {res.nama}
                      </span>

                      {isPrepaidMonthly && (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200">
                          Bulanan
                        </span>
                      )}
                      {isLunas && !isPrepaidMonthly && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          {formatRupiah(rec?.nominal || 2000)}
                        </span>
                      )}
                      {isKosong && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                          Kosong
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <span className="truncate">
                        {rec?.catatan || res.catatan || 'Ketuk untuk atur nominal'}
                      </span>
                      <ChevronDown className="w-3 h-3 shrink-0 text-slate-400" />
                    </div>
                  </div>
                </button>

                {/* Tombol aksi cepat satu jempol */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isPrepaidMonthly ? (
                    <div className="h-12 px-3 flex items-center justify-center text-teal-800 text-xs font-semibold bg-teal-100/70 rounded-xl border border-teal-200">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-teal-700" />
                      <span>Bebas</span>
                    </div>
                  ) : (
                    <>
                      {/* Tombol Lunas Rp 2.000 */}
                      <button
                        type="button"
                        onClick={() => onQuickTap(res, 'lunas', 2000)}
                        className={`h-12 min-w-[58px] px-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer shadow-xs ${
                          isLunas
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="Tandai Lunas Rp 2.000"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-[10px] font-mono leading-none">2.000</span>
                      </button>

                      {/* Tombol Kaleng Kosong */}
                      <button
                        type="button"
                        onClick={() => onQuickTap(res, 'kosong', 0)}
                        className={`h-12 w-12 rounded-xl text-xs font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer border ${
                          isKosong
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Tandai Kaleng Kosong"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuickTapHouseList;
