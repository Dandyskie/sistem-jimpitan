import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Resident } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QRSuccessStepViewProps {
  lastSavedInfo: {
    resident: Resident;
    nominal: number;
    time: string;
    petugas: string;
  } | null;
  onScanNext: () => void;
  onFinish: () => void;
}

/**
 * Tampilan konfirmasi sukses pencatatan tarikan QR jimpitan
 */
export const QRSuccessStepView: React.FC<QRSuccessStepViewProps> = ({
  lastSavedInfo,
  onScanNext,
  onFinish,
}) => {
  if (!lastSavedInfo) return null;

  return (
    <div className="py-4 text-center space-y-4">
      <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-200/80 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-7 h-7 stroke-[2.5]" />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">
          Tarikan Berhasil Dicatat
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {lastSavedInfo.resident.nama} ({lastSavedInfo.resident.blok} No. {lastSavedInfo.resident.noRumah})
        </p>
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl max-w-xs mx-auto text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Nominal:</span>
          <span className="font-mono font-bold text-red-600 text-sm">
            {formatRupiah(lastSavedInfo.nominal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Waktu:</span>
          <span className="text-slate-800 font-semibold">{lastSavedInfo.time} WIB</span>
        </div>
      </div>

      <div className="pt-2 flex gap-2.5">
        <button
          type="button"
          onClick={onFinish}
          className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 active:scale-95"
        >
          Selesai
        </button>
        <button
          type="button"
          onClick={onScanNext}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-600/20 active:scale-95"
        >
          <span>Scan Selanjutnya</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QRSuccessStepView;
