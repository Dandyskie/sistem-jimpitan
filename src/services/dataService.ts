import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Resident, Warga, adaptWargaToResident, JimpitanRecord } from '../types';
import { initialResidents } from '../data/residents';
import { initialJimpitanRecords } from '../data/transactions';
import {
  STORAGE_KEYS,
  enqueueOfflineMutation,
  getOfflineQueue,
  flushOfflineQueue,
  getSyncStatus,
  subscribeSyncStatus,
} from './offlineQueue';
import { subscribeToRealtimeChanges } from './realtimeSync';
import { KasService } from './kasService';

export {
  getSyncStatus,
  subscribeSyncStatus,
  flushOfflineQueue,
  enqueueOfflineMutation,
  getOfflineQueue,
  KasService,
};

// Ambil data warga dari Supabase
async function fetchOnlineResidents(): Promise<Resident[] | null> {
  try {
    const { data, error } = await supabase!
      .from('warga')
      .select('*')
      .order('urutan_rute', { ascending: true })
      .limit(5);

    if (error || !data || data.length === 0) return null;

    const adapted = data.map((w: Warga) => adaptWargaToResident(w));
    try {
      localStorage.setItem(STORAGE_KEYS.WARGA_CACHE, JSON.stringify(adapted));
    } catch {}
    return adapted;
  } catch (err) {
    console.warn('Gagal mengambil warga dari Supabase:', err);
    return null;
  }
}

// Baca cache warga dari penyimpanan lokal
function readCachedResidents(): Resident[] | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.WARGA_CACHE);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

