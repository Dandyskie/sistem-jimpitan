# Rekap Progres & Rencana Selanjutnya: Sistem Jimpitan Digital

**Tanggal Update:** 12 Oktober 2026  
**Status Terkini:** Tahap 1, 2, dan 3 Selesai 100% — Siap Masuk Tahap 4 (Portal Warga QR & Testing Multi-Device)  

---

## 1. Progres yang Telah Selesai (Completed)

### A. Dokumen & Spesifikasi Produk
- [x] **Brainstorming Mendalam:** Menyepakati penanganan realitas lapangan perumahan (170 rumah, 1 petugas ronda per malam, warga bayar bulanan vs harian, ketahanan offline).
- [x] **PRD Versi 2.0:** Diperbarui dan divalidasi di [docs/PRD.md](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/docs/PRD.md).
- [x] **Design System:** Diselaraskan di [docs/design.md](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/docs/design.md) dan [DESIGN.md](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/DESIGN.md):
  - **Portal Petugas:** Gaya Mobile Fintech Indonesia (DANA / GoPay / Bank Jago).
  - **Dashboard Bendahara:** Gaya Modern Finance Management (Mercury / Stripe / Aspire).

### B. Infrastruktur & Database Cloud (Supabase)
- [x] **Project Supabase Terhubung:**
  - URL dan Anon Key tersimpan dengan aman di [.env](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/.env).
  - Client Supabase siap di [src/lib/supabase.ts](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/src/lib/supabase.ts).
