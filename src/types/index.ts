export type Role = 'petugas_ronda' | 'bendahara' | 'petugas';

export type PaymentStatus = 'lunas' | 'belum_bayar' | 'sebagian' | 'kosong';

export type ResidentStatus = 'aktif' | 'nonaktif';

export type TipeIuran = 'harian' | 'bulanan';

export type StatusBulanan = 'lunas' | 'belum_lunas';

export type VerificationStatus = 'pending' | 'verified' | 'flagged';

// --- PROFILES (auth.users extension) ---
export interface Profile {
  id: string; // references auth.users(id)
  nama: string;
  role: 'petugas' | 'bendahara';
  no_hp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  nama: string;
  usernameOrEmail: string;
  role: Role;
  jabatan: string;
}

// --- WARGA (Supabase Schema 170 Rumah Perumahan) ---
export interface Warga {
  id: string;
  nama: string;
  blok: string; // 'A', 'B', 'C', 'D', 'E'
  no_rumah: string; // '01', '02', '12A'
  rt: string; // bawaan '02'
  rw: string; // bawaan '07'
  no_hp?: string | null;
  tipe_iuran: TipeIuran; // 'harian' | 'bulanan'
  status_bulanan: StatusBulanan; // 'lunas' | 'belum_lunas'
  nominal_bulanan: number; // standar 20000
  urutan_rute: number; // 1 s/d 170
  status: ResidentStatus; // 'aktif' | 'nonaktif'
  created_at?: string;
  updated_at?: string;
}

// Resident interface with full backwards-compatibility for existing UI components & mock data
export interface Resident {
  id: string;
  nama: string;
  noRumah: string; // alias for no_rumah
  blok: string;
  rt: string;
  rw: string;
  noHp?: string;
  status: ResidentStatus;
  statusPembayaranBulanIni: PaymentStatus;
  totalKontribusi: number;
  terakhirBayar?: string; // YYYY-MM-DD
  catatan?: string;

  // Supabase database properties
  no_rumah?: string;
  no_hp?: string | null;
  tipe_iuran?: TipeIuran;
  status_bulanan?: StatusBulanan;
  nominal_bulanan?: number;
  urutan_rute?: number;
  tipeIuran?: TipeIuran;
  statusBulanan?: StatusBulanan;
  nominalBulanan?: number;
  urutanRute?: number;
  created_at?: string;
  updated_at?: string;

  // Field status tarikan harian malam ini (computed)
  statusTarikanMalamIni?: 'lunas' | 'kosong' | 'sebagian' | 'bulanan_lunas' | 'belum';
  nominalTarikanMalamIni?: number;
}

// Fungsi adapter untuk konversi baris database Warga ke model antarmuka Resident
export function adaptWargaToResident(w: Warga): Resident {
  const blokFormatted = w.blok.startsWith('Blok ') ? w.blok : `Blok ${w.blok}`;
  const isBulananLunas = w.tipe_iuran === 'bulanan' && w.status_bulanan === 'lunas';

  return {
    id: w.id,
    nama: w.nama,
    blok: blokFormatted,
    noRumah: w.no_rumah,
    no_rumah: w.no_rumah,
    rt: w.rt,
    rw: w.rw,
    noHp: w.no_hp || undefined,
    no_hp: w.no_hp,
    status: w.status,
    tipe_iuran: w.tipe_iuran,
    tipeIuran: w.tipe_iuran,
    status_bulanan: w.status_bulanan,
    statusBulanan: w.status_bulanan,
    nominal_bulanan: w.nominal_bulanan,
    nominalBulanan: w.nominal_bulanan,
    urutan_rute: w.urutan_rute,
    urutanRute: w.urutan_rute,
    statusPembayaranBulanIni: isBulananLunas ? 'lunas' : 'belum_bayar',
    totalKontribusi: isBulananLunas ? w.nominal_bulanan : 0,
    statusTarikanMalamIni: isBulananLunas ? 'bulanan_lunas' : 'belum',
    created_at: w.created_at,
    updated_at: w.updated_at,
  };
}

// --- JIMPITAN RECORDS (Tarikan Harian Petugas Ronda) ---
export interface JimpitanRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  nominal: number;
  status: PaymentStatus;
  catatan?: string | null;
  created_at?: string;

  // Primary identifiers (compatible with both Supabase and Legacy views)
  warga_id?: string;
  petugas_id?: string;
  petugas_nama?: string | null;

  // Legacy fields preserved as non-optional for full backwards compatibility
  residentId: string;
  residentName: string;
  noRumah: string;
  blok: string;
  petugas: string;
  waktuInput: string; // HH:mm:ss
  is_offline?: boolean; // Flag to indicate pending sync
}

// --- DAILY VERIFICATIONS (Rekonsiliasi Serah Terima Petugas -> Bendahara) ---
export interface DailyVerification {
  id: string;
  tanggal: string; // YYYY-MM-DD
  petugas_id: string;
  petugas_nama?: string | null;
  total_rumah_tercatat: number;
  total_nominal_sistem: number;
  actual_nominal_fisik?: number | null;
  selisih: number;
  status: VerificationStatus; // 'pending' | 'verified' | 'flagged'
  catatan_selisih?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at?: string;
}

// --- KAS TRANSACTIONS (Buku Kas Keuangan RT) ---
export type TransactionType = 'pemasukan' | 'pengeluaran';

export type TransactionCategory =
  | 'jimpitan'
  | 'jimpitan_harian'
  | 'iuran_bulanan'
  | 'kas_rt'
  | 'donasi'
  | 'iuran_warga'
  | 'perlengkapan_ronda'
  | 'kebersihan'
  | 'keamanan'
  | 'kegiatan_warga'
  | 'perbaikan_fasilitas'
  | 'lainnya';

export interface KasTransaction {
  id: string;
  tipe: TransactionType;
  kategori: TransactionCategory;
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  deskripsi: string;
  penanggungJawab: string;
  penanggung_jawab?: string;
  warga_id?: string | null;
  buktiUrl?: string;
  bukti_url?: string | null;
  catatan?: string;
  waktuInput: string;
  created_by?: string;
  created_at?: string;
}

export type CashTransaction = KasTransaction;

// --- STATS & FINANCIAL SUMMARY ---
export interface DailyCollectionStats {
  tanggal: string;
  totalTerkumpul: number;
  targetHarian: number;
  jumlahWargaBayar: number;
  jumlahWargaBelumBayar: number;
  totalWarga: number;
  persentase: number;
}

export interface FinancialSummary {
  saldoKasSaatIni: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  totalJimpitanBulanIni: number;
  totalPemasukanLainnya: number;
  surplusDefisit: number;
}

// --- OFFLINE QUEUE ENGINE TYPES ---
export type OfflineMutationType =
  | 'UPSERT_JIMPITAN'
  | 'SUBMIT_VERIFICATION'
  | 'VERIFY_SETTLEMENT'
  | 'UPDATE_BULANAN'
  | 'ADD_KAS_TRANSACTION';

export interface OfflineQueueItem {
  id: string;
  type: OfflineMutationType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}
