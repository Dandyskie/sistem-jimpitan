import React, { useState, useEffect } from 'react';
import { LogIn, ShieldCheck, Lock, QrCode } from 'lucide-react';
import { Resident, JimpitanRecord } from '../../types';
import { DataService } from '../../services/dataService';
import { isValidResidentId } from '../../utils/security';
import { PortalWargaHeader } from './PortalWargaHeader';
import { PortalWargaHistory } from './PortalWargaHistory';
import { FullscreenButton } from '../common/FullscreenButton';

interface PortalWargaViewProps {
  residents: Resident[];
  jimpitanRecords: JimpitanRecord[];
  todayDate: string;
  initialResidentId?: string;
  onNavigateUrl: (path: string) => void;
}

/**
 * Temukan data rumah berdasarkan ID spesifik dari QR Code.
 * Mengutamakan pencocokan ID unik atau Nomor Rumah terdaftar.
 */
function findTargetResident(residents: Resident[], targetId?: string): Resident | null {
  if (!targetId || !isValidResidentId(targetId)) return null;

  const exactMatch = residents.find((r) => r.id === targetId);
  if (exactMatch) return exactMatch;

  const noRumahMatch = residents.find((r) => r.noRumah === targetId);
  if (noRumahMatch) return noRumahMatch;

  return null;
}

/**
 * Tampilan Utama Portal Transparansi Warga (Read-Only via QR Code Khusus).
 * Menegakkan privasi warga: QR 1 hanya bisa melihat kemajuan jimpitan rumah 1.
 */
export const PortalWargaView: React.FC<PortalWargaViewProps> = ({
  residents,
  todayDate,
  initialResidentId,
  onNavigateUrl,
}) => {
  const [residentRecords, setResidentRecords] = useState<JimpitanRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedResident = findTargetResident(residents, initialResidentId);

  // Muat riwayat tarikan spesifik rumah terpilih
  useEffect(() => {
    if (!selectedResident) return;

    DataService.getJimpitanRecordsByResident(selectedResident.id)
      .then((records) => setResidentRecords(records))
      .catch((err) => console.warn('Gagal memuat riwayat jimpitan warga:', err));
  }, [selectedResident, todayDate]);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setToastMessage('Tautan transparansi rumah berhasil disalin!');
      setTimeout(() => setToastMessage(null), 700);
    }
  };

  // Layar perlindungan privasi jika diakses langsung tanpa QR rumah spesifik
  if (!selectedResident) {
    return (
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between antialiased">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/bda-logo.jpg"
              alt="Logo BDA"
              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Privasi Portal Warga
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight block">
                JIMPITANKU by Perum BDA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FullscreenButton />
            <button
              type="button"
              onClick={() => onNavigateUrl('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Login Petugas / RT</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              Akses Khusus QR Code Rumah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Demi menjaga privasi warga <strong>Perumahan Bumi Dukuh Asri</strong>,
              portal ini dilindungi secara personal. Setiap rumah hanya dapat memantau
              progres jimpitan miliknya sendiri melalui QR Code fisik di kaleng rumah masing-masing.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full text-left space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cara Membuka Rekap Rumah Anda:</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Pindai stiker QR Code yang tertempel di kaleng jimpitan rumah Anda.</li>
              <li>Sistem akan membuka rekap setoran khusus untuk rumah Anda saja.</li>
              <li>Warga lain tidak dapat mengintip rekap rumah Anda.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => onNavigateUrl('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Kembali ke Halaman Depan
          </button>
        </main>

        <footer className="py-4 px-4 text-center border-t border-slate-200/80 bg-white text-[11px] text-slate-500">
          <p className="font-semibold text-slate-700">JIMPITANKU by Perum BDA</p>
          <p>RT 02 / RW 07 Bumi Dukuh Asri • Menjaga Privasi & Keamanan Warga</p>
        </footer>
      </div>
    );
  }

  // Perhitungan statistik kontribusi rumah terpilih
  const isBulanan = selectedResident.tipe_iuran === 'bulanan';
  const isBulananLunas = isBulanan && selectedResident.status_bulanan === 'lunas';

  const paidRecords = residentRecords.filter((r) => r.status === 'lunas');
  const paidDaysCount = paidRecords.length;
  const lastPaymentDate = paidRecords[0]?.tanggal || selectedResident.terakhirBayar;

  const totalHarian = paidRecords.reduce((sum, r) => sum + r.nominal, 0);
  const totalNominalMonth = isBulanan ? (isBulananLunas ? 20000 : 0) : totalHarian;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar Ringan Portal Warga */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/bda-logo.jpg"
            alt="Logo BDA"
            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Portal Warga
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight block">
              JIMPITANKU by Perum BDA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FullscreenButton />
          <button
            type="button"
            onClick={() => onNavigateUrl('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-500" />
            <span>Login Petugas / RT</span>
          </button>
        </div>
      </header>

      {/* Konten Utama Responsif Mobile */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {toastMessage && (
          <div className="p-3 bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md animate-in fade-in duration-200 text-center">
            {toastMessage}
          </div>
        )}

        <PortalWargaHeader
          resident={selectedResident}
          totalNominalMonth={totalNominalMonth}
          paidDaysCount={paidDaysCount}
          lastPaymentDate={lastPaymentDate}
          onShareLink={handleShareLink}
        />

        {/* Kartu Jaminan Privasi Data Warga */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Data ini terenkripsi dan khusus untuk <strong>{selectedResident.nama} ({selectedResident.blok} No. {selectedResident.noRumah})</strong>.
            Tetangga lain tidak dapat melihat riwayat ini.
          </p>
        </div>

        <PortalWargaHistory
          records={residentRecords}
          isBulanan={isBulanan}
        />
      </main>

      {/* Footer Komunitas RT 02 */}
      <footer className="py-6 px-4 text-center border-t border-slate-200/80 bg-white text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          JIMPITANKU by Perum BDA • RT 02 / RW 07 Bumi Dukuh Asri
        </p>
        <p>Sistem Jimpitan Terbuka & Terlindungi • Sukoharjo</p>
      </footer>
    </div>
  );
};
