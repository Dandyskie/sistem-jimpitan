import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CashTransaction, JimpitanRecord } from '../types';
import { formatRupiah, formatTanggalLengkap, formatTanggalSingkat } from './formatters';

interface ExportReportOptions {
  periodeLabel: string;
  totalGrossIncome: number;
  totalExpenses: number;
  netBalance: number;
  jimpitanRecords: JimpitanRecord[];
  cashTransactions: CashTransaction[];
}

export function generateFinancialPDF(options: ExportReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('PAGUYUBAN WARGA BDA · RT 02 / RW 07 SUKOHARJO', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN KAS LINGKUNGAN & JIMPITAN', pageWidth / 2, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${options.periodeLabel}`, pageWidth / 2, 30, { align: 'center' });

  // Divider Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(14, 34, pageWidth - 14, 34);

  // Summary Metrics Table
  autoTable(doc, {
    startY: 38,
    head: [['TOTAL PEMASUKAN', 'TOTAL PENGELUARAN', 'SALDO BERSIH KAS']],
    body: [
      [
        formatRupiah(options.totalGrossIncome),
        formatRupiah(options.totalExpenses),
        formatRupiah(options.netBalance),
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [15, 23, 42],
    },
  });

  // Table Mutasi Pemasukan
  const incomeTransactions = options.cashTransactions.filter((t) => t.tipe === 'pemasukan');
  const incomeRows: any[] = [];

  // Jimpitan summary row
  const totalJimpitanAmount = options.jimpitanRecords.reduce((sum, r) => sum + r.nominal, 0);
  incomeRows.push([
    '1',
    'Akumulasi Tarikan Jimpitan Ronda Malam',
    `${options.jimpitanRecords.length} rumah`,
    'Petugas Ronda',
    formatRupiah(totalJimpitanAmount),
  ]);

  incomeTransactions.forEach((trx, idx) => {
    incomeRows.push([
      String(idx + 2),
      trx.deskripsi,
      formatTanggalSingkat(trx.tanggal),
      trx.penanggungJawab || trx.penanggung_jawab || 'Warga/Pengurus',
      formatRupiah(trx.nominal),
    ]);
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70);
  doc.text('A. Rincian Pemasukan Kas RT', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Uraian Pemasukan', 'Tanggal / Ket', 'Penanggung Jawab', 'Nominal']],
    body: incomeRows,
    theme: 'striped',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Table Mutasi Pengeluaran
  const expenseTransactions = options.cashTransactions.filter((t) => t.tipe === 'pengeluaran');
  const expenseRows = expenseTransactions.map((trx, idx) => [
    String(idx + 1),
    trx.deskripsi,
    formatTanggalSingkat(trx.tanggal),
    trx.penanggungJawab || trx.penanggung_jawab || 'Pengurus',
    formatRupiah(trx.nominal),
  ]);

  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(190, 18, 60);
  doc.text('B. Rincian Pengeluaran Operasional Lingkungan', 14, currentY);

  if (expenseRows.length === 0) {
    expenseRows.push(['-', 'Tidak ada pengeluaran pada periode ini', '-', '-', 'Rp 0']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Uraian Pengeluaran', 'Tanggal', 'Penanggung Jawab', 'Nominal']],
    body: expenseRows,
    theme: 'striped',
    headStyles: {
      fillColor: [190, 18, 60],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Signatures
  currentY = (doc as any).lastAutoTable.finalY + 14;
  if (currentY > 240) {
    doc.addPage();
    currentY = 25;
  }

  const colWidth = (pageWidth - 28) / 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  // Kolom 1
  doc.text('Mengetahui,', 14 + colWidth / 2, currentY, { align: 'center' });
  doc.text('Ketua RT 02 / RW 07', 14 + colWidth / 2, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('( Bpk. Bambang P. )', 14 + colWidth / 2, currentY + 22, { align: 'center' });

  // Kolom 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Dilaporkan Oleh,', 14 + colWidth * 1.5, currentY, { align: 'center' });
  doc.text('Koord. Siskamling / Ronda', 14 + colWidth * 1.5, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('( Bpk. Sutrisno )', 14 + colWidth * 1.5, currentY + 22, { align: 'center' });

  // Kolom 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Diverifikasi Oleh,', 14 + colWidth * 2.5, currentY, { align: 'center' });
  doc.text('Bendahara Kas BDA', 14 + colWidth * 2.5, currentY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('( Bpk. Mulyadi )', 14 + colWidth * 2.5, currentY + 22, { align: 'center' });

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen digital ini dicetak secara otomatis dari Sistem Jimpitan & Kas RT BDA pada ${formatTanggalLengkap(
      new Date().toISOString().split('T')[0]
    )}.`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`Laporan-Keuangan-RT-BDA-${options.periodeLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
