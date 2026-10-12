import React from 'react';
import { CashTransaction, JimpitanRecord } from '../../types';
import { QuickStatsCard } from '../common/QuickStatsCard';
import { formatRupiah } from '../../utils/formatters';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
} from 'lucide-react';

interface RingkasanKeuanganModuleProps {
  cashTransactions: CashTransaction[];
  jimpitanRecords: JimpitanRecord[];
  onNavigateToTab: (tab: 'ringkasan' | 'pemasukan' | 'pengeluaran') => void;
}

/**
 * Modul Ringkasan Neraca Keuangan Kas RT 02 / RW 07 BDA.
 * Menampilkan metrik arus kas, rasio surplus/defisit, dan rincian alokasi per kategori.
 */
export const RingkasanKeuanganModule: React.FC<RingkasanKeuanganModuleProps> = ({
  cashTransactions,
  jimpitanRecords,
  onNavigateToTab,
}) => {
  /* Kalkulasi neraca keuangan */
  const totalIncome = cashTransactions
    .filter((t) => t.tipe === 'pemasukan')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalExpense = cashTransactions
    .filter((t) => t.tipe === 'pengeluaran')
    .reduce((sum, t) => sum + t.nominal, 0);

  const currentBalance = totalIncome - totalExpense;

  /* Rincian per kategori */
  const incomeCategories = [
    {
      kategori: 'jimpitan',
      label: 'Rekap Jimpitan Ronda',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pemasukan' && t.kategori === 'jimpitan')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
    {
      kategori: 'kas_rt',
      label: 'Iuran Wajib Kas RT',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pemasukan' && t.kategori === 'kas_rt')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
    {
      kategori: 'donasi',
      label: 'Donasi & Sumbangan',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pemasukan' && t.kategori === 'donasi')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
  ];

  const expenseCategories = [
    {
      kategori: 'kebersihan',
      label: 'Operasional Sampah & Kebersihan',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pengeluaran' && t.kategori === 'kebersihan')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
    {
      kategori: 'perlengkapan_ronda',
      label: 'Konsumsi & Perlengkapan Ronda',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pengeluaran' && t.kategori === 'perlengkapan_ronda')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
    {
      kategori: 'perbaikan_fasilitas',
      label: 'Perbaikan Lampu & Fasilitas Jalan',
      amount: cashTransactions
        .filter((t) => t.tipe === 'pengeluaran' && t.kategori === 'perbaikan_fasilitas')
        .reduce((sum, t) => sum + t.nominal, 0),
    },
  ];

  const totalJimpitanNight = jimpitanRecords.reduce((s, r) => s + r.nominal, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
            Ringkasan Neraca Keuangan Kas RT 02 / RW 07 BDA
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Monitoring arus kas, pembukuan saldo riil, dan alokasi pengeluaran warga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('pemasukan')}
            className="h-9 px-3.5 text-xs font-semibold rounded-[var(--radius-sm)] bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            + Catat Pemasukan
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('pengeluaran')}
            className="h-9 px-3.5 text-xs font-semibold rounded-[var(--radius-sm)] bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            - Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <QuickStatsCard
          label="Saldo Kas Bersih Saat Ini"
          value={formatRupiah(currentBalance)}
          subValue="Tersedia di brankas bendahara"
          icon={Wallet}
          variant="primary"
          actionText="Lihat Neraca Lengkap"
        />

        <QuickStatsCard
          label="Total Pemasukan (Bulan Ini)"
          value={formatRupiah(totalIncome)}
          subValue="Jimpitan + Iuran + Donasi"
          icon={ArrowDownLeft}
          variant="default"
          actionText="Buka Buku Pemasukan"
          onClick={() => onNavigateToTab('pemasukan')}
        />

        <QuickStatsCard
          label="Total Pengeluaran (Bulan Ini)"
          value={formatRupiah(totalExpense)}
          subValue="Operasional & Ronda"
          icon={ArrowUpRight}
          variant="default"
          actionText="Buka Buku Pengeluaran"
          onClick={() => onNavigateToTab('pengeluaran')}
        />

        <QuickStatsCard
          label="Akumulasi Tarikan Jimpitan"
          value={formatRupiah(totalJimpitanNight)}
          subValue="Dari kaleng ronda malam"
          icon={Coins}
          variant="default"
        />
      </div>

      {/* 3. Cashflow Visual Balance Bar */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)]">Rasio Pemasukan vs Pengeluaran</span>
          <span className="font-mono text-[var(--color-text-secondary)]">
            Pemasukan: {formatRupiah(totalIncome)} &middot; Pengeluaran: {formatRupiah(totalExpense)}
          </span>
        </div>

        <div className="h-3.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex border border-[var(--color-border)]">
          <div
            className="bg-[var(--color-primary)] transition-all duration-500"
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50}%`,
            }}
            title="Pemasukan"
          />
          <div
            className="bg-rose-600 transition-all duration-500"
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50}%`,
            }}
            title="Pengeluaran"
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] inline-block" />
            Pemasukan (Surplus Kas)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            Pengeluaran Operasional
          </span>
        </div>
      </div>

      {/* 4. Categorized Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pemasukan Breakdown */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-[var(--color-primary)]" />
                Rincian Sumber Pemasukan
              </h3>
              <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                {formatRupiah(totalIncome)}
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {incomeCategories.map((cat) => {
                const percent = totalIncome > 0 ? Math.round((cat.amount / totalIncome) * 100) : 0;
                return (
                  <div key={cat.kategori} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-text-primary)] font-medium">{cat.label}</span>
                      <span className="font-mono font-bold text-[var(--color-text-primary)] tabular-nums">
                        {formatRupiah(cat.amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--color-primary)] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('pemasukan')}
            className="mt-5 w-full py-2 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface-subtle)] hover:bg-slate-200 rounded-[var(--radius-sm)] border border-[var(--color-border)] transition-colors cursor-pointer"
          >
            Lihat Buku Pemasukan Lengkap
          </button>
        </div>

        {/* Pengeluaran Breakdown */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                Rincian Alokasi Pengeluaran
              </h3>
              <span className="text-xs font-mono font-bold text-rose-700">
                {formatRupiah(totalExpense)}
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {expenseCategories.map((cat) => {
                const percent = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
                return (
                  <div key={cat.kategori} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--color-text-primary)] font-medium">{cat.label}</span>
                      <span className="font-mono font-bold text-[var(--color-text-primary)] tabular-nums">
                        {formatRupiah(cat.amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('pengeluaran')}
            className="mt-5 w-full py-2 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface-subtle)] hover:bg-slate-200 rounded-[var(--radius-sm)] border border-[var(--color-border)] transition-colors cursor-pointer"
          >
            Lihat Buku Pengeluaran Lengkap
          </button>
        </div>
      </div>
    </div>
  );
};
