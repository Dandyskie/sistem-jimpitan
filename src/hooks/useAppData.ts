import { useState, useEffect } from 'react';
import { Resident, JimpitanRecord, CashTransaction } from '../types';
import { initialResidents } from '../data/residents';
import { initialJimpitanRecords, initialCashTransactions } from '../data/transactions';
import { DataService } from '../services/dataService';
import { STORAGE_KEYS } from '../services/offlineQueue';

const CACHE_VERSION = 'v2_fresh_5warga';

// Reset cache lama jika versi sampel data diperbarui
function checkAndInvalidateLegacyCache(todayDate: string) {
  try {
    if (localStorage.getItem('bda_cache_version') !== CACHE_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.WARGA_CACHE);
      localStorage.removeItem(STORAGE_KEYS.KAS_CACHE);
      localStorage.removeItem(`${STORAGE_KEYS.JIMPITAN_CACHE}_${todayDate}`);
      localStorage.setItem('bda_cache_version', CACHE_VERSION);
    }
  } catch {}
}

// Baca cache awal dari localStorage
function readInitialCache<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function useAppData(todayDate: string) {
  checkAndInvalidateLegacyCache(todayDate);

  const [residents, setResidents] = useState<Resident[]>(() =>
    readInitialCache(STORAGE_KEYS.WARGA_CACHE, initialResidents)
  );

  const [jimpitanRecords, setJimpitanRecords] = useState<JimpitanRecord[]>(() =>
    readInitialCache(`${STORAGE_KEYS.JIMPITAN_CACHE}_${todayDate}`, initialJimpitanRecords)
  );

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    readInitialCache(STORAGE_KEYS.KAS_CACHE, initialCashTransactions)
  );

  // Inisialisasi data dari database cloud Supabase
  useEffect(() => {
    let isMounted = true;

    // Sinkronisasi data cloud saat komponen dimuat
    DataService.getResidents().then((data) => {
      const shouldUpdate = isMounted && data.length > 0;
      if (shouldUpdate) setResidents(data);
    });

    DataService.getJimpitanRecordsByDate(todayDate).then((records) => {
      if (isMounted) setJimpitanRecords(records);
    });

    DataService.getKasTransactions().then((txs) => {
      if (isMounted) setCashTransactions(txs);
    });

    // Berlangganan perubahan realtime Supabase
    const unsubscribe = DataService.subscribeToRealtimeChanges(async (table) => {
      if (!isMounted) return;

      switch (table) {
        case 'jimpitan_records': {
          const records = await DataService.getJimpitanRecordsByDate(todayDate);
          if (isMounted) setJimpitanRecords(records);
          break;
        }
        case 'warga': {
          const data = await DataService.getResidents();
          if (isMounted) setResidents(data);
          break;
        }
        case 'kas_transactions': {
          const txs = await DataService.getKasTransactions();
          if (isMounted) setCashTransactions(txs);
          break;
        }
        default:
          break;
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [todayDate]);

  return {
    residents,
    setResidents,
    jimpitanRecords,
    setJimpitanRecords,
    cashTransactions,
    setCashTransactions,
  };
}
