-- ==============================================================================
-- SKRIP PERBAIKAN SINKRONISASI: SISTEM JIMPITANKU BY PERUM BDA
-- Mengatasi masalah: ERROR 0A000 (cannot alter type of a column used in a policy definition)
-- Serta memastikan setoran petugas & sinkronisasi admin berjalan 100% lancar
--
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard -> Project Anda
-- 2. Masuk ke menu "SQL Editor" di bilah kiri
-- 3. Tempel (Paste) seluruh isi skrip ini lalu klik "Run"
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- LANGKAH 1: Hapus SEMUA RLS Policies lama terlebih dahulu
-- (Wajib dilakukan SEBELUM ALTER COLUMN agar PostgreSQL tidak menolak perubahan tipe)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('warga', 'jimpitan_records', 'daily_verifications', 'kas_transactions', 'profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop eksplisit untuk memastikan seluruh policy bawaan bersih
DROP POLICY IF EXISTS "Petugas can insert jimpitan records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Petugas can update their own today records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Petugas and Bendahara can view jimpitan records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Bendahara can manage jimpitan records" ON public.jimpitan_records;
DROP POLICY IF EXISTS "Akses penuh jimpitan" ON public.jimpitan_records;

DROP POLICY IF EXISTS "Petugas can insert daily verifications" ON public.daily_verifications;
DROP POLICY IF EXISTS "Bendahara can update daily verifications" ON public.daily_verifications;
DROP POLICY IF EXISTS "Authenticated users can view daily verifications" ON public.daily_verifications;
DROP POLICY IF EXISTS "Akses penuh verifikasi" ON public.daily_verifications;

DROP POLICY IF EXISTS "Authenticated users can view kas transactions" ON public.kas_transactions;
DROP POLICY IF EXISTS "Bendahara can manage kas transactions" ON public.kas_transactions;
DROP POLICY IF EXISTS "Akses penuh kas" ON public.kas_transactions;

DROP POLICY IF EXISTS "Warga can be viewed by authenticated users" ON public.warga;
DROP POLICY IF EXISTS "Warga public read-only for citizen portal" ON public.warga;
DROP POLICY IF EXISTS "Bendahara can insert warga" ON public.warga;
DROP POLICY IF EXISTS "Bendahara can update warga" ON public.warga;
DROP POLICY IF EXISTS "Akses penuh warga" ON public.warga;

-- -----------------------------------------------------------------------------
-- LANGKAH 2: Lepas Foreign Key Constraints yang membatasi user ID string / offline ID
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT conname, relname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.relname IN ('jimpitan_records', 'daily_verifications', 'kas_transactions')
          AND c.contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', fk.relname, fk.conname);
    END LOOP;
END $$;

ALTER TABLE public.jimpitan_records DROP CONSTRAINT IF EXISTS jimpitan_records_petugas_id_fkey;
ALTER TABLE public.jimpitan_records DROP CONSTRAINT IF EXISTS jimpitan_records_warga_id_fkey;
ALTER TABLE public.daily_verifications DROP CONSTRAINT IF EXISTS daily_verifications_petugas_id_fkey;
ALTER TABLE public.daily_verifications DROP CONSTRAINT IF EXISTS daily_verifications_verified_by_fkey;
ALTER TABLE public.kas_transactions DROP CONSTRAINT IF EXISTS kas_transactions_created_by_fkey;
ALTER TABLE public.kas_transactions DROP CONSTRAINT IF EXISTS kas_transactions_warga_id_fkey;

-- -----------------------------------------------------------------------------
-- LANGKAH 3: Ubah Tipe Kolom Menjadi TEXT & Atur Default Value
-- -----------------------------------------------------------------------------
ALTER TABLE public.jimpitan_records ALTER COLUMN petugas_id TYPE TEXT;
ALTER TABLE public.jimpitan_records ALTER COLUMN warga_id TYPE TEXT;
ALTER TABLE public.jimpitan_records ALTER COLUMN petugas_id SET DEFAULT 'usr-ronda';

ALTER TABLE public.daily_verifications ALTER COLUMN petugas_id TYPE TEXT;
ALTER TABLE public.daily_verifications ALTER COLUMN verified_by TYPE TEXT;
ALTER TABLE public.daily_verifications ALTER COLUMN petugas_id SET DEFAULT 'usr-ronda';

ALTER TABLE public.kas_transactions ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE public.kas_transactions ALTER COLUMN warga_id TYPE TEXT;
ALTER TABLE public.kas_transactions ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.kas_transactions ALTER COLUMN created_by SET DEFAULT 'usr-bendahara';

-- -----------------------------------------------------------------------------
-- LANGKAH 4: Aktifkan RLS & Buat Policy Permisif untuk Anon & Authenticated
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jimpitan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses penuh profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Akses penuh warga" ON public.warga FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Akses penuh jimpitan" ON public.jimpitan_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Akses penuh verifikasi" ON public.daily_verifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Akses penuh kas" ON public.kas_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- LANGKAH 5: Pastikan Realtime Replication Aktif untuk Sinkronisasi Otomatis
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'warga'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.warga;
  END IF;

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
