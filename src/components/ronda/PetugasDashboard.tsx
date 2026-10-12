import React, { useState, useMemo } from 'react';
import { Resident, JimpitanRecord, AuthUser, DailyVerification } from '../../types';
import { useSync } from '../../context/SyncContext';
import { DataService } from '../../services/dataService';
import { QRScanFlowModal } from '../qr/QRScanFlowModal';
import { WalletHeader } from './WalletHeader';
import { QuickTapHouseList } from './QuickTapHouseList';
import { RondaBottomSheet } from './RondaBottomSheet';
import { SelesaiRondaModal } from './SelesaiRondaModal';
import { PetugasRiwayatTab } from './PetugasRiwayatTab';
import { PetugasWargaTab } from './PetugasWargaTab';
import { FloatingBottomNav, PetugasTab } from './FloatingBottomNav';

interface PetugasDashboardProps {
  currentUser: AuthUser;
  residents: Resident[];
  todayDate: string;
  jimpitanRecords: JimpitanRecord[];
  onSaveJimpitan: (record: Omit<JimpitanRecord, 'id' | 'waktuInput'>) => void;
  onUpdateJimpitan: (id: string, updates: Partial<JimpitanRecord>) => void;
  onLogout: () => void;
  onNavigateUrl: (path: string) => void;
}

