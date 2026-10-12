import React from 'react';
import { Printer } from 'lucide-react';
import { Resident } from '../../types';

interface QRStickerGridProps {
  residents: Resident[];
}

/**
 * Grid Stiker QR Code Kaleng Jimpitan Warga RT 02 / RW 07.
 */
export const QRStickerGrid: React.FC<QRStickerGridProps> = ({ residents }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Manajemen QR Code Kaleng Warga
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Generate dan cetak stiker kaleng jimpitan untuk seluruh rumah warga Perum BDA
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Seluruh Stiker</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 print:grid-cols-3">
        {residents.slice(0, 24).map((res) => (
          <div
            key={res.id}
            className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center space-y-2 shadow-2xs"
          >
            <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Jimpitan Warga BDA
            </div>

            <div className="w-24 h-24 mx-auto p-1 border border-[var(--color-border)] rounded-[var(--radius-sm)] flex items-center justify-center bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BDA-${res.blok.replace('Blok ', '')}${res.noRumah}`}
                alt={`QR ${res.nama}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="text-xs font-bold text-[var(--color-text-primary)]">
              {res.blok} No. {res.noRumah}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] truncate">
              {res.nama}
            </div>
            <div className="text-[10px] font-mono text-[var(--color-text-disabled)]">
              {res.tipe_iuran === 'bulanan' ? 'Iuran Bulanan' : 'Rp 2.000 / Malam'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
