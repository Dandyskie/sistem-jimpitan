# DESIGN.md — Sistem Jimpitan Digital

> Dokumen ini adalah sumber kebenaran tunggal untuk seluruh keputusan desain sistem.
> Setiap komponen, warna, dan tipografi merujuk ke sini, bukan dibuat ad-hoc.

---

## 1. Identitas Produk & Konteks Pengguna

| Aspek | Nilai |
|-------|-------|
| **Portal Petugas (Mobile)** | **Jimpitanku** |
| **Portal Bendahara (Desktop & Tablet)** | **Dashboard Keuangan RT** |
| **Skala Lingkungan** | Komunitas perumahan 170 rumah (Blok A s/d Blok E) |
| **Pengguna Utama** | Petugas ronda pria usia 25–50 tahun, perangkat Android/iOS mid-range |
| **Pengguna Sekunder** | Bendahara RT, perangkat Laptop/Desktop dan HP |
| **Konteks Pemakaian Lapangan** | Berdiri di depan pagar/pintu rumah, malam hari (21:00–24:00), satu tangan, pencahayaan minim |

---

## 2. Arah Visual (Visual Direction)

* **Portal Petugas Ronda:**
  * **Referensi Mood:** Aplikasi Fintech Indonesia (GoPay, DANA, Bank Jago, BRImo).
  * **Karakter:** Ringkas, kontras tinggi, angka nominal tebal dan terbaca sekilas, kartu saldo *digital wallet*, tombol aksi cepat (*quick-tap*) yang responsif tanpa jeda loading.
* **Dashboard Bendahara:**
  * **Referensi Mood:** Modern Finance Management (Mercury, Stripe, Aspire).
  * **Karakter:** Elegan, bersih, sidebar profesional, kartu metrik KPI kas, modul rekonsiliasi serah terima interaktif, tabel data rapi siap cetak.

### Prinsip Visual Kunci:
1. **Nominal & Angka Harus Terbaca Sekilas:** Menggunakan ukuran besar ($\ge 22\text{px}$) dengan fitur font *tabular figures* (`tnum`) agar angka rupiah sejajar rapi.
2. **Status Moneter Langsung Dikenali:** Menggunakan warna semantik yang konsisten (Hijau untuk lunas, Kuning untuk sebagian, Abu-abu netral untuk kosong, dan Teal lembut untuk iuran bulanan).
3. **Ergonomi Satu Jempol:** Seluruh tombol penting pada HP petugas memiliki tinggi minimal 52px dan berada dalam jangkauan jempol bawah.

---

## 3. Sistem Warna (Color System)

### 3.1 Primer (Brand Identity)
```css
--color-primary:        hsl(158, 72%, 32%);   /* Hijau Tua Emerald — referensi Bank Jago / GoPay */
--color-primary-hover:  hsl(158, 65%, 28%);   /* Hover / Active state */
--color-primary-light:  hsl(158, 50%, 93%);   /* Background lembut badge / chip */
--color-primary-dark:   hsl(158, 78%, 20%);   /* Header wallet card mobile */
```

### 3.2 Status Finansial (Semantic Colors)
```css
/* Lunas Harian */
--color-success:        hsl(142, 69%, 36%);
--color-success-bg:     hsl(142, 50%, 94%);

/* Iuran Bulanan (Khusus Warga Bayar ke Bendahara) */
--color-monthly:        hsl(187, 85%, 33%);
--color-monthly-bg:     hsl(187, 75%, 94%);

/* Sebagian / Pending */
--color-warning:        hsl(38, 92%, 45%);
--color-warning-bg:     hsl(38, 80%, 94%);

/* Belum Bayar / Selisih Kas / Flag */
--color-danger:         hsl(0, 72%, 48%);
--color-danger-bg:      hsl(0, 65%, 95%);

/* Kosong / Tidak Ada Orang */
--color-neutral-muted:  hsl(220, 10%, 55%);
--color-neutral-bg:     hsl(220, 14%, 94%);
```

### 3.3 Netral (Surface, Border, & Text)
```css
--color-surface:        hsl(0, 0%, 100%);     /* Background card */
--color-surface-subtle: hsl(220, 16%, 98%);   /* Background app canvas */
--color-border:         hsl(220, 13%, 90%);   /* Garis pemisah halus */
--color-text-primary:   hsl(220, 24%, 12%);   /* Teks utama berkontras tinggi */
--color-text-secondary: hsl(220, 10%, 46%);   /* Label sekunder & caption */
--color-text-disabled:  hsl(220, 10%, 72%);
```

---

## 4. Tipografi (Typography)

* **Font Utama:** `Plus Jakarta Sans` (Google Fonts)
  * Font bernuansa modern, ramah, dan sangat terbaca pada layar HP mid-range di luar ruangan.
* **Font Angka Rupiah:** `Plus Jakarta Sans` dengan `font-feature-settings: 'tnum' 1;`
  * Angka menggunakan lebar tetap (*tabular*) agar digit-digit rupiah sejajar saat ditampilkan dalam tabel atau daftar transaksi.

