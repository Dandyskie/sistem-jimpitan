import { Resident, TipeIuran, StatusBulanan } from '../types';

// Daftar nama warga terdaftar untuk sampel data
const KNOWN_NAMES: Record<string, { nama: string; tipe?: TipeIuran; statusBulanan?: StatusBulanan; catatan?: string }> = {
  'res-a-01': { nama: 'Bpk. Joko Susilo', catatan: 'Kaleng jimpitan di atas meteran air' },
  'res-a-02': { nama: 'Bpk. Hendra Gunawan' },
  'res-a-03': { nama: 'Ibu Siti Rahma', catatan: 'Sedang dinas luar kota' },
  'res-a-04': { nama: 'Bpk. Doni Kusuma', catatan: 'Sering melebihkan uang jimpitan' },
  'res-a-05': { nama: 'Bpk. Bambang Pamungkas' },
  'res-a-06': { nama: 'Ibu Rina Wijaya' },
  'res-a-07': { nama: 'Bpk. Agus Setiawan' },
  'res-a-08': { nama: 'Bpk. Slamet Riyadi' },
  'res-a-09': { nama: 'Ibu Ratna Dewi' },
  'res-a-10': { nama: 'Bpk. Budi Santoso', tipe: 'bulanan', statusBulanan: 'lunas' },
  'res-b-01': { nama: 'Bpk. Ahmad Fauzi' },
  'res-b-02': { nama: 'Ibu Dewi Lestari' },
  'res-b-05': { nama: 'Bpk. Eko Prasetyo', tipe: 'bulanan', statusBulanan: 'lunas' },
  'res-b-08': { nama: 'Bpk. Mulyadi (Bendahara)' },
  'res-c-01': { nama: 'Bpk. Sutrisno (Ketua RT)' },
  'res-c-10': { nama: 'Bpk. Hendro Siswanto', tipe: 'bulanan', statusBulanan: 'lunas' },
  'res-d-01': { nama: 'Bpk. Dedi Supriyadi' },
  'res-d-08': { nama: 'Bpk. Wahyu Triantoro' },
  'res-d-09': { nama: 'Ibu Yayuk Basuki' },
  'res-d-10': { nama: 'Bpk. Zainal Abidin' },
  'res-e-01': { nama: 'Bpk. Arif Wibowo' },
  'res-e-05': { nama: 'Bpk. Gunawan Wibisono', tipe: 'bulanan', statusBulanan: 'lunas' },
};

const BLOCKS_CONFIG = [
  { prefix: 'a', name: 'Blok A', count: 35 },
  { prefix: 'b', name: 'Blok B', count: 35 },
  { prefix: 'c', name: 'Blok C', count: 35 },
  { prefix: 'd', name: 'Blok D', count: 35 },
  { prefix: 'e', name: 'Blok E', count: 30 },
];

function generate170Residents(): Resident[] {
  const result: Resident[] = [];
  let ruteIndex = 1;

  for (const block of BLOCKS_CONFIG) {
    for (let i = 1; i <= block.count; i++) {
      const numStr = String(i).padStart(2, '0');
      const id = `res-${block.prefix}-${numStr}`;
      const known = KNOWN_NAMES[id];

      const nama = known?.nama || `Bpk. Warga ${block.name} No. ${numStr}`;
      const tipeIuran: TipeIuran = known?.tipe || (i % 8 === 0 ? 'bulanan' : 'harian');
      const statusBulanan: StatusBulanan = known?.statusBulanan || (tipeIuran === 'bulanan' ? 'lunas' : 'belum_lunas');
      const isLunasBulanan = tipeIuran === 'bulanan' && statusBulanan === 'lunas';

      // Variasi status bayar untuk data awal
      const isPaidToday = isLunasBulanan || (i % 3 !== 0);

      result.push({
        id,
        nama,
        noRumah: numStr,
        blok: block.name,
        rt: '02',
        rw: '07',
        noHp: `08123456${block.prefix.charCodeAt(0)}${numStr}`,
        status: 'aktif',
        tipe_iuran: tipeIuran,
        tipeIuran,
        status_bulanan: statusBulanan,
        statusBulanan,
        nominal_bulanan: 20000,
        nominalBulanan: 20000,
        urutan_rute: ruteIndex++,
        statusPembayaranBulanIni: isPaidToday ? 'lunas' : 'belum_bayar',
        statusTarikanMalamIni: isLunasBulanan ? 'bulanan_lunas' : isPaidToday ? 'lunas' : 'belum',
        totalKontribusi: isPaidToday ? 140000 : 90000,
        terakhirBayar: isPaidToday ? '2026-10-08' : '2026-10-05',
        catatan: known?.catatan,
      });
    }
  }

  return result;
}

export const initialResidents: Resident[] = generate170Residents();
