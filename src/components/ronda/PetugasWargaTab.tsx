import React, { useState } from 'react';
import { Search, Phone } from 'lucide-react';
import { Resident } from '../../types';

interface PetugasWargaTabProps {
  residents: Resident[];
}

/**
 * Tab kontak darurat warga untuk petugas ronda malam
 * Menggunakan kartu squircle modern dan tombol kontak cepat
 */
export const PetugasWargaTab: React.FC<PetugasWargaTabProps> = ({ residents }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = residents.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.nama.toLowerCase().includes(q) ||
      r.noRumah.includes(q) ||
      r.blok.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3.5">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau no. rumah warga..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 shadow-xs transition-all"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-[20px] border border-slate-200/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                  {res.blok ? res.blok.replace('Blok ', '') : ''}
                </span>
                <span className="text-xs font-black text-slate-800 leading-tight">
                  {res.noRumah}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {res.nama}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {res.tipe_iuran === 'bulanan' ? 'Warga Iuran Bulanan' : 'Warga Jimpitan Harian'}
                </p>
              </div>
            </div>

            {res.noHp ? (
              <a
                href={`tel:${res.noHp}`}
                className="h-9 w-9 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center hover:bg-red-100 transition-colors"
                title={`Hubungi ${res.nama}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetugasWargaTab;
