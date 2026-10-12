-- ==============================================================================
-- SKRIP DATABASE SUPABASE: SISTEM JIMPITAN DIGITAL
-- Versi: 2.0 (170 Rumah, Offline-Ready, Single Officer, Iuran Bulanan & Harian)
-- ==============================================================================

-- 1. Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Reset tabel lama jika ada
DROP TABLE IF EXISTS public.kas_transactions CASCADE;
DROP TABLE IF EXISTS public.daily_verifications CASCADE;
DROP TABLE IF EXISTS public.jimpitan_records CASCADE;
DROP TABLE IF EXISTS public.warga CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- -----------------------------------------------------------------------------
-- 3. Tabel Profiles (User Roles: 'petugas' vs 'bendahara')
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('petugas', 'bendahara')),
  no_hp       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. Tabel Warga (Master Data 170 Rumah Perumahan)
-- -----------------------------------------------------------------------------
CREATE TABLE public.warga (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama                TEXT NOT NULL,
  blok                TEXT NOT NULL,          -- 'A', 'B', 'C', 'D', 'E'
  no_rumah            TEXT NOT NULL,          -- '01', '02', '12A', dst.
  rt                  TEXT NOT NULL DEFAULT '02',
  rw                  TEXT NOT NULL DEFAULT '07',
  no_hp               TEXT,
  tipe_iuran          TEXT NOT NULL DEFAULT 'harian' CHECK (tipe_iuran IN ('harian', 'bulanan')),
  status_bulanan      TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status_bulanan IN ('lunas', 'belum_lunas')),
  nominal_bulanan     BIGINT DEFAULT 20000,   -- Standar iuran bulanan jika bayar ke bendahara
  urutan_rute         INTEGER DEFAULT 0,      -- 1 s/d 170 urutan fisik rute ronda
  status              TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blok, no_rumah)
);

-- -----------------------------------------------------------------------------
-- 5. Tabel Jimpitan Records (Tarikan Harian Petugas Ronda)
-- -----------------------------------------------------------------------------
CREATE TABLE public.jimpitan_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id            TEXT NOT NULL,
  tanggal             DATE NOT NULL,          -- Tanggal malam ronda
  nominal             BIGINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('lunas', 'sebagian', 'kosong')),
  petugas_id          TEXT NOT NULL DEFAULT 'usr-ronda',
  petugas_nama        TEXT,
  catatan             TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(warga_id, tanggal)                   -- Mencegah tarikan ganda di malam yang sama
);

-- -----------------------------------------------------------------------------
-- 6. Tabel Daily Verifications (Rekonsiliasi Serah Terima Petugas -> Bendahara)
-- -----------------------------------------------------------------------------
CREATE TABLE public.daily_verifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal               DATE NOT NULL UNIQUE,
  petugas_id            TEXT NOT NULL DEFAULT 'usr-ronda',
  petugas_nama          TEXT,
  total_rumah_tercatat  INTEGER NOT NULL DEFAULT 0,
  total_nominal_sistem  BIGINT NOT NULL DEFAULT 0,      -- Angka tercatat di HP petugas
  actual_nominal_fisik  BIGINT,                         -- Uang fisik dihitung bendahara
  selisih               BIGINT DEFAULT 0,               -- actual_nominal_fisik - total_nominal_sistem
  status                TEXT NOT NULL DEFAULT 'pending' 
                        CHECK (status IN ('pending', 'verified', 'flagged')),
  catatan_selisih       TEXT,
  verified_by           TEXT,
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 7. Tabel Kas Transactions (Buku Kas Keuangan RT)
-- -----------------------------------------------------------------------------
CREATE TABLE public.kas_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe              TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  kategori          TEXT NOT NULL,                      -- 'jimpitan_harian', 'iuran_bulanan', dll
  nominal           BIGINT NOT NULL,
  tanggal           DATE NOT NULL,
  deskripsi         TEXT NOT NULL,
  penanggung_jawab  TEXT NOT NULL,
  warga_id          TEXT,
  bukti_url         TEXT,
  created_by        TEXT DEFAULT 'usr-bendahara',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 8. Trigger Otomatis: Buat Profil Saat Registrasi User Baru
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, role, no_hp)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nama', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'petugas'),
    new.raw_user_meta_data->>'no_hp'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 9. Row Level Security (RLS)
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
-- 10. Realtime Publications (Aman & Idempotent)
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

