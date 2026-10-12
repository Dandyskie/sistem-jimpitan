import { JimpitanRecord, CashTransaction } from '../types';
import { initialResidents } from './residents';

// 38 houses that have paid today (2026-10-08) totaling Rp 185.000
const todayDate = '2026-10-08';
const paidResidentsToday = initialResidents.filter((r) => r.terakhirBayar === todayDate);

export const initialJimpitanRecords: JimpitanRecord[] = paidResidentsToday.map((res, index) => {
  // Give mostly Rp 2.000, with a few giving Rp 5.000, Rp 10.000, and one giving Rp 100.000 for total Rp 185.000
  // 38 houses:
  // 34 houses @ Rp 2.000 = 68.000
  // 2 houses @ Rp 5.000 = 10.000
  // 1 house @ Rp 7.000 = 7.000
  // 1 house (Doni Kusuma) @ Rp 100.000 (lebih saldo kas & jimpitan) = 100.000
  // Sum = 68.000 + 10.000 + 7.000 + 100.000 = 185.000
  let nominal = 2000;
  let catatan: string | undefined = undefined;

  if (res.id === 'res-a-04') {
    nominal = 100000;
    catatan = 'Setoran jimpitan & titip kas ronda';
  } else if (res.id === 'res-b-08' || res.id === 'res-c-01') {
    nominal = 5000;
    catatan = 'Lebihan Rp 3.000 untuk pos ronda';
  } else if (res.id === 'res-a-01') {
    nominal = 7000;
    catatan = 'Uang pas plus jimpitan tertinggal';
  }

  const hour = 20 + Math.floor(index / 12);
  const minute = (index * 3) % 60;
  const second = (index * 7) % 60;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

  return {
    id: `jmp-${res.id}-${todayDate}`,
    residentId: res.id,
    residentName: res.nama,
    noRumah: res.noRumah,
    blok: res.blok,
    tanggal: todayDate,
    nominal,
    status: 'lunas',
    petugas: 'Sutrisno & Tim Ronda BDA',
    waktuInput: timeStr,
    catatan,
  };
});

// Add records from previous day for history
initialJimpitanRecords.push(
  {
    id: 'jmp-hist-01',
    residentId: 'res-a-07',
    residentName: 'Bpk. Agus Setiawan',
    noRumah: '07',
    blok: 'Blok A',
    tanggal: '2026-10-07',
    nominal: 2000,
    status: 'lunas',
    petugas: 'Dedi Kurniawan',
    waktuInput: '21:15:00',
  },
  {
    id: 'jmp-hist-02',
    residentId: 'res-b-03',
    residentName: 'Ibu Nurul Hidayah',
    noRumah: '03',
    blok: 'Blok B',
    tanggal: '2026-10-07',
    nominal: 2000,
    status: 'lunas',
    petugas: 'Dedi Kurniawan',
    waktuInput: '21:28:00',
  },
  {
    id: 'jmp-hist-03',
    residentId: 'res-a-03',
    residentName: 'Ibu Siti Rahma',
    noRumah: '03',
    blok: 'Blok A',
    tanggal: '2026-10-07',
    nominal: 0,
    status: 'belum_bayar',
    petugas: 'Dedi Kurniawan',
    waktuInput: '22:05:00',
    catatan: 'Kaleng kosong (dinas luar)',
  }
);

// Cash ledger transactions matching:
// Pemasukan bulan ini: Rp 4.800.000
// Pengeluaran bulan ini: Rp 1.250.000
// Saldo kas saat ini: Rp 3.550.000
export const initialCashTransactions: CashTransaction[] = [
  {
    id: 'ctx-bda-01',
    tipe: 'pemasukan',
    kategori: 'kas_rt',
    deskripsi: 'Iuran Wajib Pengelolaan Lingkungan 50 KK (Oktober 2026)',
    nominal: 3500000,
    tanggal: '2026-10-02',
    penanggungJawab: 'Bendahara BDA (Bpk. Mulyadi)',
    catatan: 'Iuran rutin Rp 70.000 / KK',
    waktuInput: '09:00:00',
  },
  {
    id: 'ctx-bda-02',
    tipe: 'pemasukan',
    kategori: 'jimpitan',
    deskripsi: 'Rekap Setoran Jimpitan Ronda Malam (Akumulasi Minggu I)',
    nominal: 800000,
    tanggal: '2026-10-07',
    penanggungJawab: 'Koord. Ronda (Bpk. Sutrisno)',
    catatan: 'Disetorkan ke kas bendahara',
    waktuInput: '08:30:00',
  },
  {
    id: 'ctx-bda-03',
    tipe: 'pemasukan',
    kategori: 'donasi',
    deskripsi: 'Sumbangan Sukarela Warga untuk Kas Pos Ronda',
    nominal: 500000,
    tanggal: '2026-10-04',
    penanggungJawab: 'Bpk. Doni Kusuma (A-04)',
    catatan: 'Donasi kegiatan warga',
    waktuInput: '14:20:00',
  },
  {
    id: 'ctx-bda-04',
    tipe: 'pengeluaran',
    kategori: 'kebersihan',
    deskripsi: 'Honor Petugas Pengangkut Sampah & Kebersihan Lingkungan',
    nominal: 600000,
    tanggal: '2026-10-03',
    penanggungJawab: 'Seksi Lingkungan BDA',
    catatan: 'Operasional dua mingguan',
    waktuInput: '10:00:00',
  },
  {
    id: 'ctx-bda-05',
    tipe: 'pengeluaran',
    kategori: 'perbaikan_fasilitas',
    deskripsi: 'Penggantian 4 Unit Lampu LED Penerangan Jalan Gang BDA',
    nominal: 350000,
    tanggal: '2026-10-05',
    penanggungJawab: 'Bpk. Hendra (Seksi Pembangunan)',
    catatan: 'Nota Toko Listrik Terang Jaya',
    waktuInput: '16:45:00',
  },
  {
    id: 'ctx-bda-06',
    tipe: 'pengeluaran',
    kategori: 'perlengkapan_ronda',
    deskripsi: 'Logistik Pos Ronda (Kopi, Teh, Gula, Baterai Senter Siskamling)',
    nominal: 180000,
    tanggal: '2026-10-06',
    penanggungJawab: 'Petugas Ronda (Bpk. Sutrisno)',
    catatan: 'Struk warung sembako warga',
    waktuInput: '20:15:00',
  },
  {
    id: 'ctx-bda-07',
    tipe: 'pengeluaran',
    kategori: 'keamanan',
    deskripsi: 'Perbaikan Kunci Pintu Portal & Bel Masuk Siskamling',
    nominal: 120000,
    tanggal: '2026-10-07',
    penanggungJawab: 'Koord. Ronda',
    catatan: 'Servis gembok & kabel alarm',
    waktuInput: '11:30:00',
  },
];
