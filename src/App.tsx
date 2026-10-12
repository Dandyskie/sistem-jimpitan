import React, { useState, useEffect } from 'react';
import { Resident, JimpitanRecord, CashTransaction, AuthUser } from './types';
import { DataService } from './services/dataService';
import { SyncProvider } from './context/SyncContext';
import { AuthProvider } from './context/AuthContext';
import { PetugasDashboard } from './components/ronda/PetugasDashboard';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LoginView } from './components/auth/LoginView';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { useAppData } from './hooks/useAppData';

export const AppContent: React.FC = () => {
  const todayDate = '2026-10-08';

  // Routing URL: '/' untuk Petugas Ronda, '/admin' untuk Bendahara
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') ? '/admin' : '/';
    }
    return '/';
  });

  const navigateUrl = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path.startsWith('/admin') ? '/admin' : '/');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path.startsWith('/admin') ? '/admin' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sesi Login Terpisah (LocalStorage)
  const [petugasUser, setPetugasUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('bda_petugas_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('bda_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // State repositori data terpusat
  const {
    residents,
    setResidents,
    jimpitanRecords,
    setJimpitanRecords,
    cashTransactions,
    setCashTransactions,
  } = useAppData(todayDate);

  // Notifikasi Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handlePetugasLogin = (user: AuthUser) => {
    setPetugasUser(user);
    try {
      localStorage.setItem('bda_petugas_session', JSON.stringify(user));
    } catch {}
    addToast(`Selamat bertugas ronda malam, ${user.nama}!`);
  };

  const handleAdminLogin = (user: AuthUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem('bda_admin_session', JSON.stringify(user));
    } catch {}
    addToast(`Selamat datang di Dashboard Bendahara, ${user.nama}!`);
  };

  const handlePetugasLogout = () => {
    setPetugasUser(null);
    try {
      localStorage.removeItem('bda_petugas_session');
    } catch {}
    addToast('Sesi petugas ronda telah keluar.', 'info');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('bda_admin_session');
    } catch {}
    addToast('Sesi admin bendahara telah keluar.', 'info');
  };

  // Jimpitan Handlers
  const handleSaveJimpitan = async (record: Omit<JimpitanRecord, 'id' | 'waktuInput'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: JimpitanRecord = {
      ...record,
      id: `jmp-${Date.now()}-${record.residentId}`,
      waktuInput: timeStr,
      warga_id: record.residentId,
      petugas_id: petugasUser?.id || 'usr-ronda',
      petugas_nama: petugasUser?.nama || record.petugas,
    };

    setJimpitanRecords((prev) => [newRecord, ...prev.filter((r) => r.residentId !== newRecord.residentId)]);

    setResidents((prev) =>
      prev.map((r) => {
        if (r.id !== record.residentId) return r;
        return {
          ...r,
          totalKontribusi: r.totalKontribusi + record.nominal,
          terakhirBayar: record.status === 'lunas' ? record.tanggal : r.terakhirBayar,
          statusPembayaranBulanIni: record.status === 'lunas' ? 'lunas' : r.statusPembayaranBulanIni,
          statusTarikanMalamIni: record.status === 'lunas' ? 'lunas' : 'kosong',
        };
      })
    );

    await DataService.saveJimpitanRecord(newRecord);
    addToast(`Tarikan ${record.residentName} berhasil dicatat.`);
  };

  const handleUpdateJimpitan = async (id: string, updates: Partial<JimpitanRecord>) => {
    setJimpitanRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        DataService.saveJimpitanRecord(updated);
        return updated;
      })
    );
    addToast('Data tarikan jimpitan berhasil diperbarui.');
  };

  // Warga Handlers
  const handleAddResident = (residentData: Omit<Resident, 'id'>) => {
    const newResident: Resident = {
      ...residentData,
      id: `res-manual-${Date.now()}`,
    };
    setResidents((prev) => [newResident, ...prev]);
    addToast(`Data warga ${newResident.nama} berhasil ditambahkan.`);
  };

  const handleUpdateResident = (id: string, updates: Partial<Resident>) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addToast('Data warga berhasil diperbarui.');
  };

  const handleDeleteResident = (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
    addToast('Data warga berhasil dihapus.', 'info');
  };

  // Kas Handlers
  const handleAddCashTransaction = async (trxData: Omit<CashTransaction, 'id' | 'waktuInput'>) => {
    const newTrx: CashTransaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      waktuInput: new Date().toLocaleTimeString('id-ID'),
      created_by: adminUser?.id || 'usr-bendahara',
    };

    setCashTransactions((prev) => [newTrx, ...prev]);
    await DataService.addKasTransaction(newTrx);
    addToast(`Transaksi ${newTrx.deskripsi} berhasil dibukukan.`);
  };

  const handleDeleteCashTransaction = (id: string) => {
    setCashTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('Transaksi kas berhasil dihapus.', 'info');
  };

  const handleUpdateAdminRole = (newRoleTitle: string) => {
    if (!adminUser) return;
    const updated: AuthUser = { ...adminUser, jabatan: newRoleTitle };
    setAdminUser(updated);
    try {
      localStorage.setItem('bda_admin_session', JSON.stringify(updated));
    } catch {}
    addToast('Peran jabatan bendahara berhasil diperbarui.');
  };

  // Halaman Admin: Tampilkan form login jika belum diautentikasi
  if (currentPath === '/admin' && !adminUser) {
    return (
      <>
        <LoginView expectedRole="bendahara" onLogin={handleAdminLogin} onNavigateUrl={navigateUrl} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Halaman Admin: Tampilkan dashboard jika sudah diautentikasi
  if (currentPath === '/admin' && adminUser) {

    return (
      <>
        <AdminDashboardView
          currentUser={adminUser}
          residents={residents}
          todayDate={todayDate}
          jimpitanRecords={jimpitanRecords}
          cashTransactions={cashTransactions}
          onAddResident={handleAddResident}
          onUpdateResident={handleUpdateResident}
          onDeleteResident={handleDeleteResident}
          onAddCashTransaction={handleAddCashTransaction}
          onDeleteCashTransaction={handleDeleteCashTransaction}
          onUpdateRole={handleUpdateAdminRole}
          onLogout={handleAdminLogout}
          onNavigateUrl={navigateUrl}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Tampilan Halaman Petugas Ronda (Rute Standar)
  if (!petugasUser) {
    return (
      <>
        <LoginView expectedRole="petugas_ronda" onLogin={handlePetugasLogin} onNavigateUrl={navigateUrl} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <>
      <PetugasDashboard
        currentUser={petugasUser}
        residents={residents}
        todayDate={todayDate}
        jimpitanRecords={jimpitanRecords}
        onSaveJimpitan={handleSaveJimpitan}
        onUpdateJimpitan={handleUpdateJimpitan}
        onLogout={handlePetugasLogout}
        onNavigateUrl={navigateUrl}
      />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <SyncProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SyncProvider>
  );
};

export default App;
