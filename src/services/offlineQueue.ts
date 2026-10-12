import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  JimpitanRecord,
  DailyVerification,
  KasTransaction,
  OfflineQueueItem,
  OfflineMutationType,
  SyncStatus,
} from '../types';

export const STORAGE_KEYS = {
  WARGA_CACHE: 'bda_warga_cache_v2',
  JIMPITAN_CACHE: 'bda_jimpitan_records_v2',
  VERIF_CACHE: 'bda_daily_verifications_v2',
  KAS_CACHE: 'bda_cash_transactions_v2',
  OFFLINE_QUEUE: 'bda_offline_queue_v2',
  LAST_SYNC: 'bda_last_sync_timestamp',
};

// Status awal sinkronisasi data
const syncStatusState: SyncStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncedAt: typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_SYNC) : null,
};

type SyncListener = (status: SyncStatus) => void;
const syncListeners: Set<SyncListener> = new Set();

function notifySyncListeners(): void {
  syncListeners.forEach((listener) => {
    listener({ ...syncStatusState });
  });
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener({ ...syncStatusState });
  return () => {
    syncListeners.delete(listener);
  };
}

export function getSyncStatus(): SyncStatus {
  return { ...syncStatusState };
}

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    syncStatusState.pendingCount = queue.length;
    notifySyncListeners();
  } catch (err) {
    console.error('Gagal menyimpan antrean offline:', err);
  }
}

export function enqueueOfflineMutation(
  type: OfflineMutationType,
  payload: any
): OfflineQueueItem {
  const queue = getOfflineQueue();
  const item: OfflineQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  };
  queue.push(item);
  saveOfflineQueue(queue);
  return item;
}

// Fungsi eksekusi mutasi tunggal ke Supabase (tanpa nested if)
// Eksekusi item mutasi tunggal dengan switch case agar bersih tanpa nested if
async function processSingleMutation(item: OfflineQueueItem): Promise<void> {
  if (!supabase) return;

  switch (item.type) {
    case 'UPSERT_JIMPITAN': {
      const rec: JimpitanRecord = item.payload;
      const { error } = await supabase.from('jimpitan_records').upsert(
        {
          warga_id: rec.warga_id || rec.residentId,
          tanggal: rec.tanggal,
          nominal: rec.nominal,
          status: rec.status,
          petugas_id: rec.petugas_id || 'usr-ronda',
          petugas_nama: rec.petugas_nama || rec.petugas || 'Petugas Ronda',
          catatan: rec.catatan,
        },
        { onConflict: 'warga_id,tanggal' }
      );
      if (error) throw error;
      break;
    }

    case 'SUBMIT_VERIFICATION': {
      const verif: DailyVerification = item.payload;
      const { error } = await supabase.from('daily_verifications').upsert(
        {
          tanggal: verif.tanggal,
          petugas_id: verif.petugas_id,
          petugas_nama: verif.petugas_nama,
          total_rumah_tercatat: verif.total_rumah_tercatat,
          total_nominal_sistem: verif.total_nominal_sistem,
          actual_nominal_fisik: verif.actual_nominal_fisik,
          selisih: verif.selisih,
          status: verif.status,
          catatan_selisih: verif.catatan_selisih,
        },
        { onConflict: 'tanggal' }
      );
      if (error) throw error;
      break;
    }

    case 'VERIFY_SETTLEMENT': {
      const { id, actual_nominal_fisik, status, catatan_selisih, verified_by } = item.payload;
      const { error } = await supabase
        .from('daily_verifications')
        .update({
          actual_nominal_fisik,
          status,
          catatan_selisih,
          verified_by,
          verified_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      break;
    }

    case 'UPDATE_BULANAN': {
      const { wargaId, statusBulanan } = item.payload;
      const { error } = await supabase
        .from('warga')
        .update({ status_bulanan: statusBulanan })
        .eq('id', wargaId);
      if (error) throw error;
      break;
    }

    case 'ADD_KAS_TRANSACTION': {
      const tx: KasTransaction = item.payload;
      const { error } = await supabase.from('kas_transactions').insert({
        tipe: tx.tipe,
        kategori: tx.kategori,
        nominal: tx.nominal,
        tanggal: tx.tanggal,
        deskripsi: tx.deskripsi,
        penanggung_jawab: tx.penanggung_jawab || tx.penanggungJawab,
        warga_id: tx.warga_id,
        bukti_url: tx.bukti_url || tx.buktiUrl,
        created_by: tx.created_by,
      });
      if (error) throw error;
      break;
    }

    default:
      break;
  }
}

export async function flushOfflineQueue(): Promise<{ success: number; failed: number }> {
  const canSync = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
  if (!canSync) {
    return { success: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  syncStatusState.isSyncing = true;
  notifySyncListeners();

  let successCount = 0;
  let failedCount = 0;
  const remainingQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    item.status = 'syncing';
    try {
      await processSingleMutation(item);
      successCount++;
    } catch (err: any) {
      console.error(`Gagal memproses item antrean ${item.id}:`, err);
      item.retryCount += 1;
      item.status = 'failed';
      item.error = err?.message || 'Sinkronisasi gagal';
      remainingQueue.push(item);
      failedCount++;
    }
  }

  saveOfflineQueue(remainingQueue);
  syncStatusState.isSyncing = false;

  const now = new Date().toISOString();
  syncStatusState.lastSyncedAt = now;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
  } catch {}

  notifySyncListeners();
  return { success: successCount, failed: failedCount };
}

// Deteksi otomatis status jaringan online dan offline
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncStatusState.isOnline = true;
    notifySyncListeners();
    flushOfflineQueue();
  });

  window.addEventListener('offline', () => {
    syncStatusState.isOnline = false;
    notifySyncListeners();
  });
}
