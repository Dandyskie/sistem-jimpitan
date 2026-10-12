import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { KasTransaction, Resident } from '../types';
import { initialCashTransactions } from '../data/transactions';
import { STORAGE_KEYS, enqueueOfflineMutation } from './offlineQueue';
import { VerificationService } from './verificationService';

// Eksekusi update status bulanan warga di Supabase
async function executeOnlineBulananUpdate(
  wargaId: string,
  statusBulanan: 'lunas' | 'belum_lunas',
  wargaNama: string,
  nominal: number,
  bendaharaId: string
): Promise<boolean> {
  try {
    await supabase!
      .from('warga')
      .update({ status_bulanan: statusBulanan })
      .eq('id', wargaId);

    const isLunas = statusBulanan === 'lunas';
    if (isLunas) {
      await supabase!.from('kas_transactions').insert({
        tipe: 'pemasukan',
        kategori: 'iuran_bulanan',
        nominal,
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: `Iuran Bulanan Kas Warga - ${wargaNama}`,
        penanggung_jawab: wargaNama,
        warga_id: wargaId,
        created_by: bendaharaId,
      });
    }
    return true;
  } catch (err) {
    console.warn('Gagal update bulanan online, beralih ke antrean:', err);
    return false;
  }
}

// Perbarui cache warga lokal saat ada perubahan status bulanan
function updateLocalWargaBulananCache(wargaId: string, statusBulanan: 'lunas' | 'belum_lunas'): void {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.WARGA_CACHE);
    if (!cached) return;

    const list: Resident[] = JSON.parse(cached);
    const idx = list.findIndex((w) => w.id === wargaId);
    if (idx < 0) return;

    list[idx].status_bulanan = statusBulanan;
    list[idx].statusBulanan = statusBulanan;
    list[idx].statusPembayaranBulanIni = statusBulanan === 'lunas' ? 'lunas' : 'belum_bayar';
    list[idx].statusTarikanMalamIni = statusBulanan === 'lunas' ? 'bulanan_lunas' : 'belum';
    localStorage.setItem(STORAGE_KEYS.WARGA_CACHE, JSON.stringify(list));
  } catch {}
}

// Ambil transaksi kas dari Supabase
async function fetchOnlineKasTransactions(): Promise<KasTransaction[] | null> {
  try {
    const { data, error } = await supabase!
      .from('kas_transactions')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error || !data) return null;

    try {
      localStorage.setItem(STORAGE_KEYS.KAS_CACHE, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err) {
    console.warn('Gagal mengambil kas transactions dari Supabase:', err);
    return null;
  }
}

// Tambah transaksi kas baru ke Supabase
async function sendKasTransactionOnline(tx: KasTransaction): Promise<KasTransaction | null> {
  try {
    const { data, error } = await supabase!
      .from('kas_transactions')
      .insert({
        tipe: tx.tipe,
        kategori: tx.kategori,
        nominal: tx.nominal,
        tanggal: tx.tanggal,
        deskripsi: tx.deskripsi,
        penanggung_jawab: tx.penanggung_jawab || tx.penanggungJawab,
        warga_id: tx.warga_id,
        bukti_url: tx.bukti_url || tx.buktiUrl,
        created_by: tx.created_by,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Gagal tambah transaksi kas online:', err);
    return null;
  }
}

export const KasService = {
  // Delegasi verifikasi harian ke VerificationService
  getDailyVerification: VerificationService.getDailyVerification,
  submitDailySettlement: VerificationService.submitDailySettlement,
  verifySettlement: VerificationService.verifySettlement,

  // Bendahara memperbarui status iuran bulanan warga
  async updateWargaBulananStatus(
    wargaId: string,
    statusBulanan: 'lunas' | 'belum_lunas',
    wargaNama: string,
    nominal: number = 20000,
    bendaharaId: string = ''
  ): Promise<void> {
    updateLocalWargaBulananCache(wargaId, statusBulanan);

    const canSendOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const success = canSendOnline
      ? await executeOnlineBulananUpdate(wargaId, statusBulanan, wargaNama, nominal, bendaharaId)
      : false;

    if (success) return;

    enqueueOfflineMutation('UPDATE_BULANAN', { wargaId, statusBulanan });
  },

  // Mengambil riwayat transaksi Kas RT
  async getKasTransactions(): Promise<KasTransaction[]> {
    const canQueryOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineTxs = canQueryOnline ? await fetchOnlineKasTransactions() : null;
    if (onlineTxs) return onlineTxs;

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.KAS_CACHE);
      if (cached) return JSON.parse(cached);
    } catch {}

    return initialCashTransactions;
  },

  // Tambah transaksi kas baru oleh bendahara
  async addKasTransaction(tx: KasTransaction): Promise<KasTransaction> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.KAS_CACHE);
      const list: KasTransaction[] = cached ? JSON.parse(cached) : initialCashTransactions;
      localStorage.setItem(STORAGE_KEYS.KAS_CACHE, JSON.stringify([tx, ...list]));
    } catch {}

    const canSendOnline = isSupabaseConfigured && Boolean(supabase) && navigator.onLine;
    const onlineResult = canSendOnline ? await sendKasTransactionOnline(tx) : null;
    if (onlineResult) return onlineResult;

    enqueueOfflineMutation('ADD_KAS_TRANSACTION', tx);
    return tx;
  },
};