export const PetugasDashboard: React.FC<PetugasDashboardProps> = ({
  currentUser,
  residents,
  todayDate,
  jimpitanRecords,
  onSaveJimpitan,
  onUpdateJimpitan,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<PetugasTab>('beranda');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('semua');
  const [onlyDailyTarget, setOnlyDailyTarget] = useState(true);

  // State Modal Kustom & Setoran
  const [selectedResidentForCustom, setSelectedResidentForCustom] = useState<Resident | null>(null);
  const [customNominal, setCustomNominal] = useState(2000);
  const [customCatatan, setCustomCatatan] = useState('');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementNominalFisik, setSettlementNominalFisik] = useState('');
  const [settlementCatatan, setSettlementCatatan] = useState('');
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState(false);

  const { isOnline, pendingCount, isSyncing, syncNow } = useSync();

  const activeResidents = useMemo(() => {
    return residents.filter((r) => r.status === 'aktif');
  }, [residents]);

  const todayRecords = useMemo(() => {
    return jimpitanRecords.filter((r) => r.tanggal === todayDate);
  }, [jimpitanRecords, todayDate]);

  const recordByResidentId = useMemo(() => {
    const map = new Map<string, JimpitanRecord>();
    todayRecords.forEach((rec) => {
      map.set(rec.residentId || rec.warga_id || rec.id, rec);
    });
    return map;
  }, [todayRecords]);

  const totalCollectedToday = useMemo(() => {
    return todayRecords.reduce((sum, r) => sum + r.nominal, 0);
  }, [todayRecords]);

  const dailyTargetResidents = useMemo(() => {
    return activeResidents.filter(
      (r) => !(r.tipe_iuran === 'bulanan' && r.status_bulanan === 'lunas')
    );
  }, [activeResidents]);

  const monthlyPrepaidCount = useMemo(() => {
    return activeResidents.filter(
      (r) => r.tipe_iuran === 'bulanan' && r.status_bulanan === 'lunas'
    ).length;
  }, [activeResidents]);

  const recordedDailyCount = useMemo(() => {
    return dailyTargetResidents.filter((r) => recordByResidentId.has(r.id)).length;
  }, [dailyTargetResidents, recordByResidentId]);

  const totalDailyTargetHouses = dailyTargetResidents.length;
  const progressPercent = totalDailyTargetHouses > 0
    ? Math.round((recordedDailyCount / totalDailyTargetHouses) * 100)
    : 100;

  const filteredResidents = useMemo(() => {
    return activeResidents.filter((r) => {
      const matchBlock = selectedBlock === 'semua' || r.blok === selectedBlock;
      if (!matchBlock) return false;

      const isLunasBulanan = r.tipe_iuran === 'bulanan' && r.status_bulanan === 'lunas';
      if (onlyDailyTarget && isLunasBulanan) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        r.nama.toLowerCase().includes(q) ||
        r.noRumah.toLowerCase().includes(q) ||
        r.blok.toLowerCase().includes(q)
      );
    });
  }, [activeResidents, selectedBlock, onlyDailyTarget, searchQuery]);

  const handleQuickTap = (resident: Resident, status: 'lunas' | 'kosong', amount: number = 2000) => {
    const existing = recordByResidentId.get(resident.id);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nominal = status === 'kosong' ? 0 : amount;

    if (existing) {
      onUpdateJimpitan(existing.id, {
        nominal,
        status,
        petugas: currentUser.nama,
        waktuInput: timeStr,
      });
      return;
    }

    onSaveJimpitan({
      residentId: resident.id,
      residentName: resident.nama,
      noRumah: resident.noRumah,
      blok: resident.blok,
      tanggal: todayDate,
      nominal,
      status,
      petugas: currentUser.nama,
      catatan: status === 'kosong' ? 'Kaleng kosong / tidak ada orang' : '',
    });
  };

  const handleOpenCustomModal = (resident: Resident) => {
    const existing = recordByResidentId.get(resident.id);
    setSelectedResidentForCustom(resident);
    setCustomNominal(existing ? existing.nominal : 2000);
    setCustomCatatan(existing?.catatan || '');
  };

  const handleSaveCustom = () => {
    if (!selectedResidentForCustom) return;
    const existing = recordByResidentId.get(selectedResidentForCustom.id);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const status = customNominal > 0 ? (customNominal >= 2000 ? 'lunas' : 'sebagian') : 'kosong';

    if (existing) {
      onUpdateJimpitan(existing.id, {
        nominal: customNominal,
        status,
        petugas: currentUser.nama,
        waktuInput: timeStr,
        catatan: customCatatan,
      });
    } else {
      onSaveJimpitan({
        residentId: selectedResidentForCustom.id,
        residentName: selectedResidentForCustom.nama,
        noRumah: selectedResidentForCustom.noRumah,
        blok: selectedResidentForCustom.blok,
        tanggal: todayDate,
        nominal: customNominal,
        status,
        petugas: currentUser.nama,
        catatan: customCatatan,
      });
    }

    setSelectedResidentForCustom(null);
  };

  const handleSubmitSettlement = async () => {
    setIsSubmittingSettlement(true);
    const nominalFisik = settlementNominalFisik ? parseInt(settlementNominalFisik, 10) : totalCollectedToday;

    const payload: DailyVerification = {
      id: `verif-${todayDate}`,
      tanggal: todayDate,
      petugas_id: currentUser.id,
      petugas_nama: currentUser.nama,
      total_rumah_tercatat: todayRecords.length,
      total_nominal_sistem: totalCollectedToday,
      actual_nominal_fisik: nominalFisik,
      selisih: nominalFisik - totalCollectedToday,
      status: 'pending',
      catatan_selisih: settlementCatatan,
    };

    try {
      await DataService.submitDailySettlement(payload);
      setSettlementSuccess(true);
      setTimeout(() => {
        setIsSettlementModalOpen(false);
        setSettlementSuccess(false);
      }, 1600);
    } catch (err) {
      console.error('Gagal mengirim rekonsiliasi setoran:', err);
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  const handleQRRecordSaved = (res: Resident, nominal: number) => {
    handleQuickTap(res, nominal > 0 ? 'lunas' : 'kosong', nominal);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-subtle)] text-[var(--color-text-primary)] flex flex-col font-sans pb-28 md:pb-14 antialiased">
      <WalletHeader
        petugasName={currentUser.nama}
        todayDate={todayDate}
        totalCollectedToday={totalCollectedToday}
        progressPercent={progressPercent}
        recordedDailyCount={recordedDailyCount}
        totalDailyTargetHouses={totalDailyTargetHouses}
        monthlyPrepaidCount={monthlyPrepaidCount}
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncNow={syncNow}
        onLogout={onLogout}
        onOpenQRScanner={() => setIsQRModalOpen(true)}
        onOpenSettlement={() => setIsSettlementModalOpen(true)}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-3.5 sm:p-5 space-y-4">
        {currentTab === 'beranda' || currentTab === 'tarikan' ? (
          <QuickTapHouseList
            residents={filteredResidents}
            recordMap={recordByResidentId}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onlyDailyTarget={onlyDailyTarget}
            onToggleDailyTarget={() => setOnlyDailyTarget((prev) => !prev)}
            onQuickTap={handleQuickTap}
            onOpenCustomModal={handleOpenCustomModal}
          />
        ) : null}

        {currentTab === 'riwayat' ? <PetugasRiwayatTab todayRecords={todayRecords} /> : null}
        {currentTab === 'warga' ? <PetugasWargaTab residents={activeResidents} /> : null}
      </main>

      <FloatingBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      <RondaBottomSheet
        resident={selectedResidentForCustom}
        customNominal={customNominal}
        customCatatan={customCatatan}
        onNominalChange={setCustomNominal}
        onCatatanChange={setCustomCatatan}
        onSave={handleSaveCustom}
        onClose={() => setSelectedResidentForCustom(null)}
      />

      <SelesaiRondaModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        totalCollectedToday={totalCollectedToday}
        recordedHousesCount={todayRecords.length}
        settlementNominalFisik={settlementNominalFisik}
        onNominalFisikChange={setSettlementNominalFisik}
        settlementCatatan={settlementCatatan}
        onCatatanChange={setSettlementCatatan}
        onSubmit={handleSubmitSettlement}
        isSubmitting={isSubmittingSettlement}
        isSuccess={settlementSuccess}
      />

      <QRScanFlowModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        residents={activeResidents}
        todayDate={todayDate}
        onSaveRecord={handleQRRecordSaved}
      />
    </div>
  );
};
