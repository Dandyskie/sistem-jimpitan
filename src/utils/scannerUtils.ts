import { Resident } from '../types';

/**
 * Bunyikan nada beep pemindai barcode via Web Audio API tanpa perlu file audio eksternal.
 */
export function playScannerBeep(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Abaikan jika browser membatasi Web Audio tanpa gestur
  }
}

/**
 * Ekstrak ID dan cocokkan rumah warga dari URL atau teks QR Code kaleng.
 */
export function matchResidentFromQr(qrData: string, residents: Resident[]): Resident | null {
  const trimmed = qrData.trim();
  let targetId = trimmed;

  if (trimmed.includes('/warga/')) {
    const parts = trimmed.split('/warga/');
    targetId = decodeURIComponent(parts[parts.length - 1].split('?')[0].replace(/\/$/, ''));
  }

  const exact = residents.find((r) => r.id === targetId);
  if (exact) return exact;

  const noRumah = residents.find((r) => r.noRumah.toLowerCase() === targetId.toLowerCase());
  if (noRumah) return noRumah;

  const combined = residents.find((r) => {
    const key1 = `${r.blok.replace('Blok ', '')}-${r.noRumah}`.toLowerCase();
    const key2 = `${r.blok}-${r.noRumah}`.toLowerCase();
    return targetId.toLowerCase().includes(key1) || targetId.toLowerCase().includes(key2);
  });
  if (combined) return combined;

  return null;
}
