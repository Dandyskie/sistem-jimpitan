import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface SelesaiRondaModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCollectedToday: number;
  recordedHousesCount: number;
  settlementNominalFisik: string;
  onNominalFisikChange: (val: string) => void;
  settlementCatatan: string;
  onCatatanChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

/**
 * Modal Kunci Setoran Ronda (Serah Terima Petugas ke Bendahara)
 * Menggunakan kartu modal presisi dan aksen merah BDA
 */
export const SelesaiRondaModal: React.FC<SelesaiRondaModalProps> = ({
  isOpen,
  onClose,
  totalCollectedToday,
  recordedHousesCount,
  settlementNominalFisik,
  onNominalFisikChange,
  settlementCatatan,
  onCatatanChange,
  onSubmit,
  isSubmitting,
  isSuccess,
}) => {
  if (!isOpen) return null;

  const nominalFisik = settlementNominalFisik
    ? parseInt(settlementNominalFisik, 10) || 0
    : totalCollectedToday;
  const selisih = nominalFisik - totalCollectedToday;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-slate-200/90 space-y-4">
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-red-50 text-red-600 border border-red-200/80 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Setoran Berhasil Dikunci
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Data serah terima tersimpan di sistem dan siap diverifikasi oleh Bendahara RT.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60">
                  Rekonsiliasi Kas Ronda
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  Selesaikan Ronda & Kunci Setoran
                </h3>
                <p className="text-xs text-slate-400">
                  Total tercatat: {recordedHousesCount} rumah malam ini
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rekap Angka Sistem */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Nominal Sistem:</span>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {formatRupiah(totalCollectedToday)}
                </span>
              </div>
            </div>

            {/* Input Uang Fisik Aktual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hitungan Uang Fisik di Toples/Kaleng (Rp)
              </label>
              <input
                type="number"
                value={settlementNominalFisik}
                onChange={(e) => onNominalFisikChange(e.target.value)}
                placeholder={String(totalCollectedToday)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
              />
              <span className={`text-[11px] font-semibold mt-1.5 block ${
                selisih === 0 ? 'text-emerald-700' : 'text-amber-800'
              }`}>
                {selisih === 0
                  ? 'Status: Uang fisik pas sesuai catatan sistem'
                  : selisih > 0
                  ? `Status: Ada lebihan fisik ${formatRupiah(selisih)}`
                  : `Status: Ada kekurangan fisik ${formatRupiah(Math.abs(selisih))}`}
              </span>
            </div>

            {/* Catatan untuk Bendahara */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan untuk Bendahara (Opsional)
              </label>
              <input
                type="text"
                value={settlementCatatan}
                onChange={(e) => onCatatanChange(e.target.value)}
                placeholder="Contoh: Titipan receh / ada kaleng belum terambil"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
              />
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 active:scale-95"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengunci...' : 'Kunci & Serahkan'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelesaiRondaModal;
