import React from 'react';
import {
  LayoutDashboard,
  Coins,
  Users,
  Wallet,
  FileSpreadsheet,
  QrCode,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Search,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'verifikasi'
  | 'jimpitan'
  | 'warga'
  | 'keuangan'
  | 'laporan'
  | 'qrcode'
  | 'pengaturan';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminName: string;
  adminTitle: string;
  pendingVerificationCount?: number;
  onLogout: () => void;
  onNavigateUrl: (path: string) => void;
}

const MENU_UTAMA: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard Kas RT', icon: LayoutDashboard },
  { id: 'verifikasi', label: 'Verifikasi Setoran', icon: ShieldCheck },
  { id: 'jimpitan', label: 'Rekap Jimpitan', icon: Coins },
  { id: 'warga', label: 'Kelola Data Warga', icon: Users },
  { id: 'keuangan', label: 'Buku Kas & Transaksi', icon: Wallet },
];

const MENU_LAPORAN: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'laporan', label: 'Laporan & Unduh PDF', icon: FileSpreadsheet },
  { id: 'qrcode', label: 'Kelola QR Kaleng', icon: QrCode },
  { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings },
];

/**
 * Sidebar Admin Dashboard bergaya OripioFin (dash-reference1.webp)
 * Menggunakan aksen merah BDA, search box mini, dan badge status presisi
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  adminName,
  adminTitle,
  pendingVerificationCount = 0,
  onLogout,
  onNavigateUrl,
}) => {
  const renderNavItem = (
    item: { id: AdminTab; label: string; icon: React.ElementType },
    badge?: number
  ) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectTab(item.id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer ${
          isActive
            ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
          <span className="truncate">{item.label}</span>
        </div>

        {badge && badge > 0 ? (
          <span
            className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums ${
              isActive ? 'bg-white text-red-600' : 'bg-red-100 text-red-700'
            }`}
          >
            {badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <aside className="w-[270px] bg-white border-r border-slate-200/80 h-screen sticky top-0 flex flex-col justify-between select-none overflow-hidden z-30">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4">
        {/* Header brand dengan logo BDA */}
        <div className="flex items-center gap-3 px-2 py-2 mb-4 shrink-0">
          <img
            src="/bda-logo.jpg"
            alt="Logo BDA"
            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 truncate leading-tight">
              Jimpitan BDA
            </h2>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              RT 02 / RW 07 Sukoharjo
            </p>
          </div>
        </div>

        {/* Input pencarian mini sidebar bergaya OripioFin */}
        <div className="relative mb-5 px-1">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Cari menu... ⌘K"
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="space-y-4 flex-1">
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            <div className="space-y-1">
              {MENU_UTAMA.map((item) =>
                renderNavItem(
                  item,
                  item.id === 'verifikasi' ? pendingVerificationCount : undefined
                )
              )}
            </div>
          </div>

          <div>
            <div className="px-3 pt-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Laporan & Kelola
            </div>
            <div className="space-y-1">
              {MENU_LAPORAN.map((item) => renderNavItem(item))}
            </div>
          </div>
        </nav>
      </div>

      {/* Profil Bendahara dan Switcher */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {adminName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {adminTitle}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Keluar Sesi"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateUrl('/')}
            className="w-full h-8.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Buka Portal Petugas Ronda</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
