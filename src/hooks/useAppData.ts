import { useState, useEffect } from 'react';
import { Resident, JimpitanRecord, CashTransaction } from '../types';
import { initialResidents } from '../data/residents';
import { initialJimpitanRecords, initialCashTransactions } from '../data/transactions';
import { DataService } from '../services/dataService';
import { STORAGE_KEYS } from '../services/offlineQueue';

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
      const shouldUpdate = isMounted && records.length > 0;
      if (shouldUpdate) setJimpitanRecords(records);
    });

    DataService.getKasTransactions().then((txs) => {
      const shouldUpdate = isMounted && txs.length > 0;
      if (shouldUpdate) setCashTransactions(txs);
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
