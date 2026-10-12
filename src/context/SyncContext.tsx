import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SyncStatus } from '../types';
import { subscribeSyncStatus, getSyncStatus, flushOfflineQueue } from '../services/dataService';

interface SyncContextType extends SyncStatus {
  syncNow: () => Promise<{ success: number; failed: number }>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const syncNow = async () => {
    return await flushOfflineQueue();
  };

  return (
    <SyncContext.Provider value={{ ...syncStatus, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
