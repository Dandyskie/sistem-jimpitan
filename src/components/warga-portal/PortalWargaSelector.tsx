import React, { useState } from 'react';
import { Search, X, Home, ChevronRight } from 'lucide-react';
import { Resident } from '../../types';

interface PortalWargaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  currentResidentId?: string;
  onSelectResident: (res: Resident) => void;
}

const BLOK_LIST = ['Semua', 'Blok A', 'Blok B', 'Blok C', 'Blok D', 'Blok E'];

/**
 * Modal Pemilih Rumah Warga untuk Transparansi Jimpitan.
 * Memudahkan warga memilih atau mencari kaleng rumah yang ingin dicek.
 */
export const PortalWargaSelector: React.FC<PortalWargaSelectorProps> = ({
  isOpen,
  onClose,
  residents,
  currentResidentId,
  onSelectResident,
}) => {
  const [selectedBlok, setSelectedBlok] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

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

  const handlePick = (res: Resident) => {
    onSelectResident(res);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-2xl border border-[var(--color-border)] space-y-4 max-h-[85vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Pilih Rumah Warga RT 02 / RW 07
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Cari nomor rumah atau nama kepala keluarga (Total 170 Rumah)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pemilih rumah"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama warga atau nomor rumah..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-shadow"
          />
        </div>

        {/* Filter Blok Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {BLOK_LIST.map((blok) => (
            <button
              key={blok}
              type="button"
              onClick={() => setSelectedBlok(blok)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedBlok === blok
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {blok}
            </button>
          ))}
        </div>

        {/* List Rumah Hasil Filter */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
          {filteredResidents.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Tidak ada rumah yang sesuai dengan pencarian &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredResidents.map((res) => {
              const isSelected = res.id === currentResidentId;

              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handlePick(res)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 font-semibold'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">
                        {res.blok} No. {res.noRumah} — {res.nama}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {res.tipe_iuran === 'bulanan' ? 'Iuran Bulanan (Rp 20.000)' : 'Jimpitan Harian'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
