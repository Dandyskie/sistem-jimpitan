import React, { useState, useEffect } from 'react';
import {
  Resident,
  JimpitanRecord,
  CashTransaction,
  AuthUser,
  DailyVerification,
} from '../../types';
import { AdminSidebar, AdminTab } from '../layout/AdminSidebar';
import { formatTanggalSingkat } from '../../utils/formatters';
import { DataService } from '../../services/dataService';
import { DataWargaModule } from '../modules/DataWargaModule';
import { TransaksiKeuanganModule } from '../modules/TransaksiKeuanganModule';
import { RingkasanKeuanganModule } from '../modules/RingkasanKeuanganModule';
import { LaporanModule } from '../modules/LaporanModule';
import { RiwayatJimpitanModule } from '../modules/RiwayatJimpitanModule';
import { VerificationCenterModule } from '../modules/VerificationCenterModule';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { QRStickerGrid } from './QRStickerGrid';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminDashboardViewProps {
  currentUser: AuthUser;
  residents: Resident[];
  todayDate: string;
  jimpitanRecords: JimpitanRecord[];
  cashTransactions: CashTransaction[];
  onAddResident: (resident: Omit<Resident, 'id'>) => void;
  onUpdateResident: (id: string, updates: Partial<Resident>) => void;
  onDeleteResident: (id: string) => void;
  onAddCashTransaction: (trx: Omit<CashTransaction, 'id' | 'waktuInput'>) => void;
  onDeleteCashTransaction: (id: string) => void;
  onUpdateRole: (newRoleTitle: string) => void;
  onLogout: () => void;
  onNavigateUrl: (path: string) => void;
}

/**
 * Tampilan Utama Dashboard Bendahara RT (OripioFin Style: dash-reference1.webp)
 */
