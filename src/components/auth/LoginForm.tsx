import React from 'react';
import { Role } from '../../types';
import { Lock, User, AlertCircle, Eye, EyeOff, Sparkles, Users } from 'lucide-react';
import { getTodayRondaGroup } from '../../data/rondaGroups';
import { FullscreenButton } from '../common/FullscreenButton';

interface LoginFormProps {
  isAdmin: boolean;
  emailOrUsername: string;
  setEmailOrUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  errorMessage: string;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleQuickFill: (role: Role) => void;
  onNavigateUrl: (path: string) => void;
}

/**
 * Komponen formulir login modern JIMPITANKU by Perum BDA (Bumi Dukuh Asri)
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  isAdmin,
  emailOrUsername,
  setEmailOrUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errorMessage,
  isLoading,
  handleSubmit,
  handleQuickFill,
  onNavigateUrl,
}) => {
  const todayGroup = getTodayRondaGroup();

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Header khusus tampilan mobile */}
      <div className="flex flex-col items-center mb-6 md:hidden text-center relative">
        <div className="absolute right-0 top-0">
          <FullscreenButton />
        </div>

        <div className="mb-3">
          <img
            src="/bda-logo.jpg"
            alt="Logo Bumi Dukuh Asri"
            className="w-16 h-16 rounded-2xl object-cover shadow-md border border-slate-200/80"
          />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 mb-2">
          RT 02 / RW 07 BUMI DUKUH ASRI
        </span>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {isAdmin ? 'Portal Bendahara' : 'JIMPITANKU Ronda'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? 'Akses dashboard pencatatan kas & audit warga'
            : todayGroup.salam}
        </p>
      </div>

      {/* Header tampilan desktop */}
      <div className="hidden md:block mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          {isAdmin ? 'Akses Eksekutif Kas RT' : 'JIMPITANKU by Perum BDA'}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isAdmin ? 'Masuk ke Dashboard' : todayGroup.salam}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin
            ? 'Kelola buku kas, iuran warga, dan verifikasi mutasi harian.'
            : `Petugas jaga malam ini: ${todayGroup.namaGrup} (Koord: ${todayGroup.koordinator}).`}
        </p>
      </div>

      {/* Alert pesan error */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Form input utama */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Username atau Email
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder={isAdmin ? 'admin@jimpitan.local' : 'petugas@jimpitan.local'}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi akun"
              className="w-full h-11 pl-10 pr-10 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg cursor-pointer transition-colors"
              aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tombol aksi login */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
        >
          {isLoading ? 'Memverifikasi Akses...' : `Masuk ke ${isAdmin ? 'Dashboard Kas' : 'Aplikasi Ronda'}`}
        </button>
      </form>

      {/* Switcher akun demo pengujian */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Akses Cepat Pengujian Demo:
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickFill('bendahara')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isAdmin
                ? 'border-red-500 bg-red-50/70 text-red-950 shadow-sm'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Bendahara RT</span>
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
            </div>
            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
              admin@jimpitan.local
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('petugas_ronda')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              !isAdmin
                ? 'border-red-500 bg-red-50/70 text-red-950 shadow-sm'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1 truncate">
                <Users className="w-3 h-3 text-red-600 shrink-0" />
                {todayGroup.hari}
              </span>
              {!isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
            </div>
            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
              {todayGroup.namaGrup}
            </span>
          </button>
        </div>
      </div>

      {/* Tautan beralih portal */}
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => onNavigateUrl(isAdmin ? '/' : '/admin')}
          className="text-xs font-medium text-slate-500 hover:text-red-600 cursor-pointer transition-colors"
        >
          {isAdmin ? '← Beralih ke Portal Petugas Lapangan' : 'Beralih ke Portal Bendahara RT →'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
