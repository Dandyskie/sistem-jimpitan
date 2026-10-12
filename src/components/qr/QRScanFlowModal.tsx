import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Resident, JimpitanRecord } from '../../types';
import { QRViewfinderView } from './QRViewfinderView';
import { QRFormStepView } from './QRFormStepView';
import { QRSuccessStepView } from './QRSuccessStepView';

interface QRScanFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  residents: Resident[];
  todayDate: string;
  onSaveRecord: (resident: Resident, nominal: number, catatan?: string) => void;
}

type ScanStep = 'scanner' | 'form' | 'already_recorded' | 'success';

/**
 * Modal Alur Pemindaian QR Code Kaleng Jimpitan.
 * Mengintegrasikan viewfinder kamera simulasi, formulir nominal, dan konfirmasi sukses.
 */
export const QRScanFlowModal: React.FC<QRScanFlowModalProps> = ({
  isOpen,
  onClose,
  residents,
  onSaveRecord,
}) => {
  const [step, setStep] = useState<ScanStep>('scanner');
  const [autoRecord, setAutoRecord] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [existingRecord, setExistingRecord] = useState<JimpitanRecord | null>(null);

  const [nominal, setNominal] = useState<number>(2000);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [isCustomNominal, setIsCustomNominal] = useState<boolean>(false);
  const [catatan, setCatatan] = useState<string>('');
  const [isCorrecting, setIsCorrecting] = useState<boolean>(false);

  const [scanToast, setScanToast] = useState<{ nama: string; rumah: string; nominal: number } | null>(null);

  const [lastSavedInfo, setLastSavedInfo] = useState<{
    resident: Resident;
    nominal: number;
    time: string;
    petugas: string;
  } | null>(null);

  if (!isOpen) return null;

  const filteredResidents = residents.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.nama.toLowerCase().includes(q) ||
      r.noRumah.includes(q) ||
      r.blok.toLowerCase().includes(q)
    );
  });

  const handleResidentDetected = (resident: Resident) => {
    if (autoRecord) {
      onSaveRecord(resident, 2000, 'Tercatat otomatis via kamera QR');
      setScanToast({
        nama: resident.nama,
        rumah: `${resident.blok} No. ${resident.noRumah}`,
        nominal: 2000,
      });
      return;
    }

    setSelectedResident(resident);
    setNominal(2000);
    setIsCustomNominal(false);
    setCustomNominal('');
    setCatatan('');
    setIsCorrecting(false);
    setStep('form');
  };

  const handleTriggerScan = (resident: Resident) => {
    handleResidentDetected(resident);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;

    const finalNominal = isCustomNominal ? Number(customNominal) || 2000 : nominal;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSaveRecord(selectedResident, finalNominal, catatan);

    setLastSavedInfo({
      resident: selectedResident,
      nominal: finalNominal,
      time: timeStr,
      petugas: 'Petugas Ronda',
    });

    setStep('success');
  };

  const handleResetForNext = () => {
    setSelectedResident(null);
    setExistingRecord(null);
    setNominal(2000);
    setCustomNominal('');
    setIsCustomNominal(false);
    setCatatan('');
    setIsCorrecting(false);
    setStep('scanner');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-xl border border-[var(--color-border)] space-y-4">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              {step === 'scanner' && 'Scanner QR Kaleng Jimpitan'}
              {step === 'form' && 'Konfirmasi Tarikan Jimpitan'}
              {step === 'already_recorded' && 'Peringatan Duplikasi'}
              {step === 'success' && 'Tarikan Tersimpan'}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              JIMPITANKU by Perum BDA • RT 02 / RW 07
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pemindai QR"
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SCANNER */}
        {step === 'scanner' && (
          <QRViewfinderView
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredResidents={filteredResidents}
            residents={residents}
            autoRecord={autoRecord}
            onToggleAutoRecord={setAutoRecord}
            scanToast={scanToast}
            onClearScanToast={() => setScanToast(null)}
            onResidentDetected={handleResidentDetected}
            onSelectResident={handleTriggerScan}
          />
        )}

        {/* STEP 2: FORM INPUT */}
        {step === 'form' && selectedResident && (
          <QRFormStepView
            resident={selectedResident}
            existingRecord={existingRecord}
            isCorrecting={isCorrecting}
            nominal={nominal}
            onNominalChange={setNominal}
            isCustomNominal={isCustomNominal}
            onToggleCustomNominal={setIsCustomNominal}
            customNominal={customNominal}
            onCustomNominalChange={setCustomNominal}
            catatan={catatan}
            onCatatanChange={setCatatan}
            onSave={handleSave}
            onCancel={handleResetForNext}
          />
        )}

        {/* STEP 3: SUKSES */}
        {step === 'success' && (
          <QRSuccessStepView
            lastSavedInfo={lastSavedInfo}
            onScanNext={handleResetForNext}
            onFinish={onClose}
          />
        )}
      </div>
    </div>
  );
};
