# PRD: Sistem Jimpitan Digital
**Versi:** 2.0 (Post-Brainstorming Review)  
**Tanggal:** 11 Oktober 2026  
**Pemilik:** Dandy (Developer)  
**Status:** Validated — Ready for Implementation Planning  

---

## Daftar Isi

1. [Latar Belakang](#1-latar-belakang)
2. [Masalah yang Diselesaikan](#2-masalah-yang-diselesaikan)
3. [Profil Pengguna & Skala Komunitas](#3-profil-pengguna--skala-komunitas)
4. [Arsitektur Sistem & Local-First Strategy](#4-arsitektur-sistem--local-first-strategy)
5. [Peta Fitur & Fase Rilis](#5-peta-fitur--fase-rilis)
6. [Spesifikasi Fitur: Portal Petugas Ronda (Jimpitanku - Mobile Fintech)](#6-spesifikasi-fitur-portal-petugas-ronda-jimpitanku---mobile-fintech)
7. [Spesifikasi Fitur: Dashboard Bendahara (Modern Finance Management)](#7-spesifikasi-fitur-dashboard-bendahara-modern-finance-management)
8. [Spesifikasi Fitur: Portal Warga (Read-Only via QR)](#8-spesifikasi-fitur-portal-warga-read-only-via-qr)
9. [Database Schema (Supabase PostgreSQL)](#9-database-schema-supabase-postgresql)
10. [Row Level Security (RLS) & Access Control](#10-row-level-security-rls--access-control)
11. [Alur Kerja Operasional (Workflows)](#11-alur-kerja-operasional-workflows)
12. [State Handling & Toleransi Jaringan (Offline Queue)](#12-state-handling--toleransi-jaringan-offline-queue)
13. [Audit Codebase & Rencana Refactor](#13-audit-codebase--rencana-refactor)
14. [Rencana Migrasi Teknis](#14-rencana-migrasi-teknis)
15. [Batasan & Asumsi](#15-batasan--asumsi)
16. [Metrik Keberhasilan](#16-metrik-keberhasilan)

---

## 1. Latar Belakang

Jimpitan adalah tradisi pengumpulan uang sukarela warga perumahan yang diambil setiap malam saat ronda keliling. Di perumahan dengan **170 rumah**, proses pencatatan dan pengelolaan keuangan saat ini masih manual:

- **Petugas ronda (1 orang per malam)** berkeliling memeriksa kaleng jimpitan dan mencatat tarikan di aplikasi notes HP atau kertas.
- **Sebagian warga memilih membayar iuran secara bulanan** langsung ke Bendahara (transfer/tunai), sehingga tidak menaruh koin harian di kaleng depan rumah.
- **Bendahara RT** merekap keuangan secara manual dari setoran fisik dan buku spreadsheet.
- **Tantangan utama:** Sering terjadi human error, selisih uang fisik vs catatan, kerepotan petugas membedakan mana warga yang bayar harian vs bulanan, serta kendala jaringan seluler yang hilang-timbul di sudut-sudut perumahan saat ronda larut malam.

---

## 2. Masalah yang Diselesaikan

| # | Masalah Lapangan | Solusi Sistem Digital |
|---|------------------|-----------------------|
| M-1 | Petugas repot mencatat manual sambil jalan malam di 170 rumah | Antarmuka mobile ala Fintech (DANA/GoPay) dengan tombol *quick-tap* < 5 detik per rumah dan pengelompokan per blok. |
| M-2 | Petugas bingung membedakan warga harian vs warga yang sudah bayar bulanan ke bendahara | Filter otomatis "Hanya Target Harian"; warga yang bayar bulanan lunas otomatis bertanda `Iuran Bulanan (Lunas)` dan dilewati dari rute ronda. |
| M-3 | Sinyal internet drop/blank spot di gang belakang perumahan | Sistem **Reactive Local-First dengan Offline Queue**: input tetap bisa disimpan secara lokal, dan otomatis tersinkronisasi saat sinyal kembali normal. |
| M-4 | Double work & rawan selisih uang setoran fisik vs catatan digital | Alur "Selesai Ronda & Kunci Setoran" oleh petugas, dilanjutkan rekonsiliasi interaktif oleh bendahara (*Cocok & Verifikasi* vs *Flag Anomali*). |
| M-5 | Rekap kas bulanan memakan waktu dan rentan salah hitung | Buku kas digital otomatis terintegrasi dengan setoran jimpitan dan iuran bulanan warga, dilengkapi fitur export laporan PDF resmi untuk rapat RT. |
| M-6 | Warga tidak punya akses memantau riwayat setoran pribadi | Halaman profil status pembayaran *read-only* yang dapat dibuka langsung via scan QR code stiker di kaleng jimpitan tanpa perlu login. |

---

## 3. Profil Pengguna & Skala Komunitas

### 3.1 Skala Komunitas
- **Total Hunian:** 170 rumah terbagi dalam beberapa blok (misal: Blok A s/d Blok E).
- **Struktur Iuran:**
  - **Tipe Harian:** Mayoritas warga menaruh uang koin/kertas (Rp 1.000, Rp 2.000, Rp 5.000) di kaleng jimpitan tiap malam.
  - **Tipe Bulanan:** Warga yang menyetor uang bulanan (misal: Rp 20.000–Rp 50.000) sekaligus di awal bulan langsung ke bendahara.

### 3.2 Profil Pengguna
1. **Petugas Ronda (1 Petugas / 1 Perangkat per Malam):**
   - Warga yang bertugas ronda malam (usia 25–50 tahun).
   - Menggunakan HP pribadi (Android/iOS mid-range), operasi satu tangan, berjalan di malam hari (21:00–24:00).
   - Membutuhkan sistem yang tidak lelet, tombol tap besar, dan sesi login yang tidak sering logout sendiri.
2. **Bendahara RT:**
   - Pengurus keuangan perumahan.
   - Menggunakan laptop/desktop (utama) dan HP (saat darurat).
   - Membutuhkan dashboard modern finance management untuk verifikasi setoran fisik, input kas pengeluaran RT, serta cetak laporan keuangan.
3. **Warga Perumahan (Read-Only):**
   - Cukup memindai QR code di kaleng jimpitan untuk mengecek riwayat pembayaran 6 bulan terakhir.

---

## 4. Arsitektur Sistem & Local-First Strategy

### 4.1 Tech Stack
- **Frontend Core:** React 19 + TypeScript + Vite 8
- **Styling & Design Tokens:** Tailwind CSS 4 + Design tokens dari `docs/design.md` (Plus Jakarta Sans, warna primer `hsl(158, 72%, 32%)`)
- **Icons:** Lucide React
- **Backend & Cloud Database:** Supabase (PostgreSQL, Auth, Realtime Subscriptions, Row Level Security)
- **Local Persistence & Sync:** Custom Reactive Local-First Data Layer (IndexedDB / LocalStorage Cache + Mutation Queue)
- **Document Generation:** `jspdf` + `jspdf-autotable`

### 4.2 Data Flow Diagram (Hybrid Local-First)
```
┌─────────────────────────────────────────────────────────┐
│                     HP PETUGAS RONDA                    │
│                                                         │
│  [UI Input Ronda] ──▶ [Local Cache (IndexedDB/State)]   │
│           │                     ▲                       │
│     (Optimistic 0ms)            │ (Update State)        │
│           ▼                     │                       │
│    [Offline Sync Queue] ────────┤                       │
│           │ (Ada Sinyal?)                               │
└───────────┼─────────────────────────────────────────────┘
            │ YES (Background Sync)
            ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE CLOUD PLATFORM                │
│                                                         │
│  - PostgreSQL Database (warga, records, kas, verifikasi)│
│  - Auth (Role 'petugas' & 'bendahara')                  │
│  - Realtime Subscriptions (Broadcast ke Dashboard)      │
└───────────────────────────┬─────────────────────────────┘
                            │ Realtime Push
                            ▼
┌─────────────────────────────────────────────────────────┐
│                LAPTOP BENDAHARA (DASHBOARD)             │
│                                                         │
│  - Pantau Progress Ronda Real-time                      │
│  - Verifikasi Setoran Fisik vs Digital                  │
│  - Manajemen Kas & Iuran Bulanan                        │
│  - Export Laporan PDF                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Peta Fitur & Fase Rilis

### Fase 1: Fondasi & Kesiapan Lapangan (Prioritas Kritis)
- **F-01:** Setup Skema Database Supabase & Data Repository Layer dengan Local-First Mock/Fallback Adapter.
- **F-02:** Sistem Otentikasi Terpadu (Supabase Auth) dengan Smart Role-Based Routing (`petugas` vs `bendahara`).
- **F-03:** Penerapan Design System `docs/design.md` (Mobile Fintech DANA/GoPay untuk Petugas & Modern Finance untuk Bendahara).
- **F-04:** Portal Petugas dengan Offline Queue, Quick-Tap (Rp 2.000 / Kosong), dan Filter Blok.
- **F-05:** Manajemen Tipe Warga (Harian vs Bulanan) dengan status otomatis `Iuran Bulanan (Lunas)`.
- **F-06:** Dashboard Ringkasan Finansial Bendahara (Saldo Kas, Pemasukan, Pengeluaran).

### Fase 2: Rekonsiliasi & Pelaporan (Prioritas Tinggi)
- **F-07:** Alur Selesai Ronda & Modul Rekonsiliasi Setoran Bendahara (*Cocok & Verifikasi* vs *Flag Anomali*).
- **F-08:** Pencatatan Transaksi Kas RT & Pembayaran Iuran Bulanan Langsung.
- **F-09:** Ekspor Laporan Keuangan Bulanan & Rekap Ronda ke format PDF.
- **F-10:** Manajemen Akun Petugas oleh Bendahara (Admin membuatkan kredensial petugas).

### Fase 3: Portal Warga & Peningkatan Komunitas (Fase Lanjutan)
- **F-11:** Halaman Status Warga Read-Only (`/warga/:id`).
- **F-12:** Generator & Pencetak Stiker QR Code Kaleng Jimpitan per Rumah.
- **F-13:** Pengurutan Rute Ronda Fisik (*Route Order Optimizer*) untuk efisiensi jalan 170 rumah.

---

## 6. Spesifikasi Fitur: Portal Petugas Ronda (Jimpitanku - Mobile Fintech)

### 6.1 Layout & Visual Identity (Fintech DANA / GoPay Reference)
- **Header Wallet Card:**
  - Kartu utama hijau tua (*Forest Emerald* `hsl(158, 72%, 32%)`).
  - Total tarikan malam ini (font 28px tebal, *tabular figures*).
  - Indikator status koneksi di sudut kanan atas:
    - *Online:* Dot hijau `Tersambung (Cloud)`.
    - *Offline:* Dot oranye `Offline — X antrean lokal`.
  - Tombol aksi di dalam kartu: `⚡ Mulai Ronda`, `📷 Scan QR`, `📋 Rekap Selesai`.
- **Progress Meter Ronda:**
  - "Target Harian Malam Ini: **38 / 95 Rumah** (Rp 76.000)".
  - Sub-keterangan: "75 Warga Bayar Bulanan Otomatis Dilewati".
- **Floating Bottom Nav (4 Tab Maksimal):**
  - Beranda, Tarikan, Riwayat, Data Warga.

### 6.2 Alur Input Tarikan (Tab Tarikan)
- **Sticky Filter Pills:** Filter blok (`Semua`, `Blok A`, `Blok B`, `Blok C`, dll.) + Sakelar `[Sembunyikan Warga Bulanan]`.
- **Daftar Rumah (Card Tap $\ge 52\text{px}$):**
  - Nomor rumah tebal (misal: `Blok B No. 12 — Bpk. Sugeng`).
  - **Tombol Quick-Tap 1-Sentuhan:**
    - Tombol Hijau `✓` (Lunas Rp 2.000 default) $\rightarrow$ langsung tersimpan dalam < 50ms (Optimistic UI).
    - Tombol Abu-abu `✗` (Kosong) $\rightarrow$ tandai rumah kosong tanpa tarikan.
  - **Ketuk Badan Kartu:** Membuka *bottom sheet* untuk nominal khusus (Rp 1.000, Rp 5.000, Custom) atau catatan tambahan.
- **Warga Bulanan:** Bertanda chip `Iuran Bulanan (Lunas)` dan tombol tarikan dinonaktifkan agar tidak terjadi penarikan ganda.

### 6.3 Fitur "Selesaikan Ronda Malam Ini"
- Di akhir shift, petugas menekan tombol **"Selesaikan Ronda"**.
- Menampilkan ringkasan uang fisik:
  - Total rumah terlayani: X rumah.
  - **Total Uang Fisik Terkumpul: Rp XXX.XXX** (angka besar pembanding saat hitung fisik).
- Tombol **"Kunci & Siapkan Setoran"**: Menyimpan status ke `daily_verifications` sebagai `pending`, siap diserahkan ke bendahara.

---

## 7. Spesifikasi Fitur: Dashboard Bendahara (Modern Finance Management)

### 7.1 Layout & Visual Direction (Mercury / Stripe Reference)
- **Sidebar Navigasi Kiri:** Menu Dashboard, Verifikasi Setoran, Data Warga & Iuran, Buku Kas RT, Cetak Laporan PDF, Kelola Petugas.
- **Metric Cards (KPI Keuangan):**
  1. *Total Saldo Kas RT*
  2. *Pemasukan Bulan Ini* (Breakdown: Jimpitan Harian + Iuran Bulanan)
  3. *Pengeluaran Bulan Ini*
  4. *Setoran Belum Diverifikasi* (Badge peringatan amber jika ada setoran yang belum dihitung).

### 7.2 Modul Rekonsiliasi Setoran (The Verification Center)
- Menampilkan daftar serah terima per tanggal ronda.
- Komparasi sisi-ke-sisi:
  - *Catatan Digital Petugas:* Rp 184.000 (dari 92 rumah tercatat).
  - *Input Uang Fisik yang Diterima Bendahara:* Form input nominal uang fisik.
- Aksi Rekonsiliasi:
  - Jika nominal cocok $\rightarrow$ Tombol **"Cocok & Verifikasi"** (otomatis membukukan pemasukan ke tabel kas).
  - Jika ada selisih $\rightarrow$ Tombol **"Flag Selisih"** (menghitung selisih otomatis dan mewajibkan catatan anomali untuk audit RT).

### 7.3 Manajemen Iuran Bulanan & Data Warga
- Tabel 170 warga dengan search instan dan filter blok.
- Tombol cepat **"Catat Bayar Bulanan"**: Bendahara memilih warga $\rightarrow$ input nominal $\rightarrow$ status warga langsung menjadi `lunas` untuk bulan berjalan, otomatis ter-sync ke HP petugas ronda.

### 7.4 Manajemen Akun Petugas
- Halaman bagi Bendahara untuk menambahkan akun petugas ronda (Nama, Username/Email, Password) tanpa registrasi publik terbuka.

### 7.5 Ekspor Laporan PDF
- Generator client-side menggunakan `jsPDF` untuk mencetak:
  - Laporan Rekapitulasi Kas Bulanan (Saldo Awal, Pemasukan, Pengeluaran, Saldo Akhir).
  - Laporan Rincian Setoran Ronda Harian.

---

## 8. Spesifikasi Fitur: Portal Warga (Read-Only via QR)

- Akses publik tanpa login melalui URL `/warga/:id` atau hasil scan QR code pada kaleng jimpitan.
- Menampilkan:
  - Nama Kepala Keluarga & Alamat (Blok / No. Rumah).
  - Tipe Iuran (Harian / Bulanan).
  - Status Pembayaran Bulan Berjalan.
  - Riwayat Kontribusi 6 Bulan Terakhir.
- Bersifat murni *read-only* (tidak menampilkan data warga lain atau saldo total kas RT demi privasi).

---

## 9. Database Schema (Supabase PostgreSQL)

```sql
-- 1. Profiles (User Roles)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('petugas', 'bendahara')),
  no_hp       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Master Data Warga
CREATE TABLE public.warga (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama                TEXT NOT NULL,
  blok                TEXT NOT NULL,
  no_rumah            TEXT NOT NULL,
  rt                  TEXT NOT NULL DEFAULT '02',
  rw                  TEXT NOT NULL DEFAULT '07',
  no_hp               TEXT,
  tipe_iuran          TEXT NOT NULL DEFAULT 'harian' CHECK (tipe_iuran IN ('harian', 'bulanan')),
  status_bulanan      TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status_bulanan IN ('lunas', 'belum_lunas')),
  nominal_bulanan     BIGINT DEFAULT 20000,
  urutan_rute         INTEGER DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blok, no_rumah)
);

-- 3. Tarikan Harian Jimpitan
CREATE TABLE public.jimpitan_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id            UUID NOT NULL REFERENCES public.warga(id),
  tanggal             DATE NOT NULL,
  nominal             BIGINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('lunas', 'sebagian', 'kosong')),
  petugas_id          UUID NOT NULL REFERENCES auth.users(id),
  petugas_nama        TEXT,
  catatan             TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(warga_id, tanggal)
);

-- 4. Verifikasi Harian (Serah Terima Setoran)
CREATE TABLE public.daily_verifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal               DATE NOT NULL UNIQUE,
  petugas_id            UUID NOT NULL REFERENCES auth.users(id),
  petugas_nama          TEXT,
  total_rumah_tercatat  INTEGER NOT NULL,
  total_nominal_sistem  BIGINT NOT NULL,
  actual_nominal_fisik  BIGINT,
  selisih               BIGINT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged')),
  catatan_selisih       TEXT,
  verified_by           UUID REFERENCES auth.users(id),
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- 5. Buku Kas RT (Pemasukan & Pengeluaran)
CREATE TABLE public.kas_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe              TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  kategori          TEXT NOT NULL,
  nominal           BIGINT NOT NULL,
  tanggal           DATE NOT NULL,
  deskripsi         TEXT NOT NULL,
  penanggung_jawab  TEXT NOT NULL,
  warga_id          UUID REFERENCES public.warga(id),
  bukti_url         TEXT,
  created_by        UUID NOT NULL REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. Row Level Security (RLS) & Access Control

1. **Tabel `warga`:**
   - `petugas`: `SELECT` semua warga aktif.
   - `bendahara`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` (soft delete).
2. **Tabel `jimpitan_records`:**
   - `petugas`: `SELECT`, `INSERT`, `UPDATE` (hanya record miliknya pada tanggal hari ini).
   - `bendahara`: `SELECT` semua, `UPDATE` (rekonsiliasi verifikasi).
3. **Tabel `daily_verifications`:**
   - `petugas`: `INSERT`, `SELECT` data shift rondanya.
   - `bendahara`: `SELECT` semua, `UPDATE` status verifikasi.
4. **Tabel `kas_transactions`:**
   - `bendahara`: Hak penuh (`ALL`).
   - `petugas`: `SELECT` ringkasan jika diizinkan (atau terisolasi).
5. **Portal Publik Warga (`/warga/:id`):**
   - Akses dibatasi hanya melalui RPC/fungsi aman atau view terproteksi yang menyaring informasi privat.

---

## 11. Alur Kerja Operasional (Workflows)

### 11.1 Alur Malam Ronda (Petugas)
```
21:00 Petugas buka HP ──▶ Sesi login aktif otomatis
           │
           ▼
Buka Tab Tarikan ──▶ Filter "Hanya Target Harian" aktif otomatis
           │
           ▼
Keliling ke Rumah (1 per 1) ──▶ Tap ✓ (Lunas Rp 2.000) dalam < 5 detik
  ├── Jika ada sinyal: Data langsung terkirim ke Supabase
  └── Jika blank spot: Data masuk antrean offline lokal (Optimistic UI tetap hijau)
           │
           ▼
Selesai Keliling ──▶ Tekan "Selesaikan Ronda Malam Ini"
           │
           ▼
Lihat Total Uang Fisik ──▶ Hitung uang di kantong ──▶ Tekan "Kunci & Setor"
```

### 11.2 Alur Rekonsiliasi Pagi Hari (Bendahara)
```
08:00 Bendahara buka Dashboard di Laptop
           │
           ▼
Melihat Badge Alert: "1 Setoran Menunggu Verifikasi"
           │
           ▼
Hitung Uang Fisik dari Petugas ──▶ Buka Verifikasi Setoran
  ├── Uang Cocok: Klik "Cocok & Verifikasi" ──▶ Otomatis masuk Kas RT
  └── Uang Selisih: Masukkan nominal aktual ──▶ Tulis Catatan ──▶ Klik "Flag Selisih"
```

---

## 12. State Handling & Toleransi Jaringan (Offline Queue)

Aplikasi memiliki mekanisme penanganan 3 kondisi utama:
1. **Online (Normal):** Mutasi data langsung diproses ke Supabase; indikator menampilkan dot hijau.
2. **Offline / Fluktuasi Sinyal (Degraded):**
   - Mutasi disimpan ke antrean lokal `offline_queue` (IndexedDB / LocalStorage).
   - Optimistic UI: Tampilan kartu langsung ter-update seketika tanpa pesan error.
   - Indikator antrean menampilkan badge oranye (contoh: `Offline — 3 antrean tersimpan`).
   - Event listener `window.addEventListener('online')` mendeteksi kembalinya jaringan dan langsung menguras antrean (*background flush*).
3. **Empty & Error State:**
   - State kosong menyajikan penjelasan kontekstual (contoh: *"Belum ada tarikan malam ini. Mulai ronda dari Blok A"*).
   - State galat menyajikan tombol aksi pemulihan ("Coba Sinkronkan Ulang").

---

## 13. Audit Codebase & Rencana Refactor

| Modul Eksisting | Kondisi Saat Ini | Rencana Refaktor |
|-----------------|------------------|------------------|
| `src/App.tsx` | Menangani seluruh state monolitik & localStorage | Pecah menjadi Provider data layer (`DataProvider`) & Router berbasis peran |
| `src/components/auth/LoginView.tsx` | Kredensial hardcoded | Hubungkan ke Supabase Auth & Role-based redirection |
| `src/components/ronda/PetugasDashboard.tsx` | Logika tercampur dengan dummy data | Adaptasi ke antarmuka Mobile Fintech, hubungkan ke data service & offline queue |
| `src/components/admin/AdminDashboardView.tsx` | Fitur keuangan masih statis | Adaptasi ke layout Modern Finance Management, aktifkan modul verifikasi |
| `src/types/index.ts` | Tipe data dasar sudah ada | Tambahkan atribut `tipe_iuran`, `status_bulanan`, `verification_status` |

---

## 14. Rencana Migrasi Teknis

1. **Langkah 1: Setup Schema & Hybrid Data Layer**
   - Siapkan skrip SQL Supabase lengkap.
   - Buat `DataService` yang mendukung koneksi Supabase asli dengan fallback mode lokal untuk dev/testing.
2. **Langkah 2: Integrasi Supabase Auth & Role Routing**
   - Refactor `LoginView.tsx` untuk otentikasi Supabase.
   - Routing otomatis: `/` untuk Petugas, `/admin` untuk Bendahara.
3. **Langkah 3: Transformasi UI Portal Petugas (Mobile Fintech)**
   - Header Wallet Card, tab filter blok, quick-tap responsif, indikator offline queue, modal selesai ronda.
4. **Langkah 4: Transformasi Dashboard Bendahara (Modern Finance)**
   - Metric cards, modul rekonsiliasi serah terima, manajemen iuran warga bulanan, kelola akun petugas.
5. **Langkah 5: Fitur Export PDF & Portal Warga**
   - Generator laporan kas PDF, halaman publik warga via QR code.

---

## 15. Batasan & Asumsi

- **Batasan:**
  - Tanpa backend custom terpisah (mengandalkan Supabase BaaS & client logic).
  - Skala 170 rumah sepenuhnya terakomodasi di Free Tier Supabase (kapasitas 500 MB & kuota koneksi).
- **Asumsi:**
  - 1 petugas/perangkat per malam ronda (tanpa multi-writer conflict).
  - Uang jimpitan berupa nominal kecil pecahan Rp 1.000 s/d Rp 5.000.
  - Warga bulanan menyetor iuran langsung ke bendahara setiap awal bulan.

---

## 16. Metrik Keberhasilan

| Metrik | Target | Metode Pengukuran |
|--------|--------|-------------------|
| Waktu input per rumah | < 5 detik | Durasi dari membuka kartu hingga status lunas |
| Keandalan offline | 100% data tersimpan saat tanpa sinyal | Pengujian mutasi antrean saat mode pesawat / offline |
| Rekonsiliasi setoran | < 3 menit per pagi | Durasi serah terima dan pencocokan uang fisik bendahara |
| Kepuasan pengguna | Zero complaints dari petugas ronda | Tidak ada keluhan aplikasi hang atau loading lambat di malam hari |
