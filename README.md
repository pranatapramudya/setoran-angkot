# 🚐 Setoran Angkot Offline — Sistem Pembukuan Operasional Juragan

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.0-blue?logo=capacitor)](https://capacitorjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Offline First](https://img.shields.io/badge/Platform-Android%20%7C%20PWA-emerald)]()

Aplikasi mobile pencatatan setoran harian dan pengeluaran armada mobil angkutan kota (**Offline-First**), didesain khusus untuk **kemudahan juragan angkot & ramah lansia** dengan tombol raksasa, umpan balik getar/suara, dan antarmuka **100% Clean Light** (bebas dark mode agar jelas di bawah sinar matahari).

---

## 📸 Fitur Utama

- **☀️ 100% Clean Light UI (Tanpa Dark Mode):**
  Layar putih bersih berstandar kontras tinggi seperti kertas buku kas fisik asli (`#FFFFFF`), teks hitam tebal (`#0F172A`), anti-silau di siang hari dan tidak melelahkan mata bagi pengguna lansia.
- **🔢 Numpad Mesin Kasir & Tombol Raksasa:**
  Keypad angka raksasa dengan tombol shortcut `000`, `+10rb`, `+20rb`, `+50rb`, dan `+100rb`. Pengguna tidak perlu mengetik di keyboard HP yang kecil dan rawan salah pencet.
- **🚐 Tarik Data Armada Otomatis (Nopol + Nama Sopir):**
  Pencatatan pengeluaran (bensin, tambal ban, ganti oli, servis) langsung terhubung dengan armada yang bersangkutan secara visual tanpa perlu mengetik ulang plat nomor atau nama supir.
- **🏢 Dukungan Biaya Operasional Umum:**
  Dapat mencatat biaya non-armada seperti retribusi terminal, pajak STNK, KIR, atau keperluan kantor juragan.
- **📊 Buku Kas Cerdas & Rekapitulasi Per Mobil:**
  - Menghitung **Setoran Bersih Tiap Mobil** (Setor Kotor - Biaya Mobil Tersebut).
  - Menghitung **Total Pengeluaran Gabungan** (Biaya Armada + Biaya Umum).
  - Menghitung **Sisa Uang Kas Akhir di Tangan Juragan** secara otomatis dan presisi.
- **📲 Ekspor Rekap ke WhatsApp 1-Klik:**
  Menghasilkan laporan teks pembukuan siap kirim ke WhatsApp mitra, keluarga, atau arsip pribadi.
- **🔊 Umpan Balik Haptic & Audio:**
  Suara mekanis saat tombol ditekan dan suara lonceng sukses saat transaksi tersimpan.
- **🛡️ 100% Offline & Anti-IDOR:**
  Semua data disimpan di memori lokal HP via `localStorage`. Tidak butuh kuota internet, tidak bergantung pada server luar, dan data terisolasi secara aman.

---

## 📂 Struktur Proyek

```
setoran-angkot/
├── android/                   # Native Android Project (Capacitor 7)
├── app/                       # Next.js 16 App Router
│   ├── globals.css            # Clean Light CSS Tokens (No Dark Mode)
│   ├── layout.tsx             # Root Layout (White Theme Color)
│   └── page.tsx               # Main Dashboard Page
├── components/                # Komponen Antarmuka Ramah Lansia
│   ├── BottomNav.tsx          # Navigasi Tab Bawah Tetap
│   ├── BukuKasView.tsx        # Halaman Buku Kas & Rekap Tiap Mobil
│   ├── CatatPengeluaranModal.tsx # Modal Biaya Terhubung Armada
│   ├── DashboardClient.tsx    # State Container & Header Operasional
│   ├── EditAngkotModal.tsx    # Modal Ubah/Hapus Sopir & Mobil
│   ├── MobilCard.tsx          # Kartu Visual Mobil & Status Setoran
│   ├── NumpadModal.tsx        # Keypad Kasir Setoran & Potongan Biaya
│   ├── PengaturanModal.tsx    # Modal Profil Juragan & No. HP
│   ├── SuccessModal.tsx       # Animasi Sukses Setoran
│   └── TambahAngkotModal.tsx  # Modal Tambah Mobil Baru
├── docs/                      # Dokumentasi & Panduan
│   └── PANDUAN_PENGGUNA_DAN_WORKFLOW.md  # Panduan Alur Kerja Lengkap
├── lib/
│   ├── audio.ts               # Web Audio API Synth & Haptic Feedback
│   └── offlineStorage.ts      # Engine Penyimpanan Offline LocalStorage
├── public/                    # Aset Web, Manifest PWA & Service Worker
├── capacitor.config.ts        # Konfigurasi Capacitor Android
└── Setoran-Angkot-Offline.apk # File APK Android Siap Install (4.8 MB)
```

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat
- Node.js versi 18 atau lebih baru
- Android Studio / Android SDK (jika ingin build native APK)

### 2. Mode Pengembangan (Development)
```bash
# Jalankan web dev server
npm run dev
```
Buka browser di `http://localhost:3000`.

### 3. Build Web & Sinkronisasi ke Android
```bash
# 1. Compile Next.js Static Export
npx next build --webpack

# 2. Sinkronkan asset web ke folder native Android
npx cap sync
```

### 4. Build APK Android
```bash
# Masuk ke folder Android dan kompilasi debug APK
cd android
./gradlew assembleDebug

# Lokasi file APK hasil build:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 Download & Pasang APK di HP Android

File APK siap pakai sudah tersedia di root direktori proyek:
👉 **[Setoran-Angkot-Offline.apk](./Setoran-Angkot-Offline.apk)** *(Ukuran: ~4.8 MB)*

### Cara Install di HP Android:
1. Pindahkan file `Setoran-Angkot-Offline.apk` ke HP Android (lewat kabel data, WhatsApp Web, atau Google Drive).
2. Buka File Manager di HP, sentuh file APK tersebut.
3. Izinkan pemasangan dari sumber tidak dikenal (*Install Unknown Apps*).
4. Tekan **Install** hingga selesai.
5. Aplikasi siap dipakai offline tanpa internet!

---

## 📖 Dokumentasi Lengkap
Untuk panduan detail alur kerja harian juragan, skenario pemakaian, serta rumus pembukuan kas, silakan baca:
👉 **[docs/PANDUAN_PENGGUNA_DAN_WORKFLOW.md](docs/PANDUAN_PENGGUNA_DAN_WORKFLOW.md)**

---

© 2026 Pranata Pramudya. Dibuat untuk digitalisasi operasional transportasi UMKM Indonesia.