// Ambil catatan jimpitan dari Supabase berdasarkan tanggal
async function fetchOnlineJimpitan(tanggal: string): Promise<JimpitanRecord[] | null> {
  try {
    const { data, error } = await supabase!
      .from('jimpitan_records')
      .select('*')
      .eq('tanggal', tanggal);

    if (error || !data) return null;

    try {
      localStorage.setItem(`${STORAGE_KEYS.JIMPITAN_CACHE}_${tanggal}`, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err) {
    console.warn('Gagal mengambil jimpitan dari Supabase:', err);
    return null;
  }
}

// Baca cache jimpitan lokal atau fallback transaksi bawaan
function readCachedJimpitan(tanggal: string): JimpitanRecord[] {
  try {
    const cached = localStorage.getItem(`${STORAGE_KEYS.JIMPITAN_CACHE}_${tanggal}`);
    if (cached) return JSON.parse(cached);
  } catch {}
  return initialJimpitanRecords.filter((r) => r.tanggal === tanggal);
}

// Simpan jimpitan langsung ke Supabase
async function sendJimpitanOnline(record: JimpitanRecord): Promise<boolean> {
  try {
    const { error } = await supabase!.from('jimpitan_records').upsert(
      {
        warga_id: record.warga_id || record.residentId,
        tanggal: record.tanggal,
        nominal: record.nominal,
        status: record.status,
        petugas_id: record.petugas_id || 'usr-ronda',
        petugas_nama: record.petugas_nama || record.petugas || 'Petugas Ronda',
        catatan: record.catatan,
      },
      { onConflict: 'warga_id,tanggal' }
    );
    return !error;
  } catch (err) {
    console.warn('Koneksi gagal, beralih ke antrean offline:', err);
    return false;
  }
}

// Ambil riwayat jimpitan khusus warga dari Supabase
async function fetchOnlineJimpitanByResident(wargaId: string): Promise<JimpitanRecord[] | null> {
  try {
    const { data, error } = await supabase!
      .from('jimpitan_records')
      .select('*')
      .eq('warga_id', wargaId)
      .order('tanggal', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Gagal mengambil jimpitan warga dari Supabase:', err);
    return null;
  }
}

// Perbarui cache catatan jimpitan lokal
function updateLocalJimpitanCache(record: JimpitanRecord): void {
  try {
    const cacheKey = `${STORAGE_KEYS.JIMPITAN_CACHE}_${record.tanggal}`;
    const cachedRaw = localStorage.getItem(cacheKey);
    const list: JimpitanRecord[] = cachedRaw ? JSON.parse(cachedRaw) : [];
    const matchKey = record.warga_id || record.residentId;
    const index = list.findIndex((r) => (r.warga_id || r.residentId) === matchKey);

    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(cacheKey, JSON.stringify(list));
  } catch (err) {
    console.warn('Gagal memperbarui cache jimpitan:', err);
  }
}

export const DataService = {
  // Ambil daftar master 170 warga (cloud dengan fallback lokal)
  async getResidents(): Promise<Resident[]> {
    const canQueryOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineResidents = canQueryOnline ? await fetchOnlineResidents() : null;
    if (onlineResidents) return onlineResidents;

    const cachedResidents = readCachedResidents();
    if (cachedResidents) return cachedResidents;

    return initialResidents;
  },

  // Ambil catatan jimpitan berdasarkan tanggal ronda
  async getJimpitanRecordsByDate(tanggal: string): Promise<JimpitanRecord[]> {
    const canQueryOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineRecords = canQueryOnline ? await fetchOnlineJimpitan(tanggal) : null;
    let records = onlineRecords || readCachedJimpitan(tanggal);

    const queue = getOfflineQueue();
    const offlineItems = queue
      .filter((q) => q.type === 'UPSERT_JIMPITAN' && q.payload.tanggal === tanggal)
      .map((q) => ({ ...q.payload, is_offline: true } as JimpitanRecord));

    if (offlineItems.length > 0) {
      const recordMap = new Map<string, JimpitanRecord>();
      records.forEach((r) => recordMap.set(r.warga_id || r.residentId || r.id, r));
      offlineItems.forEach((r) => recordMap.set(r.warga_id || r.residentId || r.id, r));
      records = Array.from(recordMap.values());
    }

    return records;
  },

  // Ambil catatan jimpitan untuk satu rumah warga tertentu
  async getJimpitanRecordsByResident(residentId: string): Promise<JimpitanRecord[]> {
    const canQueryOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineRecords = canQueryOnline ? await fetchOnlineJimpitanByResident(residentId) : null;
    if (onlineRecords && onlineRecords.length > 0) return onlineRecords;

    const queue = getOfflineQueue();
    const offlineItems = queue
      .filter(
        (q) =>
          q.type === 'UPSERT_JIMPITAN' &&
          (q.payload.warga_id === residentId || q.payload.residentId === residentId)
      )
      .map((q) => q.payload as JimpitanRecord);

    const initialMatches = initialJimpitanRecords.filter(
      (r) => r.residentId === residentId || r.warga_id === residentId
    );

    return [...offlineItems, ...initialMatches];
  },

  // Simpan atau perbarui data tarikan jimpitan
  async saveJimpitanRecord(record: JimpitanRecord): Promise<JimpitanRecord> {
    const recordToSave: JimpitanRecord = {
      ...record,
      id: record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: record.created_at || new Date().toISOString(),
    };

    updateLocalJimpitanCache(recordToSave);

    const canSendOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const sentSuccessfully = canSendOnline ? await sendJimpitanOnline(recordToSave) : false;

    if (sentSuccessfully) {
      recordToSave.is_offline = false;
      return recordToSave;
    }

    recordToSave.is_offline = true;
    enqueueOfflineMutation('UPSERT_JIMPITAN', recordToSave);
    return recordToSave;
  },

  // Delegasi fungsi kas & rekonsiliasi ke KasService
  getDailyVerification: KasService.getDailyVerification,
  submitDailySettlement: KasService.submitDailySettlement,
  verifySettlement: KasService.verifySettlement,
  updateWargaBulananStatus: KasService.updateWargaBulananStatus,
  getKasTransactions: KasService.getKasTransactions,
  addKasTransaction: KasService.addKasTransaction,

  // Berlangganan perubahan realtime Supabase
  subscribeToRealtimeChanges,
};
