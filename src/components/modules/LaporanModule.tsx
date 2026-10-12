import React, { useState } from 'react';
import { JimpitanRecord, CashTransaction, Resident } from '../../types';
import { formatRupiah, formatTanggalLengkap } from '../../utils/formatters';
import { generateFinancialPDF } from '../../utils/pdfExport';
import { Printer, Download } from 'lucide-react';

interface LaporanModuleProps {
  jimpitanRecords: JimpitanRecord[];
  cashTransactions: CashTransaction[];
  residents: Resident[];
}

type PeriodeLaporan = 'harian' | 'mingguan' | 'bulanan';

/**
 * Modul Laporan Keuangan & Jimpitan Resmi (Format Cetak / PDF).
 */
export const LaporanModule: React.FC<LaporanModuleProps> = ({
  jimpitanRecords,
  cashTransactions,
}) => {
  const [periode, setPeriode] = useState<PeriodeLaporan>('bulanan');
  const selectedMonth = 'Oktober 2026';

  const todayDate = '2026-10-08';

  const filteredJimpitan = jimpitanRecords.filter((r) => {
    if (periode === 'harian') return r.tanggal === todayDate;
    if (periode === 'mingguan') return r.tanggal >= '2026-10-01' && r.tanggal <= '2026-10-08';
    return true;
  });

  const totalJimpitan = filteredJimpitan.reduce((s, r) => s + r.nominal, 0);

  const filteredCashIncome = cashTransactions.filter((t) => {
    if (t.tipe !== 'pemasukan') return false;
    if (periode === 'harian') return t.tanggal === todayDate;
    if (periode === 'mingguan') return t.tanggal >= '2026-10-01' && t.tanggal <= '2026-10-08';
    return true;
  });

  const filteredCashExpense = cashTransactions.filter((t) => {
    if (t.tipe !== 'pengeluaran') return false;
    if (periode === 'harian') return t.tanggal === todayDate;
    if (periode === 'mingguan') return t.tanggal >= '2026-10-01' && t.tanggal <= '2026-10-08';
    return true;
  });

  const totalOtherIncome = filteredCashIncome
    .filter((t) => t.kategori !== 'jimpitan')
    .reduce((s, t) => s + t.nominal, 0);

  const totalGrossIncome = totalJimpitan + totalOtherIncome;
  const totalExpenses = filteredCashExpense.reduce((s, t) => s + t.nominal, 0);
  const netBalance = totalGrossIncome - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const periodeLabel =
    periode === 'harian'
      ? `Harian (08 Oktober 2026)`
      : periode === 'mingguan'
      ? `Mingguan (01 - 08 Oktober 2026)`
      : `Bulanan (${selectedMonth})`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Toolbar (Hidden in Print) */}
      <div className="no-print bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
            Laporan Keuangan & Jimpitan Resmi
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Pilih periode laporan untuk rekap harian, mingguan, atau bulanan RT 02 / RW 07
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-[var(--color-surface-subtle)] p-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPeriode('harian')}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
                periode === 'harian' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Harian
            </button>
            <button
              type="button"
              onClick={() => setPeriode('mingguan')}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
                periode === 'mingguan' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => setPeriode('bulanan')}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors cursor-pointer ${
                periode === 'bulanan' ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Bulanan
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              generateFinancialPDF({
                periodeLabel,
                totalGrossIncome,
                totalExpenses,
                netBalance,
                jimpitanRecords: filteredJimpitan,
                cashTransactions: [
                  ...filteredCashIncome.filter((t) => t.kategori !== 'jimpitan'),
                  ...filteredCashExpense,
                ],
              });
            }}
            className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-9 px-3.5 rounded-[var(--radius-sm)] bg-[var(--color-text-primary)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Preview</span>
          </button>
        </div>
      </div>

      {/* 2. Official Printable Report Document */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header (Kop Surat Lingkungan) */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
            PAGUYUBAN WARGA BDA &middot; RT 02 / RW 07 SUKOHARJO
          </h3>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mt-1 uppercase tracking-tight">
            Laporan Rekapitulasi Kas & Jimpitan
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Periode: <span className="font-bold text-[var(--color-text-primary)]">{periodeLabel}</span>
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 my-6">
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">
              Total Pemasukan
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-[var(--color-primary)] mt-1 tabular-nums">
              {formatRupiah(totalGrossIncome)}
            </div>
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">
              Total Pengeluaran
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-700 mt-1 tabular-nums">
              {formatRupiah(totalExpenses)}
            </div>
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-primary-dark)] text-white text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              Saldo Bersih Kas
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-1 tabular-nums">
              {formatRupiah(netBalance)}
            </div>
          </div>
        </div>

        {/* Section A: Pemasukan */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              A. Rincian Pemasukan Kas
            </h4>
            <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
              {formatRupiah(totalGrossIncome)}
            </span>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr>
                <td className="py-2 text-[var(--color-text-primary)] font-medium">
                  1. Akumulasi Tarikan Jimpitan Ronda Warga ({filteredJimpitan.length} tarikan)
                </td>
                <td className="py-2 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                  {formatRupiah(totalJimpitan)}
                </td>
              </tr>
              {filteredCashIncome
                .filter((t) => t.kategori !== 'jimpitan')
                .map((trx, idx) => (
                  <tr key={trx.id}>
                    <td className="py-2 text-[var(--color-text-primary)] font-medium">
                      {idx + 2}. {trx.deskripsi} ({trx.penanggungJawab})
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                      {formatRupiah(trx.nominal)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Section B: Pengeluaran */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              B. Rincian Pengeluaran Operasional Lingkungan
            </h4>
            <span className="text-xs font-mono font-bold text-rose-700">
              {formatRupiah(totalExpenses)}
            </span>
          </div>

          <table className="w-full text-xs">
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredCashExpense.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-2 text-[var(--color-text-secondary)] italic">
                    Tidak ada transaksi pengeluaran pada periode ini
                  </td>
                </tr>
              ) : (
                filteredCashExpense.map((trx, idx) => (
                  <tr key={trx.id}>
                    <td className="py-2 text-[var(--color-text-primary)] font-medium">
                      {idx + 1}. {trx.deskripsi} ({trx.penanggungJawab})
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                      {formatRupiah(trx.nominal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures for Validity */}
        <div className="pt-8 border-t border-[var(--color-border)] grid grid-cols-3 text-center text-xs">
          <div>
            <p className="text-[var(--color-text-secondary)]">Mengetahui,</p>
            <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">Ketua RT 02</p>
            <div className="h-16" />
            <p className="font-bold text-[var(--color-text-primary)] underline">( Bpk. Bambang P. )</p>
          </div>

          <div>
            <p className="text-[var(--color-text-secondary)]">Dilaporkan Oleh,</p>
            <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">Koord. Siskamling / Ronda</p>
            <div className="h-16" />
            <p className="font-bold text-[var(--color-text-primary)] underline">( Bpk. Sutrisno )</p>
          </div>

          <div>
            <p className="text-[var(--color-text-secondary)]">Diverifikasi Oleh,</p>
            <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">Bendahara RT 02</p>
            <div className="h-16" />
            <p className="font-bold text-[var(--color-text-primary)] underline">( Bpk. Mulyadi )</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-dashed border-[var(--color-border)] text-center text-[10px] text-[var(--color-text-secondary)] font-mono">
          Dicetak otomatis melalui Sistem Jimpitan & Kas Lingkungan RT 02 / RW 07 pada {formatTanggalLengkap('2026-10-08')}
        </div>
      </div>
    </div>
  );
};

export default LaporanModule;