-- -----------------------------------------------------------------------------
-- 11. Seed Data: Master 170 Rumah Perumahan (Blok A s/d E)
-- -----------------------------------------------------------------------------
INSERT INTO public.warga (nama, blok, no_rumah, rt, rw, tipe_iuran, status_bulanan, nominal_bulanan, urutan_rute, status)
VALUES
  -- BLOK A (1 s/d 35)
  ('Bpk. Agus Santoso', 'A', '01', '02', '07', 'harian', 'belum_lunas', 20000, 1, 'aktif'),
  ('Bpk. Budi Prasetyo', 'A', '02', '02', '07', 'bulanan', 'lunas', 25000, 2, 'aktif'),
  ('Ibu Sri Wahyuni', 'A', '03', '02', '07', 'harian', 'belum_lunas', 20000, 3, 'aktif'),
  ('Bpk. Joko Susilo', 'A', '04', '02', '07', 'harian', 'belum_lunas', 20000, 4, 'aktif'),
  ('Bpk. Hendra Gunawan', 'A', '05', '02', '07', 'bulanan', 'lunas', 20000, 5, 'aktif'),
  ('Bpk. Rahmat Hidayat', 'A', '06', '02', '07', 'harian', 'belum_lunas', 20000, 6, 'aktif'),
  ('Ibu Siti Rahmawati', 'A', '07', '02', '07', 'harian', 'belum_lunas', 20000, 7, 'aktif'),
  ('Bpk. Bambang Pamungkas', 'A', '08', '02', '07', 'bulanan', 'belum_lunas', 20000, 8, 'aktif'),
  ('Bpk. Dedi Supriyadi', 'A', '09', '02', '07', 'harian', 'belum_lunas', 20000, 9, 'aktif'),
  ('Bpk. Eko Kurniawan', 'A', '10', '02', '07', 'harian', 'belum_lunas', 20000, 10, 'aktif'),
  ('Bpk. Fajar Setiawan', 'A', '11', '02', '07', 'bulanan', 'lunas', 30000, 11, 'aktif'),
  ('Ibu Dewi Anggraini', 'A', '12', '02', '07', 'harian', 'belum_lunas', 20000, 12, 'aktif'),
  ('Bpk. Gunawan Wibowo', 'A', '13', '02', '07', 'harian', 'belum_lunas', 20000, 13, 'aktif'),
  ('Bpk. Hari Subagyo', 'A', '14', '02', '07', 'bulanan', 'lunas', 20000, 14, 'aktif'),
  ('Bpk. Indra Kusuma', 'A', '15', '02', '07', 'harian', 'belum_lunas', 20000, 15, 'aktif'),
  ('Ibu Kartika Sari', 'A', '16', '02', '07', 'harian', 'belum_lunas', 20000, 16, 'aktif'),
  ('Bpk. Lukman Hakim', 'A', '17', '02', '07', 'bulanan', 'lunas', 20000, 17, 'aktif'),
  ('Bpk. Mulyono Hadi', 'A', '18', '02', '07', 'harian', 'belum_lunas', 20000, 18, 'aktif'),
  ('Bpk. Nurhadi', 'A', '19', '02', '07', 'harian', 'belum_lunas', 20000, 19, 'aktif'),
  ('Ibu Putri Utami', 'A', '20', '02', '07', 'bulanan', 'belum_lunas', 20000, 20, 'aktif'),
  ('Bpk. Qodir Jaelani', 'A', '21', '02', '07', 'harian', 'belum_lunas', 20000, 21, 'aktif'),
  ('Bpk. Rudi Hartono', 'A', '22', '02', '07', 'harian', 'belum_lunas', 20000, 22, 'aktif'),
  ('Bpk. Slamet Riyadi', 'A', '23', '02', '07', 'bulanan', 'lunas', 20000, 23, 'aktif'),
  ('Ibu Tri Mulyani', 'A', '24', '02', '07', 'harian', 'belum_lunas', 20000, 24, 'aktif'),
  ('Bpk. Untung Suropati', 'A', '25', '02', '07', 'harian', 'belum_lunas', 20000, 25, 'aktif'),
  ('Bpk. Vicky Prasetya', 'A', '26', '02', '07', 'bulanan', 'lunas', 25000, 26, 'aktif'),
  ('Bpk. Wahyu Nugroho', 'A', '27', '02', '07', 'harian', 'belum_lunas', 20000, 27, 'aktif'),
  ('Ibu Wulan Dari', 'A', '28', '02', '07', 'harian', 'belum_lunas', 20000, 28, 'aktif'),
  ('Bpk. Yahya Iskandar', 'A', '29', '02', '07', 'bulanan', 'lunas', 20000, 29, 'aktif'),
  ('Bpk. Zaenal Arifin', 'A', '30', '02', '07', 'harian', 'belum_lunas', 20000, 30, 'aktif'),
  ('Bpk. Aditya Pratama', 'A', '31', '02', '07', 'harian', 'belum_lunas', 20000, 31, 'aktif'),
  ('Bpk. Bagus Cahyono', 'A', '32', '02', '07', 'bulanan', 'lunas', 20000, 32, 'aktif'),
  ('Ibu Candra Kirana', 'A', '33', '02', '07', 'harian', 'belum_lunas', 20000, 33, 'aktif'),
  ('Bpk. Dimas Anggara', 'A', '34', '02', '07', 'harian', 'belum_lunas', 20000, 34, 'aktif'),
  ('Bpk. Erwin Gutawa', 'A', '35', '02', '07', 'bulanan', 'lunas', 20000, 35, 'aktif'),

  -- BLOK B (1 s/d 35)
  ('Bpk. Firman Syah', 'B', '01', '02', '07', 'harian', 'belum_lunas', 20000, 36, 'aktif'),
  ('Bpk. Gilang Ramadhan', 'B', '02', '02', '07', 'bulanan', 'lunas', 20000, 37, 'aktif'),
  ('Ibu Hani Fatimah', 'B', '03', '02', '07', 'harian', 'belum_lunas', 20000, 38, 'aktif'),
  ('Bpk. Ilham Habibie', 'B', '04', '02', '07', 'harian', 'belum_lunas', 20000, 39, 'aktif'),
  ('Bpk. Jafar Sodik', 'B', '05', '02', '07', 'bulanan', 'lunas', 20000, 40, 'aktif'),
  ('Bpk. Krisna Mukti', 'B', '06', '02', '07', 'harian', 'belum_lunas', 20000, 41, 'aktif'),
  ('Ibu Lilis Suryani', 'B', '07', '02', '07', 'harian', 'belum_lunas', 20000, 42, 'aktif'),
  ('Bpk. Mansyur S', 'B', '08', '02', '07', 'bulanan', 'belum_lunas', 20000, 43, 'aktif'),
  ('Bpk. Nandi Wardhana', 'B', '09', '02', '07', 'harian', 'belum_lunas', 20000, 44, 'aktif'),
  ('Bpk. Oki Setiana', 'B', '10', '02', '07', 'harian', 'belum_lunas', 20000, 45, 'aktif'),
  ('Bpk. Pandu Dewanata', 'B', '11', '02', '07', 'bulanan', 'lunas', 25000, 46, 'aktif'),
  ('Ibu Qori Sandioriva', 'B', '12', '02', '07', 'harian', 'belum_lunas', 20000, 47, 'aktif'),
  ('Bpk. Raden Saleh', 'B', '13', '02', '07', 'harian', 'belum_lunas', 20000, 48, 'aktif'),
  ('Bpk. Samsul Bahri', 'B', '14', '02', '07', 'bulanan', 'lunas', 20000, 49, 'aktif'),
  ('Bpk. Taufik Hidayat', 'B', '15', '02', '07', 'harian', 'belum_lunas', 20000, 50, 'aktif'),
  ('Ibu Umi Kalsum', 'B', '16', '02', '07', 'harian', 'belum_lunas', 20000, 51, 'aktif'),
  ('Bpk. Victor Imanuel', 'B', '17', '02', '07', 'bulanan', 'lunas', 20000, 52, 'aktif'),
  ('Bpk. Wawan Hermawan', 'B', '18', '02', '07', 'harian', 'belum_lunas', 20000, 53, 'aktif'),
  ('Bpk. Xaverius', 'B', '19', '02', '07', 'harian', 'belum_lunas', 20000, 54, 'aktif'),
  ('Ibu Yuni Shara', 'B', '20', '02', '07', 'bulanan', 'belum_lunas', 20000, 55, 'aktif'),
  ('Bpk. Zulkifli Hasan', 'B', '21', '02', '07', 'harian', 'belum_lunas', 20000, 56, 'aktif'),
  ('Bpk. Anjar Asmara', 'B', '22', '02', '07', 'harian', 'belum_lunas', 20000, 57, 'aktif'),
  ('Bpk. Bayu Skak', 'B', '23', '02', '07', 'bulanan', 'lunas', 20000, 58, 'aktif'),
  ('Ibu Cindy Fatika', 'B', '24', '02', '07', 'harian', 'belum_lunas', 20000, 59, 'aktif'),
  ('Bpk. Danang Sutowijoyo', 'B', '25', '02', '07', 'harian', 'belum_lunas', 20000, 60, 'aktif'),
  ('Bpk. Edi Brokoli', 'B', '26', '02', '07', 'bulanan', 'lunas', 30000, 61, 'aktif'),
  ('Bpk. Farhan Hakim', 'B', '27', '02', '07', 'harian', 'belum_lunas', 20000, 62, 'aktif'),
  ('Ibu Gita Gutawa', 'B', '28', '02', '07', 'harian', 'belum_lunas', 20000, 63, 'aktif'),
  ('Bpk. Harun Al Rasyid', 'B', '29', '02', '07', 'bulanan', 'lunas', 20000, 64, 'aktif'),
  ('Bpk. Iwan Fals', 'B', '30', '02', '07', 'harian', 'belum_lunas', 20000, 65, 'aktif'),
  ('Bpk. Jamal Mirdad', 'B', '31', '02', '07', 'harian', 'belum_lunas', 20000, 66, 'aktif'),
  ('Bpk. Komarudin', 'B', '32', '02', '07', 'bulanan', 'lunas', 20000, 67, 'aktif'),
  ('Ibu Lina Marlina', 'B', '33', '02', '07', 'harian', 'belum_lunas', 20000, 68, 'aktif'),
  ('Bpk. Mahmud Yunus', 'B', '34', '02', '07', 'harian', 'belum_lunas', 20000, 69, 'aktif'),
  ('Bpk. Nanang Qosim', 'B', '35', '02', '07', 'bulanan', 'lunas', 20000, 70, 'aktif'),

  -- BLOK C (1 s/d 35)
  ('Bpk. Oemar Bakri', 'C', '01', '02', '07', 'harian', 'belum_lunas', 20000, 71, 'aktif'),
  ('Bpk. Parto Patrio', 'C', '02', '02', '07', 'bulanan', 'lunas', 20000, 72, 'aktif'),
  ('Ibu Qonita Syahidah', 'C', '03', '02', '07', 'harian', 'belum_lunas', 20000, 73, 'aktif'),
  ('Bpk. Ronaldikin', 'C', '04', '02', '07', 'harian', 'belum_lunas', 20000, 74, 'aktif'),
  ('Bpk. Sule Prikitiew', 'C', '05', '02', '07', 'bulanan', 'lunas', 25000, 75, 'aktif'),
  ('Bpk. Tukul Arwana', 'C', '06', '02', '07', 'harian', 'belum_lunas', 20000, 76, 'aktif'),
  ('Ibu Uut Permatasari', 'C', '07', '02', '07', 'harian', 'belum_lunas', 20000, 77, 'aktif'),
  ('Bpk. Vino Bastian', 'C', '08', '02', '07', 'bulanan', 'belum_lunas', 20000, 78, 'aktif'),
  ('Bpk. Wendy Cagur', 'C', '09', '02', '07', 'harian', 'belum_lunas', 20000, 79, 'aktif'),
  ('Bpk. Yayan Ruhian', 'C', '10', '02', '07', 'harian', 'belum_lunas', 20000, 80, 'aktif'),
  ('Bpk. Zainuddin MZ', 'C', '11', '02', '07', 'bulanan', 'lunas', 20000, 81, 'aktif'),
  ('Ibu Ainun Habibie', 'C', '12', '02', '07', 'harian', 'belum_lunas', 20000, 82, 'aktif'),
  ('Bpk. Baim Wong', 'C', '13', '02', '07', 'harian', 'belum_lunas', 20000, 83, 'aktif'),
  ('Bpk. Caisar Putra', 'C', '14', '02', '07', 'bulanan', 'lunas', 20000, 84, 'aktif'),
  ('Bpk. Denny Cagur', 'C', '15', '02', '07', 'harian', 'belum_lunas', 20000, 85, 'aktif'),
  ('Ibu Enzy Storia', 'C', '16', '02', '07', 'harian', 'belum_lunas', 20000, 86, 'aktif'),
  ('Bpk. Fedi Nuril', 'C', '17', '02', '07', 'bulanan', 'lunas', 20000, 87, 'aktif'),
  ('Bpk. Gading Marten', 'C', '18', '02', '07', 'harian', 'belum_lunas', 20000, 88, 'aktif'),
  ('Bpk. Hesti Purwadinata', 'C', '19', '02', '07', 'harian', 'belum_lunas', 20000, 89, 'aktif'),
  ('Ibu Isyana Sarasvati', 'C', '20', '02', '07', 'bulanan', 'belum_lunas', 20000, 90, 'aktif'),
  ('Bpk. Joe Taslim', 'C', '21', '02', '07', 'harian', 'belum_lunas', 20000, 91, 'aktif'),
  ('Bpk. Kunto Aji', 'C', '22', '02', '07', 'harian', 'belum_lunas', 20000, 92, 'aktif'),
  ('Bpk. Lukman Sardi', 'C', '23', '02', '07', 'bulanan', 'lunas', 20000, 93, 'aktif'),
  ('Ibu Maudy Ayunda', 'C', '24', '02', '07', 'harian', 'belum_lunas', 20000, 94, 'aktif'),
  ('Bpk. Nicholas Saputra', 'C', '25', '02', '07', 'harian', 'belum_lunas', 20000, 95, 'aktif'),
  ('Bpk. Onadio Leonardo', 'C', '26', '02', '07', 'bulanan', 'lunas', 30000, 96, 'aktif'),
  ('Bpk. Prabu Revolusi', 'C', '27', '02', '07', 'harian', 'belum_lunas', 20000, 97, 'aktif'),
  ('Ibu Raisa Andriana', 'C', '28', '02', '07', 'harian', 'belum_lunas', 20000, 98, 'aktif'),
  ('Bpk. Reza Rahadian', 'C', '29', '02', '07', 'bulanan', 'lunas', 20000, 99, 'aktif'),
  ('Bpk. Surya Insomnia', 'C', '30', '02', '07', 'harian', 'belum_lunas', 20000, 100, 'aktif'),
  ('Bpk. Tora Sudiro', 'C', '31', '02', '07', 'harian', 'belum_lunas', 20000, 101, 'aktif'),
  ('Bpk. Uus Wijaksana', 'C', '32', '02', '07', 'bulanan', 'lunas', 20000, 102, 'aktif'),
  ('Ibu Valerie Thomas', 'C', '33', '02', '07', 'harian', 'belum_lunas', 20000, 103, 'aktif'),
  ('Bpk. Winky Wiryawan', 'C', '34', '02', '07', 'harian', 'belum_lunas', 20000, 104, 'aktif'),
  ('Bpk. Yudha Keling', 'C', '35', '02', '07', 'bulanan', 'lunas', 20000, 105, 'aktif'),

  -- BLOK D (1 s/d 35)
  ('Bpk. Zidni Ilman', 'D', '01', '02', '07', 'harian', 'belum_lunas', 20000, 106, 'aktif'),
  ('Bpk. Abimana Aryasatya', 'D', '02', '02', '07', 'bulanan', 'lunas', 20000, 107, 'aktif'),
  ('Ibu Bunga Citra', 'D', '03', '02', '07', 'harian', 'belum_lunas', 20000, 108, 'aktif'),
  ('Bpk. Chicco Jerikho', 'D', '04', '02', '07', 'harian', 'belum_lunas', 20000, 109, 'aktif'),
  ('Bpk. Dwi Sasono', 'D', '05', '02', '07', 'bulanan', 'lunas', 20000, 110, 'aktif'),
  ('Bpk. El Rumi', 'D', '06', '02', '07', 'harian', 'belum_lunas', 20000, 111, 'aktif'),
  ('Ibu Franda Stefan', 'D', '07', '02', '07', 'harian', 'belum_lunas', 20000, 112, 'aktif'),
  ('Bpk. Glenn Fredly', 'D', '08', '02', '07', 'bulanan', 'belum_lunas', 20000, 113, 'aktif'),
  ('Bpk. Herjunot Ali', 'D', '09', '02', '07', 'harian', 'belum_lunas', 20000, 114, 'aktif'),
  ('Bpk. Ibnu Jamil', 'D', '10', '02', '07', 'harian', 'belum_lunas', 20000, 115, 'aktif'),
  ('Bpk. Judika Sihotang', 'D', '11', '02', '07', 'bulanan', 'lunas', 25000, 116, 'aktif'),
  ('Ibu Krisdayanti', 'D', '12', '02', '07', 'harian', 'belum_lunas', 20000, 117, 'aktif'),
  ('Bpk. Luna Maya', 'D', '13', '02', '07', 'harian', 'belum_lunas', 20000, 118, 'aktif'),
  ('Bpk. Marcel Chandrawinata', 'D', '14', '02', '07', 'bulanan', 'lunas', 20000, 119, 'aktif'),
  ('Bpk. Nino Fernandez', 'D', '15', '02', '07', 'harian', 'belum_lunas', 20000, 120, 'aktif'),
  ('Ibu Olla Ramlan', 'D', '16', '02', '07', 'harian', 'belum_lunas', 20000, 121, 'aktif'),
  ('Bpk. Pasha Ungu', 'D', '17', '02', '07', 'bulanan', 'lunas', 20000, 122, 'aktif'),
  ('Bpk. Randy Pangalila', 'D', '18', '02', '07', 'harian', 'belum_lunas', 20000, 123, 'aktif'),
  ('Bpk. Sammy Simorangkir', 'D', '19', '02', '07', 'harian', 'belum_lunas', 20000, 124, 'aktif'),
  ('Ibu Tiara Andini', 'D', '20', '02', '07', 'bulanan', 'belum_lunas', 20000, 125, 'aktif'),
  ('Bpk. Ungu Cliquers', 'D', '21', '02', '07', 'harian', 'belum_lunas', 20000, 126, 'aktif'),
  ('Bpk. Vidi Aldiano', 'D', '22', '02', '07', 'harian', 'belum_lunas', 20000, 127, 'aktif'),
  ('Bpk. Widi Mulia', 'D', '23', '02', '07', 'bulanan', 'lunas', 20000, 128, 'aktif'),
  ('Ibu Yura Yunita', 'D', '24', '02', '07', 'harian', 'belum_lunas', 20000, 129, 'aktif'),
  ('Bpk. Ziva Magnolya', 'D', '25', '02', '07', 'harian', 'belum_lunas', 20000, 130, 'aktif'),
  ('Bpk. Ari Lasso', 'D', '26', '02', '07', 'bulanan', 'lunas', 20000, 131, 'aktif'),
  ('Bpk. Bebi Romeo', 'D', '27', '02', '07', 'harian', 'belum_lunas', 20000, 132, 'aktif'),
  ('Ibu Cita Citata', 'D', '28', '02', '07', 'harian', 'belum_lunas', 20000, 133, 'aktif'),
  ('Bpk. Duta Sheila', 'D', '29', '02', '07', 'bulanan', 'lunas', 20000, 134, 'aktif'),
  ('Bpk. Eros Candra', 'D', '30', '02', '07', 'harian', 'belum_lunas', 20000, 135, 'aktif'),
  ('Bpk. Fadly Padi', 'D', '31', '02', '07', 'harian', 'belum_lunas', 20000, 136, 'aktif'),
  ('Bpk. Giring Ganesha', 'D', '32', '02', '07', 'bulanan', 'lunas', 20000, 137, 'aktif'),
  ('Ibu Hetty Koes Endang', 'D', '33', '02', '07', 'harian', 'belum_lunas', 20000, 138, 'aktif'),
  ('Bpk. Ian Antono', 'D', '34', '02', '07', 'harian', 'belum_lunas', 20000, 139, 'aktif'),
  ('Bpk. Joy Tobing', 'D', '35', '02', '07', 'bulanan', 'lunas', 20000, 140, 'aktif'),

  -- BLOK E (1 s/d 30) -> Total keseluruhan 170 Rumah
  ('Bpk. Kaka Slank', 'E', '01', '02', '07', 'harian', 'belum_lunas', 20000, 141, 'aktif'),
  ('Bpk. Lilo KLa', 'E', '02', '02', '07', 'bulanan', 'lunas', 20000, 142, 'aktif'),
  ('Ibu Memes Addie', 'E', '03', '02', '07', 'harian', 'belum_lunas', 20000, 143, 'aktif'),
  ('Bpk. Nugie Agustinus', 'E', '04', '02', '07', 'harian', 'belum_lunas', 20000, 144, 'aktif'),
  ('Bpk. Once Mekel', 'E', '05', '02', '07', 'bulanan', 'lunas', 25000, 145, 'aktif'),
  ('Bpk. Piyu Padi', 'E', '06', '02', '07', 'harian', 'belum_lunas', 20000, 146, 'aktif'),
  ('Ibu Queen Marwah', 'E', '07', '02', '07', 'harian', 'belum_lunas', 20000, 147, 'aktif'),
  ('Bpk. Rhoma Irama', 'E', '08', '02', '07', 'bulanan', 'belum_lunas', 20000, 148, 'aktif'),
  ('Bpk. Setiawan Djodi', 'E', '09', '02', '07', 'harian', 'belum_lunas', 20000, 149, 'aktif'),
  ('Bpk. Tantowi Yahya', 'E', '10', '02', '07', 'harian', 'belum_lunas', 20000, 150, 'aktif'),
  ('Bpk. Uki Kautsar', 'E', '11', '02', '07', 'bulanan', 'lunas', 20000, 151, 'aktif'),
  ('Ibu Vina Panduwinata', 'E', '12', '02', '07', 'harian', 'belum_lunas', 20000, 152, 'aktif'),
  ('Bpk. Waljinah', 'E', '13', '02', '07', 'harian', 'belum_lunas', 20000, 153, 'aktif'),
  ('Bpk. Yovie Widianto', 'E', '14', '02', '07', 'bulanan', 'lunas', 20000, 154, 'aktif'),
  ('Bpk. Zakaria', 'E', '15', '02', '07', 'harian', 'belum_lunas', 20000, 155, 'aktif'),
  ('Ibu Anita Hara', 'E', '16', '02', '07', 'harian', 'belum_lunas', 20000, 156, 'aktif'),
  ('Bpk. Bobby Nasution', 'E', '17', '02', '07', 'bulanan', 'lunas', 20000, 157, 'aktif'),
  ('Bpk. Choky Sitohang', 'E', '18', '02', '07', 'harian', 'belum_lunas', 20000, 158, 'aktif'),
  ('Bpk. Daus Mini', 'E', '19', '02', '07', 'harian', 'belum_lunas', 20000, 159, 'aktif'),
  ('Ibu Endah N Rhesa', 'E', '20', '02', '07', 'bulanan', 'belum_lunas', 20000, 160, 'aktif'),
  ('Bpk. Ferry Salim', 'E', '21', '02', '07', 'harian', 'belum_lunas', 20000, 161, 'aktif'),
  ('Bpk. Giring Nidji', 'E', '22', '02', '07', 'harian', 'belum_lunas', 20000, 162, 'aktif'),
  ('Bpk. Helmy Yahya', 'E', '23', '02', '07', 'bulanan', 'lunas', 20000, 163, 'aktif'),
  ('Ibu Inul Daratista', 'E', '24', '02', '07', 'harian', 'belum_lunas', 20000, 164, 'aktif'),
  ('Bpk. Jojon Suwarno', 'E', '25', '02', '07', 'harian', 'belum_lunas', 20000, 165, 'aktif'),
  ('Bpk. Komeng Spontan', 'E', '26', '02', '07', 'bulanan', 'lunas', 30000, 166, 'aktif'),
  ('Bpk. Limbad Master', 'E', '27', '02', '07', 'harian', 'belum_lunas', 20000, 167, 'aktif'),
  ('Ibu Maya Estianty', 'E', '28', '02', '07', 'harian', 'belum_lunas', 20000, 168, 'aktif'),
  ('Bpk. Narji Cagur', 'E', '29', '02', '07', 'bulanan', 'lunas', 20000, 169, 'aktif'),
  ('Bpk. Opie Kumis', 'E', '30', '02', '07', 'harian', 'belum_lunas', 20000, 170, 'aktif');
