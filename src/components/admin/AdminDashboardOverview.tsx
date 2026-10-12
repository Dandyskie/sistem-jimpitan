import React from 'react';
import {
  Resident,
  JimpitanRecord,
  CashTransaction,
  DailyVerification,
} from '../../types';
import { SettlementAlert } from './SettlementAlert';
import { MetricCards } from './MetricCards';
import { KasPerBlokGrid } from './KasPerBlokGrid';
import { ArusKasChartCard } from './ArusKasChartCard';
import { RondaProgressCard } from './RondaProgressCard';
import { RecentLedgerCard } from './RecentLedgerCard';

interface AdminDashboardOverviewProps {
  pendingVerif: DailyVerification | null;
  currentBalance: number;
  todayJimpitanAmount: number;
  paidCount: number;
  totalIncome: number;
  totalExpense: number;
  monthlyLunasCount: number;
  totalHouses: number;
  progressPercent: number;
  todayRecords: JimpitanRecord[];
  activeResidents: Resident[];
  cashTransactions: CashTransaction[];
  onNavigateToKeuangan: () => void;
  onNavigateToVerifikasi: () => void;
}

/**
 * Komponen ikhtisar utama Dashboard OripioFin (dash-reference1.webp)
 * Menyusun 3 baris: Hero Metrics BDA, 2-Grid Kas Blok & Chart Arus Kas, serta Tabel Mutasi
 */
export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  pendingVerif,
  currentBalance,
  todayJimpitanAmount,
  paidCount,
  totalIncome,
  totalExpense,
  monthlyLunasCount,
  totalHouses,
  progressPercent,
  todayRecords,
  activeResidents,
  cashTransactions,
  onNavigateToKeuangan,
  onNavigateToVerifikasi,
}) => {
  return (
    <div className="space-y-6">
      <SettlementAlert
        pendingVerif={pendingVerif}
        onNavigateToVerifikasi={onNavigateToVerifikasi}
      />

      {/* Baris 1: 4 Metric Cards (Hero Card Merah BDA + 3 Kartu Squircle Putih) */}
      <MetricCards
        currentBalance={currentBalance}
        todayJimpitanAmount={todayJimpitanAmount}
        paidCount={paidCount}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        monthlyLunasCount={monthlyLunasCount}
        onNavigateToKeuangan={onNavigateToKeuangan}
        onNavigateToVerifikasi={onNavigateToVerifikasi}
      />

      {/* Baris 2: Middle Section OripioFin (2 Grid: Kas Per Blok & Arus Kas Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <KasPerBlokGrid
          residents={activeResidents}
          todayRecords={todayRecords}
        />
        <ArusKasChartCard cashTransactions={cashTransactions} />
      </div>

      {/* Baris 3: Bottom Section (Progres Ronda Lapangan & Mutasi Buku Kas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RondaProgressCard
          paidCount={paidCount}
          totalHouses={totalHouses}
          progressPercent={progressPercent}
          todayRecords={todayRecords}
          onNavigateToVerifikasi={onNavigateToVerifikasi}
        />
        <RecentLedgerCard
          cashTransactions={cashTransactions}
          onNavigateToKeuangan={onNavigateToKeuangan}
        />
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
