-- ==============================================================================
-- SKRIP PERBAIKAN SINKRONISASI: SISTEM JIMPITANKU BY PERUM BDA
-- Mengatasi masalah setoran tidak terdeteksi di dashboard admin
-- Cara pakai: Salin skrip ini -> Supabase Dashboard -> SQL Editor -> Klik "Run"
-- ==============================================================================

-- 1. Lepas Foreign Key yang memblokir user ID frontend & ubah tipe kolom menjadi TEXT
ALTER TABLE public.jimpitan_records DROP CONSTRAINT IF EXISTS jimpitan_records_petugas_id_fkey;
ALTER TABLE public.jimpitan_records DROP CONSTRAINT IF EXISTS jimpitan_records_warga_id_fkey;
ALTER TABLE public.jimpitan_records ALTER COLUMN petugas_id TYPE TEXT;
ALTER TABLE public.jimpitan_records ALTER COLUMN warga_id TYPE TEXT;

ALTER TABLE public.daily_verifications DROP CONSTRAINT IF EXISTS daily_verifications_petugas_id_fkey;
ALTER TABLE public.daily_verifications DROP CONSTRAINT IF EXISTS daily_verifications_verified_by_fkey;
ALTER TABLE public.daily_verifications ALTER COLUMN petugas_id TYPE TEXT;
ALTER TABLE public.daily_verifications ALTER COLUMN verified_by TYPE TEXT;

ALTER TABLE public.kas_transactions DROP CONSTRAINT IF EXISTS kas_transactions_created_by_fkey;
ALTER TABLE public.kas_transactions DROP CONSTRAINT IF EXISTS kas_transactions_warga_id_fkey;
ALTER TABLE public.kas_transactions ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE public.kas_transactions ALTER COLUMN warga_id TYPE TEXT;

-- 2. Pastikan RLS mengizinkan role anon (koneksi frontend via anon_key) dan authenticated
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jimpitan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_transactions ENABLE ROW LEVEL SECURITY;

-- Reset aturan lama yang memblokir role anon
DROP POLICY IF EXISTS "Akses penuh warga" ON public.warga;
DROP POLICY IF EXISTS "Warga can be viewed by authenticated users" ON public.warga;
DROP POLICY IF EXISTS "Warga public read-only for citizen portal" ON public.warga;
DROP POLICY IF EXISTS "Bendahara can insert warga" ON public.warga;
DROP POLICY IF EXISTS "Bendahara can update warga" ON public.warga;
CREATE POLICY "Akses penuh warga" ON public.warga FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh jimpitan" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Petugas and Bendahara can view jimpitan records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Petugas can insert jimpitan records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Petugas can update their own today records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Bendahara can manage jimpitan records" ON public.jimpitan_records;
CREATE POLICY "Akses penuh jimpitan" ON public.jimpitan_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh verifikasi" ON public.daily_verifications;
DROP POLICY IF EXISTS "Authenticated users can view daily verifications" ON public.daily_verifications;
DROP POLICY IF EXISTS "Petugas can insert daily verifications" ON public.daily_verifications;
DROP POLICY IF EXISTS "Bendahara can update daily verifications" ON public.daily_verifications;
CREATE POLICY "Akses penuh verifikasi" ON public.daily_verifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh kas" ON public.kas_transactions;
DROP POLICY IF EXISTS "Authenticated users can view kas transactions" ON public.kas_transactions;
DROP POLICY IF EXISTS "Bendahara can manage kas transactions" ON public.kas_transactions;
CREATE POLICY "Akses penuh kas" ON public.kas_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Aktifkan Realtime Replication untuk sinkronisasi otomatis antar HP & Laptop
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'jimpitan_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jimpitan_records;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_verifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_verifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'kas_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kas_transactions;
  END IF;
END $$;
