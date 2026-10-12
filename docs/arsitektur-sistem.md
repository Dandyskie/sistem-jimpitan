# Panduan Arsitektur & Standar Koding: Sistem Jimpitan Digital

Dokumen ini menjadi acuan teknis bagi developer (junior maupun senior) dalam memahami struktur folder, prinsip clean code, dan konvensi penulisan pada proyek **Sistem Jimpitan Digital**.

---

## 1. Prinsip Utama Clean Code

1. **Maksimal 300 Baris Per File ($\le 300$ baris):**
   - Setiap file di codebase tidak boleh melebihi 300 baris.
   - Jika sebuah komponen atau modul mulai mendekati 250–300 baris, lakukan pemecahan (*extract component* atau *extract service/helper*).

2. **Dilarang Fungsi di dalam Fungsi (*No Functions Inside Functions*):**
   - Hindari mendeklarasikan fungsi pembantu (*helper logic* atau *data fetcher*) di dalam blok komponen atau di dalam fungsi lain.
   - Pindahkan helper tersebut ke tingkat atas modul (*top-level module function*) atau ke berkas utilitas terpisah.

3. **Tanpa Percabangan Bersarang (*Zero Nested If / No If in If*):**
   - Gunakan *Guard Clauses* dan *Early Return* di awal fungsi.
   - Gunakan `switch-case` untuk logika percabangan berbasis status/tipe.
   - Gabungkan kondisi linier dengan operator logika (`&&`, `||`) alih-alih membuat blok `if` baru di dalam `if`.

4. **Komentar Eksklusif Bahasa Indonesia (Anti AI-Slop):**
   - Semua komentar teknis ditulis dalam bahasa Indonesia yang ringkas dan padat.
   - Jangan menulis komentar yang hanya mengulangi apa yang dilakukan kode (contoh yang dilarang: `// mengembalikan nilai x`, `// impor react`).
   - Tulis komentar yang menjelaskan **mengapa** (*intent/domain reason*) kode tersebut dibuat.

5. **Kode Bersih & Mudah Dibaca (Junior – Senior Friendly):**
   - Penamaan variabel dan fungsi deskriptif dan mencerminkan domain siskamling/keuangan RT.
   - Tipe data TypeScript didefinisikan secara eksplisit dan konsisten.

---

## 2. Struktur Direktori Proyek

