import { TransactionCategory, PaymentStatus } from '../types';

/**
 * Format currency to standard Indonesian Rupiah with clear tabular spacing
 * Example: 2000 -> "Rp 2.000", 1250000 -> "Rp 1.250.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rp ${formatted}`;
}

/**
 * Format date to Indonesian localized full date string
 * Example: "2026-10-08" -> "Kamis, 8 Oktober 2026"
 */
export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format date to short readable Indonesian date
 * Example: "2026-10-08" -> "8 Okt 2026"
 */
export function formatTanggalSingkat(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Get human-readable Indonesian label for categories
 */
export function getCategoryLabel(kategori: TransactionCategory): string {
  const map: Record<TransactionCategory, string> = {
    jimpitan: 'Jimpitan Ronda',
    jimpitan_harian: 'Jimpitan Harian',
    iuran_bulanan: 'Iuran Bulanan Kas',
    kas_rt: 'Iuran Kas RT',
    donasi: 'Donasi / Sumbangan',
    iuran_warga: 'Iuran Sampah & Sosial',
    perlengkapan_ronda: 'Perlengkapan Ronda & Siskamling',
    kebersihan: 'Operasional Kebersihan',
    keamanan: 'Operasional Keamanan',
    kegiatan_warga: 'Kegiatan Warga / Acara',
    perbaikan_fasilitas: 'Perbaikan Lampu & Fasilitas',
    lainnya: 'Lain-lain',
  };
  return map[kategori] || kategori;
}

/**
 * Get human-readable Indonesian label for payment status
 */
export function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'lunas':
      return 'Lunas';
    case 'belum_bayar':
      return 'Belum Bayar';
    case 'sebagian':
      return 'Sebagian';
    default:
      return status;
  }
}
