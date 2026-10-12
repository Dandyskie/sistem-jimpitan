import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Search, QrCode } from 'lucide-react';
import { Resident } from '../../types';

interface QRStickerGridProps {
  residents: Resident[];
}

const BLOK_FILTER_LIST = ['Semua', 'Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

/**
 * Hasilkan URL tujuan portal warga untuk disematkan dalam QR Code.
 */
function buildQrPortalUrl(residentId: string): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/warga/${residentId}`;
  }
  return `https://jimpitan.bda.id/warga/${residentId}`;
}

/**
 * Komponen Generator dan Cetak Lembar Stiker QR Code Kaleng Jimpitan Warga (A4 Ready).
 * Mendukung 170 rumah warga dengan filter blok dan QR vector SVG offline.
 */
export const QRStickerGrid: React.FC<QRStickerGridProps> = ({ residents }) => {
  const [selectedBlok, setSelectedBlok] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResidents = residents.filter((r) => {
    const matchBlok = selectedBlok === 'Semua' || r.blok === selectedBlok;
    if (!matchBlok) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.nama.toLowerCase().includes(q) ||
      r.noRumah.toLowerCase().includes(q) ||
      r.blok.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Panel Kontrol & Filter (Disembunyikan saat Cetak Print) */}
      <div className="no-print bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Cetak Stiker QR Kaleng Jimpitan
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Format lembar A4 siap tempel untuk kaleng rumah warga RT 02 / RW 07 Bumi Dukuh Asri
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition-all shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Stiker ({filteredResidents.length} Rumah)</span>
          </button>
        </div>

        {/* Filter Blok dan Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {BLOK_FILTER_LIST.map((blok) => {
              const count =
                blok === 'Semua'
                  ? residents.length
                  : residents.filter((r) => r.blok === blok).length;

              return (
                <button
                  key={blok}
                  type="button"
                  onClick={() => setSelectedBlok(blok)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedBlok === blok
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {blok} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau nomor..."
              className="w-full h-8.5 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Grid Kartu Stiker Kaleng (Format Cetak Siap A4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 print:grid-cols-3 print:gap-4 print:p-0">
        {filteredResidents.map((res) => {
          const qrUrl = buildQrPortalUrl(res.id);
          const isBulanan = res.tipe_iuran === 'bulanan';

          return (
            <div
              key={res.id}
              className="p-3.5 rounded-xl border-2 border-slate-300 bg-white text-center flex flex-col items-center justify-between shadow-2xs print:border-black print:rounded-lg print:shadow-none break-inside-avoid"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Header Stiker */}
              <div className="w-full pb-1 border-b border-slate-200 print:border-black">
                <span className="text-[9px] font-black tracking-wider text-slate-700 print:text-black uppercase block">
                  JIMPITANKU by Perum BDA
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 print:text-black block tracking-tight">
                  {res.blok} — NO. {res.noRumah}
                </span>
              </div>

              {/* QR Code SVG Offline */}
              <div className="my-2 p-1.5 bg-white border border-slate-200 print:border-black rounded-lg">
                <QRCodeSVG
                  value={qrUrl}
                  size={88}
                  level="M"
                  includeMargin={false}
                  className="mx-auto"
                />
              </div>

              {/* Data Warga & Skema */}
              <div className="w-full pt-1 border-t border-slate-200 print:border-black space-y-0.5">
                <span className="text-[11px] font-bold text-slate-900 print:text-black block truncate">
                  {res.nama}
                </span>
                <span className="text-[9px] font-semibold text-slate-500 print:text-black block">
                  {isBulanan ? 'Iuran Bulanan (Rp 20.000)' : 'Jimpitan Harian (Rp 2.000)'}
                </span>
                <span className="text-[8px] text-slate-400 print:text-slate-600 block italic">
                  Scan QR untuk cek catatan rumah
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QRStickerGrid;