```text
src/
├── components/
│   ├── admin/               # Komponen khusus antarmuka Dashboard Bendahara RT
│   │   ├── AdminDashboardView.tsx   # Tampilan orkestrasi utama bendahara
│   │   ├── AdminSettingsTab.tsx     # Tab pengaturan peran jabatan & akun
│   │   ├── MetricCards.tsx          # 4 kartu ringkasan eksekutif (Saldo, Jimpitan, Kas Masuk/Keluar)
│   │   ├── QRStickerGrid.tsx        # Grid pratinjau stiker QR kaleng warga
│   │   ├── RecentLedgerCard.tsx     # Kartu 5 transaksi buku kas terakhir
│   │   ├── RondaProgressCard.tsx    # Progres tarikan ronda malam hari ini
│   │   └── SettlementAlert.tsx      # Peringatan setoran ronda yang belum diverifikasi
│   │
│   ├── auth/                # Komponen otentikasi
│   │   └── LoginView.tsx            # Form login dengan tombol cepat (Demo & Supabase Auth)
│   │
│   ├── common/              # Komponen UI atomik dasar
│   │   ├── Button.tsx               # Tombol dengan varian warna dan ukuran sentuh mobile
│   │   ├── ConfirmModal.tsx         # Dialog konfirmasi aksi (hapus, simpan, dll.)
│   │   ├── Modal.tsx                # Pembungkus modal responsif
│   │   └── Toast.tsx                # Notifikasi melayang (success, error, info)
│   │
│   ├── layout/              # Navigasi dan pembungkus antarmuka
│   │   └── AdminSidebar.tsx         # Sidebar navigasi bendahara desktop
│   │
│   ├── modules/             # Modul fungsional spesifik aplikasi
│   │   ├── jimpitan/
│   │   │   └── RiwayatEditModal.tsx # Modal koreksi tarikan jimpitan
│   │   ├── keuangan/
│   │   │   └── TransaksiFormModal.tsx # Modal tambah transaksi kas masuk/keluar
│   │   ├── verifikasi/
│   │   │   └── VerificationReconciliationCard.tsx # Kartu komparasi uang fisik vs sistem
│   │   ├── warga/
│   │   │   ├── WargaDetailModal.tsx # Modal detail riwayat rumah warga
│   │   │   ├── WargaFilterToolbar.tsx # Toolbar filter blok dan pencarian
│   │   │   ├── WargaFormModal.tsx   # Modal tambah & ubah data warga
│   │   │   └── WargaTable.tsx       # Tabel master 170 warga
│   │   ├── DataWargaModule.tsx      # Modul orkestrasi manajemen warga & iuran bulanan
│   │   ├── LaporanModule.tsx        # Modul laporan keuangan & cetak dokumen
│   │   ├── RingkasanKeuanganModule.tsx # Ringkasan statistik arus kas RT
│   │   ├── RiwayatJimpitanModule.tsx # Modul riwayat tarikan siskamling
│   │   ├── TransaksiKeuanganModule.tsx # Modul buku kas RT (pemasukan/pengeluaran)
│   │   └── VerificationCenterModule.tsx # Pusat serah terima setoran siskamling malam
│   │
│   ├── qr/                  # Alur pemindaian QR code kaleng jimpitan
│   │   ├── QRFormStepView.tsx       # Formulir input nominal & catatan hasil scan
│   │   ├── QRScanFlowModal.tsx      # Modal alur scan kamera
│   │   ├── QRSuccessStepView.tsx    # Tampilan sukses tarikan via QR
│   │   └── QRViewfinderView.tsx     # Bidikan kamera dan input nomor rumah manual
│   │
│   ├── ronda/               # Komponen khusus antarmuka Mobile Petugas Siskamling
│   │   ├── FloatingBottomNav.tsx    # Navigasi tab bawah melayang (Beranda, Tarik, Riwayat, Warga)
│   │   ├── PetugasDashboard.tsx     # Tampilan orkestrasi utama petugas ronda
│   │   ├── PetugasRiwayatTab.tsx    # Tab rekap tarikan malam ini
│   │   ├── PetugasWargaTab.tsx      # Tab daftar seluruh rumah warga
│   │   ├── QuickTapHouseList.tsx    # Daftar rumah rute ronda dengan tombol Quick-Tap $\ge 52px$
│   │   ├── RondaBottomSheet.tsx     # Bottom sheet sentuh untuk nominal kustom & catatan
│   │   ├── SelesaiRondaModal.tsx    # Modal rekap serah terima setoran malam ke bendahara
│   │   └── WalletHeader.tsx         # Header dompet digital (saldo tarikan & status online/offline)
│   │
│   └── ui/                  # Komponen utilitas antarmuka
│       ├── badge.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── tabs.tsx
│
├── context/                 # State management berbasis React Context
│   ├── AuthContext.tsx      # Sesi login akun, profil peran, dan persistence
│   └── SyncContext.tsx      # Aliran status online/offline dan sinkronisasi realtime
│
├── data/                    # Data generator & fallback offline
│   ├── residents.ts         # Generator master data 170 rumah (Blok A s/d E)
│   └── transactions.ts      # Data transaksi kas awal & catatan siskamling demo
│
├── hooks/                   # Custom React Hooks
│   └── useAppData.ts        # Hook repositori sinkronisasi data master warga, jimpitan, dan kas
│
├── lib/                     # Inisialisasi library eksternal
│   └── supabase.ts          # Client Supabase PostgreSQL & realtime subscription
│
├── services/                # Business logic & layer komunikasi data
│   ├── dataService.ts       # Service master warga & pencatatan jimpitan harian
│   ├── kasService.ts        # Service transaksi kas RT & pembukuan iuran bulanan
│   ├── offlineQueue.ts      # Mesin antrean offline mutation & auto-flush
│   ├── realtimeSync.ts      # Listener realtime broadcast Supabase
│   └── verificationService.ts # Service verifikasi setoran fisik siskamling
│
├── types/                   # Definisi tipe & model TypeScript
│   └── index.ts             # Interface domain Warga, Jimpitan, Kas, Verifikasi, dll.
│
├── utils/                   # Fungsi utilitas murni
│   ├── formatters.ts        # Pemformat mata uang Rupiah dan tanggal Indonesia
│   └── pdfExport.ts         # Generator berkas PDF laporan kas RT resmi
│
├── App.tsx                  # Root router & switch tampilan (Petugas vs Admin)
└── main.tsx                 # Entry point React Vite
```

---

## 3. Aliran Data & Arsitektur Sinkronisasi

1. **Online State (Terhubung ke Supabase):**
   - Permintaan baca/tulis diarahkan langsung ke Supabase PostgreSQL.
   - Hasil disimpan ke `localStorage` sebagai *local cache* cadangan.
   - Channel Realtime Supabase memancarkan event ke perangkat lain secara instan.

2. **Offline State (Sinyal Hilang di Lapangan Ronda):**
   - Aplikasi mendeteksi `navigator.onLine === false` atau kegagalan koneksi API.
   - Mutasi (seperti tarikan jimpitan atau setoran) langsung disimpan di antrean `STORAGE_KEYS.OFFLINE_QUEUE`.
   - Data lokal langsung ter-update di layar agar petugas tidak terhambat bekerja.
   - Status antrean ditampilkan pada *pill badge* di pojok kanan atas aplikasi.

3. **Re-connection & Auto-Flush:**
   - Saat perangkat kembali menangkap sinyal internet, `offlineQueue.ts` otomatis melakukan pengurasan (*flush queue*) secara berurutan (*FIFO*) ke Supabase.
