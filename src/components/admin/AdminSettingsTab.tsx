import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { ShieldCheck, Users, Save, CheckCircle2 } from 'lucide-react';
import {
  RondaGroup,
  getSavedRondaGroups,
  saveRondaGroupsConfig,
  getTodayRondaGroup,
} from '../../data/rondaGroups';

interface AdminSettingsTabProps {
  currentUser: AuthUser;
  roleTitle: string;
  onRoleTitleChange: (newTitle: string) => void;
  onSaveRole: (newTitle: string) => void;
}

/**
 * Tab Pengaturan Sistem & Peran di Dashboard Bendahara.
 * Mengelola peran admin, 7 regu ronda harian, dan pertahanan siber sistem.
 */
export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  currentUser,
  roleTitle,
  onRoleTitleChange,
  onSaveRole,
}) => {
  const [rondaGroups, setRondaGroups] = useState<RondaGroup[]>(() => getSavedRondaGroups());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const todayGroup = getTodayRondaGroup();

  const handleGroupChange = (index: number, field: keyof RondaGroup, value: string) => {
    const updated = [...rondaGroups];
    updated[index] = { ...updated[index], [field]: value };
    setRondaGroups(updated);
  };

  const handleSaveAllGroups = () => {
    saveRondaGroupsConfig(rondaGroups);
    setSaveSuccessMsg('Konfigurasi 7 Grup Ronda berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 700);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Notifikasi feedback simpan */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Pengaturan Identitas Akun & Role Bendahara */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Pengaturan Akun & Peran (Role Bendahara)
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Kelola nama jabatan pengurus kas RT 02 / RW 07 Bumi Dukuh Asri
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border)]">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Nama Akun Administrator
            </label>
            <input
              type="text"
              disabled
              value={currentUser.nama}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs bg-[var(--color-surface-subtle)] text-[var(--color-text-disabled)] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Nama Jabatan / Peran Saat Ini
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => onRoleTitleChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onSaveRole(roleTitle)}
            className="h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
          >
            Simpan Perubahan Role Bendahara
          </button>
        </div>
      </div>

      {/* 2. Pengaturan 7 Role Petugas Ronda Bergilir Harian */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700 shrink-0" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Jadwal 7 Role Petugas Ronda Harian
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Sistem berganti salam dan koordinator secara otomatis setiap hari (Malam Senin s/d Minggu)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAllGroups}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Jadwal Ronda</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {rondaGroups.map((group, index) => {
            const isToday = todayGroup.dayIndex === group.dayIndex;

            return (
              <div
                key={group.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Malam {group.hari}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white uppercase tracking-wider">
                        Bertugas Hari Ini
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{group.kontak}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">
                      Nama Grup / Role
                    </label>
                    <input
                      type="text"
                      value={group.namaGrup}
                      onChange={(e) => handleGroupChange(index, 'namaGrup', e.target.value)}
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Koordinator
                      </label>
                      <input
                        type="text"
                        value={group.koordinator}
                        onChange={(e) => handleGroupChange(index, 'koordinator', e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        No. HP / WA
                      </label>
                      <input
                        type="text"
                        value={group.kontak}
                        onChange={(e) => handleGroupChange(index, 'kontak', e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Status Pertahanan & Keamanan Siber Sistem */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Cybersecurity & Privacy Shield (Pertahanan Anti-Cracker & DDoS)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Anti-Brute Force Protection</div>
              <div className="text-[11px] text-emerald-800">
                Membatasi login gagal maksimal 5 kali dengan cooldown 60 detik untuk mencegah tebak password cracker.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Action Throttling / DDoS Defense</div>
              <div className="text-[11px] text-emerald-800">
                Mencegah bot spamming dan klik beruntun saat pencatatan tarikan atau verifikasi setoran.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Isolasi Privasi QR Warga</div>
              <div className="text-[11px] text-emerald-800">
                QR Code Rumah 1 hanya mengizinkan akses data Rumah 1 tanpa kemampuan mengintip rekap rumah tetangga.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Security Headers & Anti-XSS</div>
              <div className="text-[11px] text-emerald-800">
                X-Frame-Options DENY, X-Content-Type nosniff, serta sanitasi teks masukan untuk mencegah injeksi skrip.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