### Skala Ukuran Teks
| Token | Ukuran | Tebal (Weight) | Penggunaan |
|-------|--------|----------------|------------|
| `--text-xs`   | 12px | 500 (Medium) | Timestamp, caption kecil, status sync |
| `--text-sm`   | 14px | 400 (Regular) / 600 (Semibold) | Teks pendukung, alamat blok |
| `--text-base` | 16px | 400 (Regular) / 600 (Semibold) | Body teks, nama warga, tombol |
| `--text-lg`   | 18px | 600 (Semibold) | Header kartu, nama warga utama |
| `--text-xl`   | 22px | 700 (Bold) | Nominal tarikan per rumah |
| `--text-2xl`  | 28px | 700 (Bold) | Total saldo kas & total malam ronda |

> **Aturan Wajib:** Tidak menggunakan teks lebih kecil dari 14px untuk elemen interaktif di antarmuka petugas ronda.

---

## 5. Spasi & Radius Sudut (Spacing & Radius)

```css
/* Spacing Scale */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;

/* Border Radius System */
--radius-sm: 8px;    /* Input field, badge kecil */
--radius-md: 12px;   /* Kartu warga, kartu transaksi */
--radius-lg: 16px;   /* Bottom sheet mobile, modal bendahara */
--radius-xl: 20px;   /* Tombol primer aksi besar */
--radius-full: 9999px; /* Filter pill, status chip */
```

---

## 6. Pola Komponen Spesifik (Component Patterns)

### 6.1 Digital Wallet Card (Mobile Petugas)
- Menggunakan latar belakang *deep emerald* dengan gradien lembut yang elegan.
- Menampilkan nominal tarikan malam ini secara mencolok (28px bold, warna putih).
- Memuat bar progres target harian (misal: *45 / 98 Rumah Terkumpul*).
- Indikator koneksi (*Online* vs *Offline Queue*) di sudut kanan atas kartu.

### 6.2 Filter Kategori Blok (Horizontal Scroll Pills)
- Filter kategori horizontal sticky di bawah header: `Semua`, `Blok A`, `Blok B`, `Blok C`, dll.
- Sakelar toggle cepat: `[Hanya Target Harian]` (menyembunyikan warga yang sudah beres iuran bulanan).

### 6.3 Kartu Rumah & Tombol Quick-Tap
- Tinggi tap target $\ge 52\text{px}$ untuk kenyamanan jari.
- Tombol **✓ Hijau (Lunas Rp 2.000)** di kanan: 1 kali sentuhan langsung mengubah status menjadi lunas seketika (*optimistic 0ms*).
- Tombol **✗ Abu-abu (Kosong)**: Menandai rumah tanpa tarikan jimpitan.
- Ketukan pada nama warga membuka *Bottom Sheet* untuk input kustom (Rp 1.000, Rp 5.000, atau catatan).

### 6.4 Status Chip
- 4 varian semantik:
  - `Lunas` (Hijau)
  - `Iuran Bulanan` (Teal lembut)
  - `Sebagian` (Kuning)
  - `Kosong` (Abu-abu)
- Bentuk pill (*radius-full*) khusus untuk indikator status agar langsung terbaca tanpa membaca teks secara saksama.

### 6.5 Floating Bottom Navigation Bar (Portal Petugas)
- Bar melayang di bagian bawah layar dengan 4 tab utama:
  1. **Beranda** (Home)
  2. **Tarikan** (PlusCircle / Banknote)
  3. **Riwayat** (Clock)
  4. **Warga** (Users)

### 6.6 Verification Center & Metric Cards (Dashboard Bendahara)
- **Top Metric Cards:** 4 kartu metrik dengan visual minimalis dan indikator tren.
- **Verification Module:** Komparasi digital vs uang fisik dengan tombol satu-klik *"Cocok & Verifikasi"* dan *"Flag Selisih"*.

---

## 7. Motion & Interaksi (Motion Dial: 2)

* **Karakter:** Ringan, fungsional, taktil (*tactile*), bukan animasi dekoratif.
* **Tap Feedback:** Efek `transform: scale(0.98)` selama 100ms saat tombol quick-tap ditekan memberi sensasi sentuhan yang mantap bagi petugas di lapangan.
* **Bottom Sheet Transition:** Slide-up 200ms ease-out.
* **Feedback Sinkronisasi:** Toast hijau halus di bagian atas saat antrean offline berhasil terkirim ke server.
* **Loading State:** Menggunakan *skeleton placeholder* yang sesuai dengan bentuk kartu, menghindari spinner yang memusingkan.

---

## 8. Dials (antislop)

| Dial | Level | Penjelasan |
|------|-------|------------|
| **ENERGY** | 2 | Palet hijau tua fintech berkarakter kuat, latar belakang netral nyaman di mata malam hari. |
| **RHYTHM** | 2 | Antarmuka mobile terfokus pada aksi cepat satu layar; antarmuka desktop bendahara tersusun modular dan berjarak lega. |
| **MOTION** | 2 | Animasi murni memandu fokus dan memberi umpan balik ketukan, tidak ada elemen melayang (*floating*) tanpa fungsi. |

---

## 9. Larangan Desain (Design Locks)

- Jangan menggunakan gradien generik ungu-biru (*AI default gradient*).
- Jangan menggunakan teks lebih kecil dari 14px pada elemen aksi petugas ronda.
- Jangan menggunakan label tombol yang ambigu (gunakan "Catat Jimpitan", "Cocok & Verifikasi", bukan sekadar "Submit" atau "OK").
- Jangan menampilkan angka atau statistik tanpa data riil.
- Jangan menambahkan tautan navigasi ke halaman atau fitur yang belum dibangun.
