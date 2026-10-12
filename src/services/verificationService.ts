import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DailyVerification } from '../types';
import { STORAGE_KEYS, enqueueOfflineMutation } from './offlineQueue';

// Ambil verifikasi dari Supabase secara online
async function fetchOnlineDailyVerification(tanggal: string): Promise<DailyVerification | null> {
  try {
    const { data, error } = await supabase!
      .from('daily_verifications')
      .select('*')
      .eq('tanggal', tanggal)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Gagal memuat verifikasi harian dari Supabase:', err);
    return null;
  }
}

// Kirim setoran verifikasi harian ke Supabase
async function sendSettlementOnline(verif: DailyVerification): Promise<DailyVerification | null> {
  try {
    const { data, error } = await supabase!
      .from('daily_verifications')
      .upsert(
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
      )
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Gagal mengirim verifikasi online:', err);
    return null;
  }
}

// Eksekusi verifikasi setoran ke Supabase
async function executeOnlineVerification(
  verifId: string,
  actualNominalFisik: number,
  status: 'verified' | 'flagged',
  catatanSelisih: string,
  verifiedBy: string,
  verifTanggal: string,
  petugasNama: string
): Promise<boolean> {
  try {
    await supabase!
      .from('daily_verifications')
      .update({
        actual_nominal_fisik: actualNominalFisik,
        status,
        catatan_selisih: catatanSelisih,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verifId);

    const isVerified = status === 'verified';
    if (isVerified) {
      await supabase!.from('kas_transactions').insert({
        tipe: 'pemasukan',
        kategori: 'jimpitan_harian',
        nominal: actualNominalFisik,
        tanggal: verifTanggal,
        deskripsi: `Setoran Jimpitan Ronda Malam ${verifTanggal} (${petugasNama})`,
        penanggung_jawab: petugasNama,
        created_by: verifiedBy,
      });
    }
    return true;
  } catch (err) {
    console.warn('Gagal verifikasi online, beralih ke antrean offline:', err);
    return false;
  }
}

export const VerificationService = {
  // Ambil data verifikasi harian
  async getDailyVerification(tanggal: string): Promise<DailyVerification | null> {
    const canQueryOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineData = canQueryOnline ? await fetchOnlineDailyVerification(tanggal) : null;
    if (onlineData) return onlineData;

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.VERIF_CACHE);
      if (!cached) return null;
      const list: DailyVerification[] = JSON.parse(cached);
      return list.find((v) => v.tanggal === tanggal) || null;
    } catch {
      return null;
    }
  },

  // Petugas ronda mengunci setoran malam untuk bendahara
  async submitDailySettlement(verif: DailyVerification): Promise<DailyVerification> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.VERIF_CACHE);
      const list: DailyVerification[] = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex((v) => v.tanggal === verif.tanggal);

      if (idx >= 0) {
        list[idx] = verif;
      } else {
        list.push(verif);
      }
      localStorage.setItem(STORAGE_KEYS.VERIF_CACHE, JSON.stringify(list));
    } catch {}

    const canSendOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineResult = canSendOnline ? await sendSettlementOnline(verif) : null;
    if (onlineResult) return onlineResult;

    enqueueOfflineMutation('SUBMIT_VERIFICATION', verif);
    return verif;
  },

  // Bendahara memverifikasi uang fisik setoran dari petugas
  async verifySettlement(
    verifId: string,
    actualNominalFisik: number,
    status: 'verified' | 'flagged',
    catatanSelisih: string = '',
    verifiedBy: string,
    verifTanggal: string,
    petugasNama: string
  ): Promise<void> {
    const canSendOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const success = canSendOnline
      ? await executeOnlineVerification(
          verifId,
          actualNominalFisik,
          status,
          catatanSelisih,
          verifiedBy,
          verifTanggal,
          petugasNama
        )
      : false;

    if (success) return;

    enqueueOfflineMutation('VERIFY_SETTLEMENT', {
      id: verifId,
      actual_nominal_fisik: actualNominalFisik,
      status,
      catatan_selisih: catatanSelisih,
      verified_by: verifiedBy,
    });
  },
};
