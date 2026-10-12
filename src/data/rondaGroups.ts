/**
 * Definisi 7 Regu Petugas Ronda Bergilir Harian (Malam Senin s/d Malam Minggu)
 * Sistem Jimpitan Digital RT 02 / RW 07 Bumi Dukuh Asri.
 */

export interface RondaGroup {
  id: string;
  dayIndex: number; // 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
  hari: string;
  namaGrup: string;
  salam: string;
  koordinator: string;
  kontak: string;
}

export const DEFAULT_RONDA_GROUPS: RondaGroup[] = [
  {
    id: 'grp-senin',
    dayIndex: 1,
    hari: 'Senin',
    namaGrup: 'Grup Ronda Malam Senin',
    salam: 'Halo, Grup Ronda Malam Senin',
    koordinator: 'Bpk. Agus Santoso (A-01)',
    kontak: '0812-3456-7801',
  },
  {
    id: 'grp-selasa',
    dayIndex: 2,
    hari: 'Selasa',
    namaGrup: 'Grup Ronda Malam Selasa',
    salam: 'Halo, Grup Ronda Malam Selasa',
    koordinator: 'Bpk. Joko Susilo (A-04)',
    kontak: '0812-3456-7802',
  },
  {
    id: 'grp-rabu',
    dayIndex: 3,
    hari: 'Rabu',
    namaGrup: 'Grup Ronda Malam Rabu',
    salam: 'Halo, Grup Ronda Malam Rabu',
    koordinator: 'Bpk. Slamet Riyadi (B-01)',
    kontak: '0812-3456-7803',
  },
  {
    id: 'grp-kamis',
    dayIndex: 4,
    hari: 'Kamis',
    namaGrup: 'Grup Ronda Malam Kamis',
    salam: 'Halo, Grup Ronda Malam Kamis',
    koordinator: 'Bpk. Hendra Gunawan (C-01)',
    kontak: '0812-3456-7804',
  },
  {
    id: 'grp-jumat',
    dayIndex: 5,
    hari: 'Jumat',
    namaGrup: 'Grup Ronda Malam Jumat',
    salam: 'Halo, Grup Ronda Malam Jumat',
    koordinator: 'Bpk. Dedi Supriyadi (D-01)',
    kontak: '0812-3456-7805',
  },
  {
    id: 'grp-sabtu',
    dayIndex: 6,
    hari: 'Sabtu',
    namaGrup: 'Grup Ronda Malam Sabtu',
    salam: 'Halo, Grup Ronda Malam Sabtu',
    koordinator: 'Bpk. Budi Prasetyo (A-02)',
    kontak: '0812-3456-7806',
  },
  {
    id: 'grp-minggu',
    dayIndex: 0,
    hari: 'Minggu',
    namaGrup: 'Grup Ronda Malam Minggu',
    salam: 'Halo, Grup Ronda Malam Minggu',
    koordinator: 'Bpk. Wahyu Triantoro (D-08)',
    kontak: '0812-3456-7807',
  },
];

const STORAGE_KEY_RONDA_GROUPS = 'bda_ronda_groups_config';

/**
 * Ambil daftar 7 grup ronda (dengan dukungan kustomisasi bendahara dari localStorage).
 */
export function getSavedRondaGroups(): RondaGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RONDA_GROUPS);
    if (!raw) return DEFAULT_RONDA_GROUPS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 7 ? parsed : DEFAULT_RONDA_GROUPS;
  } catch {
    return DEFAULT_RONDA_GROUPS;
  }
}

/**
 * Simpan pembaruan daftar 7 grup ronda oleh bendahara.
 */
export function saveRondaGroupsConfig(groups: RondaGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RONDA_GROUPS, JSON.stringify(groups));
  } catch (err) {
    console.warn('Gagal menyimpan konfigurasi grup ronda:', err);
  }
}

/**
 * Dapatkan grup ronda yang bertugas hari ini berdasarkan hari tanggal saat ini.
 */
export function getTodayRondaGroup(dateStr?: string): RondaGroup {
  const groups = getSavedRondaGroups();
  const date = dateStr ? new Date(dateStr) : new Date();
  const currentDayIndex = isNaN(date.getTime()) ? new Date().getDay() : date.getDay();

  const found = groups.find((g) => g.dayIndex === currentDayIndex);
  return found || groups[0];
}
