import { TransactionCategory } from '../types';

export const JIMPITAN_PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

export const DEFAULT_JIMPITAN_AMOUNT = 2000;

export const INCOME_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'jimpitan', label: 'Rekap Jimpitan Ronda BDA' },
  { value: 'kas_rt', label: 'Iuran Wajib Pengelolaan Lingkungan' },
  { value: 'donasi', label: 'Donasi & Sumbangan Warga BDA' },
  { value: 'iuran_warga', label: 'Iuran Sosial & Duka Warga' },
  { value: 'lainnya', label: 'Pemasukan Lain-lain' },
];

export const EXPENSE_CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'perlengkapan_ronda', label: 'Konsumsi & Perlengkapan Pos Ronda BDA' },
  { value: 'kebersihan', label: 'Honor Kebersihan & Pengangkut Sampah' },
  { value: 'keamanan', label: 'Operasional Keamanan Lingkungan' },
  { value: 'perbaikan_fasilitas', label: 'Pemeliharaan Lampu Jalan & Gapura' },
  { value: 'kegiatan_warga', label: 'Kegiatan Paguyuban Warga BDA' },
  { value: 'lainnya', label: 'Pengeluaran Lain-lain' },
];

export const RESIDENTIAL_INFO = {
  nama: 'Perum BDA',
  namaLengkap: 'Perumahan Bumi Dukuh Asri',
  daerah: 'Sukoharjo, Jawa Tengah',
  tahunBerdiri: '2016',
  rt: '02',
  rw: '07',
  totalKeluargaAktif: 50,
  defaultTarifJimpitan: 2000,
  targetHarianJimpitan: 100000, // 50 KK * Rp 2.000
  logoUrl: '/bda-logo.jpg',
};