- [x] **Skrip Database Berhasil Dijalankan:**
  - File skrip: [supabase/schema.sql](file:///home/dandy/DANDYSKIE%20-%20WEB%20DEVELOPER/Belajar%20Fullstack/Sistem%20Jimpitan/supabase/schema.sql).
  - 5 tabel terbuat: `profiles`, `warga`, `jimpitan_records`, `daily_verifications`, `kas_transactions`.
  - Aturan keamanan Row Level Security (RLS) dan Realtime publication aktif.
- [x] **Master Data 170 Rumah Terverifikasi:**
  - Data warga Blok A (35), Blok B (35), Blok C (35), Blok D (35), dan Blok E (30) berhasil di-*seed* di cloud PostgreSQL Supabase dan sudah diverifikasi via query API.

### C. Dependencies Tambahan
- [x] Berhasil menginstall paket:
  - `@supabase/supabase-js` (SDK database & realtime)
  - `jspdf` & `jspdf-autotable` (Generator laporan PDF resmi)
  - `qrcode.react` (Generator QR code stiker kaleng jimpitan)

### D. Tahap 1: Data Layer & Offline Queue Engine (SELESAI)
- [x] **Model & Tipe TypeScript (`src/types/index.ts`):** Sinkronisasi lengkap model `Warga`, `Resident`, `JimpitanRecord`, `DailyVerification`, `KasTransaction`, `Profile`, `OfflineQueueItem`, dan `SyncStatus` dengan backward compatibility 100%.
- [x] **Data Service Layer (`src/services/dataService.ts`):**
  - Mengambil data master 170 warga dari cloud Supabase dengan fallback multi-level dan cache lokal.
  - **Offline Queue Engine:** Mendeteksi koneksi online/offline secara dinamis, menyimpan mutasi saat sinyal hilang, dan otomatis melakukan *flush queue* saat online kembali.
  - Supabase Realtime Channel listener untuk update otomatis antar perangkat.
- [x] **Auth Context & Sesi Awet (`src/context/AuthContext.tsx`):**
  - Sesi login awet (*persistent storage*).
  - Integrasi Supabase Auth dengan akun demo fallback untuk petugas dan bendahara.
- [x] **Sync Context (`src/context/SyncContext.tsx`):**
  - Mengalirkan status koneksi dan tombol picu sinkronisasi manual ke seluruh komponen UI.

### E. Tahap 2: UI Mobile Petugas Ronda - Fintech Style (SELESAI)
- [x] **Header Digital Wallet Card:** Nuansa *deep emerald* (`hsl(158, 72%, 28%)` ke `hsl(158, 78%, 18%)`), teks nominal tarikan malam ini besar & jelas dengan format rupiah dan tabular numbers (`tnum`), bar progres target harian, serta tombol aksi cepat.
- [x] **Pill Status Online / Offline Queue:** Indikator di pojok header yang menampilkan status realtime (Online / Offline / Jumlah antrean tertunda).
- [x] **Tab Tarikan Cepat Ergonomis:**
  - Filter horizontal kategori blok (`Semua`, `Blok A` s/d `Blok E`).
  - Toggle switch *"Hanya Target Harian"* yang menyaring warga yang sudah lunas iuran bulanan.
  - Tombol aksi *Quick-Tap* $\ge 52\text{px}$ untuk jempol satu tangan dengan tactile micro-animation (`active:scale-95`).
  - Chip tenang semantik untuk `Iuran Bulanan (Lunas)` dan status lunas.
- [x] **Bottom Sheet Input Nominal Kustom & Catatan:** Dapat dibuka dengan mengetuk kartu rumah.
- [x] **Alur "Selesai Ronda & Kunci Setoran":** Modal rekapitulasi serah terima malam ronda (nominal sistem vs uang fisik aktual) untuk diserahkan ke bendahara.
- [x] **Floating Bottom Navigation Bar:** Navigasi 4 tab melayang (Beranda, Tarikan, Riwayat, Warga).

### F. Tahap 3: Transformasi Dashboard Bendahara - Modern Finance (SELESAI)
- [x] **Sidebar & Layout Modern Kas RT (`src/components/layout/AdminSidebar.tsx`):** Identitas kas lingkungan BDA, navigasi profesional dengan counter badge untuk setoran ronda pending, serta pengalihan cepat ke portal petugas.
- [x] **Executive Metric Cards (`src/components/admin/AdminDashboardView.tsx`):** Total Saldo Kas RT, Jimpitan Malam Ini, Pemasukan Kas Bulan Ini, dan Pengeluaran Kas Operasional dengan format mata uang berstandar perbankan modern.
- [x] **Verification Center Module (`src/components/modules/VerificationCenterModule.tsx`):**
  - Modul rekonsiliasi serah terima dari petugas ronda malam.
  - Komparasi uang fisik toples aktual vs catatan digital sistem lengkap dengan penghitungan selisih otomatis.
  - Tombol aksi satu-klik: *"✓ Cocok & Verifikasi"* yang langsung mengubah status menjadi verified dan *secara otomatis membukukan transaksi pemasukan ke Buku Kas RT*.
  - Tombol *"Tandai Selisih"* dengan formulir catatan investigasi.
- [x] **Manajemen Warga & Iuran Bulanan (`src/components/modules/DataWargaModule.tsx`):**
  - Tampilan daftar 170 warga dengan filter kategori tipe iuran (`Semua`, `Iuran Bulanan`, `Jimpitan Harian`).
  - Aksi instan bendahara: Tombol *"Bayar Iuran Bulanan (Rp 20.000)"* yang langsung memperbarui status warga di Supabase dan membukukan pemasukan kas RT.
- [x] **Buku Kas RT & Unduh PDF Resmi (`src/utils/pdfExport.ts` & `src/components/modules/LaporanModule.tsx`):**
  - Tombol *"Unduh File PDF"* resmi berstandar cetak dengan kop surat RT 02 / RW 07 BDA, tabel rekapitulasi mutasi kas, total saldo, dan kolom tanda tangan digital pengurus.

### G. Refaktorisasi & Clean Code Architecture (SELESAI)
- [x] **Pembersihan Dead Code & Folder:** Menghapus 21 file usang (>3.700 baris kode mati) seperti `AdminDashboard.tsx`, `OverviewUnifiedModule.tsx`, `RondaMobileView.tsx`, layout lama, dan icon wrapper ganda.
- [x] **Batas Maksimal 300 Baris Per File:** Seluruh file di `src/` (63 file) kini строго $\le 295$ baris kode tanpa terkecuali.
- [x] **Zero Nested If (`No If in If`):** 100% logika bersarang telah diratakan menggunakan *guard clauses*, *early return*, dan *switch-case* terstruktur (terverifikasi via AST audit = 0 nested if).
- [x] **Modularitas Helper Tingkat Modul (`Tanpa Fungsi di dalam Fungsi`):** Helper logika bisnis, kueri database, dan generator diekstrak ke level modul terpisah agar mudah dibaca oleh developer junior maupun senior.
- [x] **Komentar 100% Bahasa Indonesia:** Seluruh komentar di codebase menggunakan bahasa Indonesia yang ringkas, jelas, dan fokus pada tujuan bisnis (bebas dari komentar redundan AI-slop).
- [x] **Pemisahan Modul Layanan Baru:**
  - `src/services/verificationService.ts`: Khusus rekonsiliasi dan verifikasi uang fisik setoran ronda harian.
  - `src/services/kasService.ts`: Khusus transaksi buku kas umum RT dan iuran bulanan.
  - `src/services/dataService.ts`: Manajemen master data 170 warga dan pencatatan jimpitan harian.
  - `src/services/offlineQueue.ts`: Mesin antrean mutasi offline dan auto-sync.

---

## 2. Rencana Selanjutnya (Next Steps)

```
[Tahap 1: Data Layer & Offline Queue] (SELESAI)
         │
         ▼
[Tahap 2: UI Mobile Petugas (Fintech)] (SELESAI)
         │
         ▼
[Tahap 3: UI Dashboard Bendahara (Modern Finance)] (SELESAI)
         │
         ▼
[Refaktorisasi & Clean Architecture (Max 300 Baris)] (SELESAI)
         │
         ▼
[Tahap 4: Portal Warga QR & Testing Multi-Device] ◄─── BERIKUTNYA
```

### Tahap 4: Portal Warga QR & Testing
1. **Portal Publik Transparansi Warga (`/warga/:id` atau `/cek`):** Halaman read-only ringan untuk warga mengecek status tarikan rumahnya secara transparan cukup dengan scan QR kaleng jimpitan.
2. **Generator Lembar Cetak Stiker QR Code Kaleng Jimpitan:** Format siap cetak A4 untuk ditempelkan di 170 kaleng rumah warga.
3. **Pengujian Multi-Device & Simulasi Lapangan:** Uji alur simultan antara HP petugas ronda dan laptop bendahara RT.
