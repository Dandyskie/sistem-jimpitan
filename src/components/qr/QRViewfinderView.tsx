import React from 'react';
import { Camera, Search, QrCode } from 'lucide-react';
import { Resident } from '../../types';

interface QRViewfinderViewProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filteredResidents: Resident[];
  isScanning: boolean;
  onSelectResident: (res: Resident) => void;
}

/**
 * Tampilan Bidik Kamera Simulasi Pemindai QR Kaleng Warga.
 */
export const QRViewfinderView: React.FC<QRViewfinderViewProps> = ({
  searchQuery,
  onSearchChange,
  filteredResidents,
  isScanning,
  onSelectResident,
}) => {
  return (
    <div className="space-y-4">
      {/* Viewfinder Kamera Simulasi */}
      <div className="relative aspect-video sm:aspect-2/1 bg-slate-950 rounded-[var(--radius-lg)] overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4">
        {/* Sudut Frame Bidik Target */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 border-2 border-emerald-400/80 rounded-[var(--radius-md)] flex items-center justify-center">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

          {/* Animasi Garis Laser Scan */}
          <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />

          <div className="text-center p-2 text-white/80">
            <Camera className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
            <span className="text-[11px] font-medium block">
              Arahkan ke QR Kaleng Warga
            </span>
          </div>
        </div>

        {isScanning && (
          <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center">
            <span className="text-emerald-300 font-bold text-xs animate-pulse">
              Membaca Barcode Kaleng...
            </span>
          </div>
        )}
      </div>

      {/* Simulator Pilihan Cepat Kaleng Rumah */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] block">
          Pilih Kaleng Rumah (Simulasi Cepat)
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ketik nama warga atau nomor rumah..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
          />
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {filteredResidents.slice(0, 15).map((res) => (
            <button
              key={res.id}
              type="button"
              onClick={() => onSelectResident(res)}
              className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:border-emerald-300 hover:bg-[var(--color-primary-light)] text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div>
                <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                  {res.blok ? res.blok.replace('Blok ', '') : ''} No. {res.noRumah}
                </span>
                <span className="text-[var(--color-text-secondary)] ml-2">{res.nama}</span>
              </div>
              <QrCode className="w-3.5 h-3.5 text-[var(--color-text-disabled)] group-hover:text-[var(--color-primary)]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
