import React from 'react';
import { AuthUser } from '../../types';

interface AdminSettingsTabProps {
  currentUser: AuthUser;
  roleTitle: string;
  onRoleTitleChange: (newTitle: string) => void;
  onSaveRole: (newTitle: string) => void;
}

/**
 * Tab Pengaturan Akun & Peran di Dashboard Bendahara.
 */
export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  currentUser,
  roleTitle,
  onRoleTitleChange,
  onSaveRole,
}) => {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Pengaturan Akun & Peran (Role Management)
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Kelola identitas jabatan Bendahara dan pengurus RT
          </p>
        </div>

        <div className="space-y-4 pt-3 border-t border-[var(--color-border)]">
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
              Jabatan / Peran Saat Ini
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => onRoleTitleChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSaveRole(roleTitle)}
              className="h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
            >
              Simpan Perubahan Role
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
          Akun Sistem Terdaftar
        </h3>

        <div className="divide-y divide-[var(--color-border)] text-xs">
          <div className="py-2.5 flex justify-between items-center">
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">Bendahara (Admin Kas)</div>
              <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">admin@jimpitan.local</div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-emerald-200">
              Aktif
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <div className="font-semibold text-[var(--color-text-primary)]">Petugas Ronda Lapangan</div>
              <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">petugas@jimpitan.local</div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