export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  residents,
  todayDate,
  jimpitanRecords,
  cashTransactions,
  onAddResident,
  onUpdateResident,
  onDeleteResident,
  onAddCashTransaction,
  onDeleteCashTransaction,
  onUpdateRole,
  onLogout,
  onNavigateUrl,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [keuanganSubTab, setKeuanganSubTab] = useState<'ringkasan' | 'pemasukan' | 'pengeluaran'>('ringkasan');
  const [roleTitle, setRoleTitle] = useState<string>(currentUser.jabatan);
  const [pendingVerif, setPendingVerif] = useState<DailyVerification | null>(null);

  useEffect(() => {
    DataService.getDailyVerification(todayDate)
      .then((verif) => setPendingVerif(verif))
      .catch((err) => console.warn('Gagal memuat status verifikasi:', err));
  }, [todayDate]);

  /* Kalkulasi statistik keuangan kas */
  const totalIncome = cashTransactions
    .filter((t) => t.tipe === 'pemasukan')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalExpense = cashTransactions
    .filter((t) => t.tipe === 'pengeluaran')
    .reduce((sum, t) => sum + t.nominal, 0);

  const currentBalance = totalIncome - totalExpense;

  /* Statistik tarikan jimpitan malam ini */
  const activeResidents = residents.filter((r) => r.status === 'aktif');
  const totalHouses = activeResidents.length;
  const todayRecords = jimpitanRecords.filter((r) => r.tanggal === todayDate);
  const todayJimpitanAmount = todayRecords.reduce((sum, r) => sum + r.nominal, 0);

  const paidResidentIds = new Set(
    todayRecords.filter((r) => r.status === 'lunas' || r.nominal > 0).map((r) => r.residentId)
  );
  const paidCount = paidResidentIds.size;
  const progressPercent = totalHouses > 0 ? Math.round((paidCount / totalHouses) * 100) : 0;

  const monthlyLunasCount = residents.filter(
    (r) => r.tipe_iuran === 'bulanan' && r.status_bulanan === 'lunas'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex antialiased">
      <div className="hidden md:block shrink-0">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          adminName={currentUser.nama}
          adminTitle={roleTitle}
          pendingVerificationCount={pendingVerif?.status === 'pending' ? 1 : 0}
          onLogout={onLogout}
          onNavigateUrl={onNavigateUrl}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        {/* Top Header bergaya OripioFin */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/bda-logo.jpg"
              alt="Logo BDA"
              className="w-8 h-8 rounded-xl object-cover md:hidden shadow-xs border border-slate-200"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Portal Bendahara RT 02
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {currentUser.nama}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-600 hidden sm:inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              {formatTanggalSingkat(todayDate)}
            </span>
            <button
              type="button"
              onClick={() => onNavigateUrl('/')}
              className="text-xs font-bold text-red-600 hover:text-red-700 px-3.5 py-1.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              Ke Portal Petugas Ronda →
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {currentTab === 'dashboard' && (
            <AdminDashboardOverview
              pendingVerif={pendingVerif}
              currentBalance={currentBalance}
              todayJimpitanAmount={todayJimpitanAmount}
              paidCount={paidCount}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              monthlyLunasCount={monthlyLunasCount}
              totalHouses={totalHouses}
              progressPercent={progressPercent}
              todayRecords={todayRecords}
              activeResidents={activeResidents}
              cashTransactions={cashTransactions}
              onNavigateToKeuangan={() => {
                setCurrentTab('keuangan');
                setKeuanganSubTab('ringkasan');
              }}
              onNavigateToVerifikasi={() => setCurrentTab('verifikasi')}
            />
          )}

          {currentTab === 'verifikasi' && (
            <VerificationCenterModule
              currentUser={currentUser}
              todayDate={todayDate}
              onRefreshData={() => {
                DataService.getDailyVerification(todayDate).then(setPendingVerif);
              }}
            />
          )}

          {currentTab === 'jimpitan' && (
            <RiwayatJimpitanModule
              records={jimpitanRecords}
              onUpdateRecord={() => {}}
              onDeleteRecord={() => {}}
            />
          )}

          {currentTab === 'warga' && (
            <DataWargaModule
              residents={residents}
              onAddResident={onAddResident}
              onUpdateResident={onUpdateResident}
              onDeleteResident={onDeleteResident}
            />
          )}

          {currentTab === 'keuangan' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setKeuanganSubTab('ringkasan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    keuanganSubTab === 'ringkasan'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Ringkasan & Neraca
                </button>
                <button
                  type="button"
                  onClick={() => setKeuanganSubTab('pemasukan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    keuanganSubTab === 'pemasukan'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Buku Pemasukan Kas
                </button>
                <button
                  type="button"
                  onClick={() => setKeuanganSubTab('pengeluaran')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    keuanganSubTab === 'pengeluaran'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Buku Pengeluaran Kas
                </button>
              </div>

              {keuanganSubTab === 'ringkasan' && (
                <RingkasanKeuanganModule
                  cashTransactions={cashTransactions}
                  jimpitanRecords={jimpitanRecords}
                  onNavigateToTab={(tab) => {
                    if (tab === 'pemasukan') setKeuanganSubTab('pemasukan');
                    if (tab === 'pengeluaran') setKeuanganSubTab('pengeluaran');
                  }}
                />
              )}

              {keuanganSubTab === 'pemasukan' && (
                <TransaksiKeuanganModule
                  type="pemasukan"
                  transactions={cashTransactions}
                  todayDate={todayDate}
                  onAddTransaction={onAddCashTransaction}
                  onDeleteTransaction={onDeleteCashTransaction}
                />
              )}

              {keuanganSubTab === 'pengeluaran' && (
                <TransaksiKeuanganModule
                  type="pengeluaran"
                  transactions={cashTransactions}
                  todayDate={todayDate}
                  onAddTransaction={onAddCashTransaction}
                  onDeleteTransaction={onDeleteCashTransaction}
                />
              )}
            </div>
          )}

          {currentTab === 'laporan' && (
            <LaporanModule
              jimpitanRecords={jimpitanRecords}
              cashTransactions={cashTransactions}
              residents={residents}
            />
          )}

          {currentTab === 'qrcode' && <QRStickerGrid residents={residents} />}

          {currentTab === 'pengaturan' && (
            <AdminSettingsTab
              currentUser={currentUser}
              roleTitle={roleTitle}
              onRoleTitleChange={setRoleTitle}
              onSaveRole={onUpdateRole}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardView;
