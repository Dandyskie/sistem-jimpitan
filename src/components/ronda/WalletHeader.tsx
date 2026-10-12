import React from 'react';
import { QrCode, ShieldCheck, LogOut, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { getTodayRondaGroup } from '../../data/rondaGroups';
import { FullscreenButton } from '../common/FullscreenButton';

interface WalletHeaderProps {
  petugasName: string;
  todayDate: string;
  totalCollectedToday: number;
  progressPercent: number;
  recordedDailyCount: number;
  totalDailyTargetHouses: number;
  monthlyPrepaidCount: number;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSyncNow: () => void;
  onLogout: () => void;
  onOpenQRScanner: () => void;
  onOpenSettlement: () => void;
}

/**
 * Label status sinkronisasi jaringan Supabase
 */
function getConnectionLabel(isOnline: boolean, isSyncing: boolean, pendingCount: number): string {
  if (isSyncing) return 'Menyinkronkan...';
  if (!isOnline) return 'Offline';
  if (pendingCount > 0) return `${pendingCount} Antrean`;
  return 'Tersambung';
}

/**
 * Header dompet ronda mobile sesuai referensi mobile-reference1.webp
 * JIMPITANKU by Perum BDA (Bumi Dukuh Asri)
 */
export const WalletHeader: React.FC<WalletHeaderProps> = ({
  petugasName: _petugasName,
  todayDate,
  totalCollectedToday,
  progressPercent,
  recordedDailyCount,
  totalDailyTargetHouses,
  monthlyPrepaidCount,
  isOnline,
  pendingCount,
  isSyncing,
  onSyncNow,
  onLogout,
  onOpenQRScanner,
  onOpenSettlement,
}) => {
  const connectionLabel = getConnectionLabel(isOnline, isSyncing, pendingCount);
  const showWarning = !isOnline || pendingCount > 0;
  const todayGroup = getTodayRondaGroup(todayDate);

  return (
    <>
      {/* Bar navigasi atas aplikasi mobile dengan efek frosted glass */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/bda-logo.jpg"
              alt="Logo BDA"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-red-700 tracking-wider uppercase truncate">
                JIMPITANKU • {formatTanggalSingkat(todayDate)}
              </p>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                {todayGroup.salam}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tombol Fullscreen khusus mobile */}
            <FullscreenButton />
            {/* Tombol sinkronisasi status Supabase */}
            <button
              type="button"
              onClick={onSyncNow}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                showWarning
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isOnline ? 'Terhubung ke Supabase' : 'Mode offline aktif'}
            >
              {isSyncing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />}
              {!isSyncing && !isOnline && <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
              {!isSyncing && isOnline && pendingCount > 0 && <RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
              {!isSyncing && isOnline && pendingCount === 0 && <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden xs:inline">{connectionLabel}</span>
            </button>

            {/* Tombol keluar akun */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Keluar Akun"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Kartu Dompet Ronda Utama (Tema Merah Crimson Khas Logo BDA) */}
      <div className="px-3.5 sm:px-5 pt-3.5 max-w-xl mx-auto w-full">
        <div className="rounded-[26px] bg-gradient-to-br from-red-600 via-rose-700 to-red-950 text-white p-5 sm:p-6 shadow-xl shadow-red-950/20 relative overflow-hidden">
          {/* Aksen visual radial glow di dalam kartu */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-black/20 rounded-full blur-xl pointer-events-none" />

          {/* Baris saldo dan badge persentase */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-rose-100/90 tracking-wide">
                Total Jimpitan Malam Ini
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5 tabular-nums">
                {formatRupiah(totalCollectedToday)}
              </p>
            </div>
            <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 tabular-nums shadow-xs">
              {progressPercent}% Target
            </span>
          </div>

          {/* Baris kemajuan target rumah */}
          <div className="relative z-10 mt-4">
            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden backdrop-blur-sm p-0.5">
              <div
                className="bg-gradient-to-r from-white via-rose-100 to-white h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-rose-100/90 mt-2 font-medium">
              <span>
                <strong className="text-white tabular-nums">{recordedDailyCount}</strong> dari {totalDailyTargetHouses} rumah tertarget
              </span>
              <span>{monthlyPrepaidCount} KK Bulanan</span>
            </div>
          </div>

          {/* Tombol aksi cepat pill presisi sesuai referensi mobile */}
          <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex gap-2.5">
            <button
              type="button"
              onClick={onOpenQRScanner}
              className="flex-1 h-11.5 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-red-600" />
              Scan QR Jimpitan
            </button>

            <button
              type="button"
              onClick={onOpenSettlement}
              className="flex-1 h-11.5 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 text-white font-semibold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rose-200" />
              Kunci & Setor Kas
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletHeader;
