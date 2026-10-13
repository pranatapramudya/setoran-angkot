# 🚐 Panduan Pengguna & Alur Kerja (Workflow) - Setoran Angkot Offline

Selamat datang di dokumentasi resmi **Setoran Angkot Offline** — aplikasi pembukuan operasional harian armada angkutan kota berbasis Android & PWA yang dirancang khusus untuk kenyamanan juragan angkot, ramah lansia, dan siap digunakan tanpa koneksi internet (100% Offline-First).

---

## 📑 Daftar Isi
1. [Filosofi Desain (Clean Light UI & Ramah Lansia)](#1-filosofi-desain-clean-light-ui--ramah-lansia)
2. [Fitur-Fitur Utama](#2-fitur-fitur-utama)
3. [Alur Kerja Harian (Workflow)](#3-alur-kerja-harian-workflow)
   - [A. Mencatat Setoran Mobil](#a-mencatat-setoran-mobil)
   - [B. Mencatat Pengeluaran Armada & Umum](#b-mencatat-pengeluaran-armada--umum)
   - [C. Tutup Buku & Rekapitulasi WhatsApp](#c-tutup-buku--rekapitulasi-whatsapp)
4. [Kalkulasi Keuangan & Buku Kas](#4-kalkulasi-keuangan--buku-kas)
5. [Manajemen Armada & Profil Juragan](#5-manajemen-armada--profil-juragan)
6. [Arsitektur Teknis & Penyimpanan Offline](#6-arsitektur-teknis--penyimpanan-offline)
7. [Panduan Instalasi APK Android](#7-panduan-instalasi-apk-android)

---

## 1. Filosofi Desain (Clean Light UI & Ramah Lansia)

Aplikasi ini dibangun dengan prinsip **"Zero Confusion & High Legibility"**:

- **☀️ 100% Clean Light (Bebas Dark Mode):**
  Layar dibuat putih bersih menyerupai kertas buku kas fisik asli (`#FFFFFF` & `#F8FAFC`). Tulisan dan angka menggunakan warna hitam pekat (`#0F172A`) dengan kontras sangat tinggi, sehingga tetap terbaca sangat jelas di bawah terik matahari pangkalan/terminal tanpa menyilaukan mata.
- **📱 Tombol Raksasa & Numpad Mesin Kasir:**
  Pengguna tidak perlu mengetik huruf di keyboard HP yang kecil dan rawan salah pencet (*typo*). Tombol angka dan tombol aksi dibuat besar (tinggi minimal 56px–72px).
- **🔊 Umpan Balik Suara & Getar (Audio & Haptic):**
  Setiap sentuhan tombol menghasilkan bunyi klik mekanis lembut, dan tombol simpan menghasilkan suara sukses ("tring") beserta getaran halus pada HP untuk memastikan juragan yakin uang sudah tercatat.

---

## 2. Fitur-Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **Daftar Mobil Harian** | Kartu visual per mobil lengkap dengan Plat Nomor, Nama Sopir, dan Status Setor (Hijau: Sudah Setor, Merah: Belum Setor). |
| **Numpad Setoran Cepat** | Keypad numerik raksasa dengan tombol `000`, shortcut tambah nominal (`+10rb`, `+20rb`, `+50rb`, `+100rb`), dan tombol potong biaya di jalan. |
| **Catat Pengeluaran Terhubung Armada** | Pilihan otomatis armada dari data ketersediaan (Nopol + Sopir) atau Operasional Umum (Kantor/Pajak), lengkap dengan chip keterangan cepat (*Bensin*, *Tambal Ban*, *Ganti Oli*, dll.). |
| **Buku Kas & Rekap Per Mobil** | Rekapitulasi keuangan transparan tiap mobil: Setoran Masuk, Pengeluaran Mobil, dan Sisa Bersih per unit mobil. |
| **Total Pengeluaran Gabungan** | Menggabungkan seluruh biaya armada + biaya operasional umum secara otomatis. |
| **Ringkasan Kas Akhir** | Menghitung Pendapatan Kotor, Total Pengeluaran Gabungan, dan **Sisa Uang Kas Bersih di Tangan Juragan**. |
| **Kirim Rekap ke WhatsApp 1-Klik** | Format laporan teks rapi yang langsung membuka WhatsApp untuk dikirimkan ke mitra, keluarga, atau arsip pribadi. |
| **100% Offline-First** | Data tersimpan aman di memori lokal HP Android tanpa butuh kuota internet atau sinyal seluler. |

---

## 3. Alur Kerja Harian (Workflow)

### A. Mencatat Setoran Mobil
Digunakan saat sopir angkot datang menyetorkan uang hasil tarikan hari itu.

```
[Buka Aplikasi] ➔ [Pilih Mobil] ➔ [Klik Tombol Hijau 'MASUKKAN SETORAN'] ➔ [Ketik Uang di Numpad] ➔ [Klik 'SIMPAN SETORAN']
```

1. Buka aplikasi di HP, juragan langsung melihat daftar mobil pada tab **1. SETOR MOBIL**.
2. Mobil yang belum setor memiliki tanda merah **BELUM SETOR**. Klik tombol besar hijau **[MASUKKAN SETORAN]**.
3. Layar Numpad akan terbuka:
   - Ketik nominal setoran kotor (misal ketik `150` lalu tekan `000` untuk Rp 150.000).
   - **Jika sopir ada potongan biaya di jalan**:
     - Sentuh tab **2. Potong Biaya**.
     - Ketik nominal potongan atau pilih chip instan (misal `⛽ Beli Bensin Rp 20.000`).
     - Sistem otomatis menampilkan **Setoran Bersih** yang harus diserahkan sopir.
4. Klik tombol hijau **[SIMPAN SETORAN]**.
5. Suara sukses berbunyi, status kartu mobil langsung berubah menjadi hijau **SUDAH SETOR**, dan counter "Belum Setor" di header berkurang.

---

### B. Mencatat Pengeluaran Armada & Umum
Digunakan saat ada pengeluaran uang bensin, tambal ban, servis bengkel, uang makan sopir, atau biaya kantor/pajak.

```
[Klik Tombol Merah '- BIAYA' di Header] ➔ [Pilih Armada / Umum] ➔ [Masukkan Nominal & Keterangan] ➔ [Klik 'SIMPAN PENGELUARAN']
```

1. Klik tombol shortcut merah **[- BIAYA]** di kanan atas header (atau di dalam Buku Kas).
2. Di jendela **CATAT PENGELUARAN**, juragan tinggal memilih tujuan biaya:
   - **Biaya Mobil Spesifik:** Sentuh kartu armada yang bersangkutan (misal `🚐 D 1902 AB - Sopir: Mang Ujang`).
   - **Biaya Operasional Umum:** Sentuh `🏢 Operasional Umum Juragan` (untuk biaya pajak STNK, retribusi pangkalan, operasional kantor).
3. Masukkan nominal uang biaya (bisa gunakan tombol cepat `+10rb`, `+20rb`, `+50rb`, `+100rb`, dst.).
4. Pilih keterangan pengeluaran dengan menekan chip cepat:
   - `⛽ Beli Bensin`
   - `🛞 Tambal / Ganti Ban`
   - `🛢️ Ganti Oli`
   - `🔧 Servis Bengkel`
   - `🚿 Cuci Mobil`
   - `🎫 Retribusi / Parkir`
   - `🍲 Uang Makan Sopir`
   - `📋 KIR / STNK`
5. Klik **[SIMPAN PENGELUARAN]**. Pengeluaran langsung terhubung ke mobil tersebut dan tercatat di buku kas.

---

### C. Tutup Buku & Rekapitulasi WhatsApp
Dilakukan di sore/malam hari saat semua mobil selesai beroperasi.

```
[Sentuh Tab Bawah '2. BUKU KAS'] ➔ [Tinjau Sisa Uang Kas Bersih] ➔ [Klik 'KIRIM REKAP KE WA']
```

1. Sentuh menu bawah **[2. BUKU KAS]**.
2. Juragan dapat memilih periode:
   - **1. REKAP HARIAN:** Pembukuan hari ini.
   - **2. LAPORAN BULANAN:** Akumulasi pendapatan dan pengeluaran bulan berjalan.
3. Di bagian paling atas terlihat angka besar:
   - 💰 **PENDAPATAN BERSIH (SISA UANG KAS): Rp XXX.XXX**
4. Di bagian bawah terdapat **REKAP KEUANGAN TIAP MOBIL** untuk melihat performa bersih masing-masing angkot.
5. Klik tombol hijau **[KIRIM REKAP KE WA]**:
   - Teks laporan otomatis disalin ke clipboard dan WhatsApp terbuka.
   - Juragan tinggal pilih kontak (misal istri atau partner) dan tekan tombol kirim di WA.

---

## 4. Kalkulasi Keuangan & Buku Kas

Sistem menggunakan rumus keuangan otomatis yang transparan:

$$\text{Setoran Bersih Mobil} = \text{Setoran Masuk Mobil} - \text{Total Biaya Mobil Tersebut}$$

$$\text{Total Pengeluaran Keseluruhan} = \text{Total Biaya Seluruh Armada} + \text{Total Biaya Operasional Umum}$$

$$\mathbf{Sisa\ Uang\ Kas\ Juragan} = \mathbf{Total\ Setoran\ Kotor} - \mathbf{Total\ Pengeluaran\ Keseluruhan}$$

Dengan sistem ini, juragan mengetahui:
1. Berapa uang murni yang dihasilkan oleh masing-masing mobil.
2. Mobil mana yang paling banyak membutuhkan biaya perawatan / perbaikan.
3. Berapa sisa uang tunai yang seharusnya ada di dompet/kantong juragan hari ini.

---

## 5. Manajemen Armada & Profil Juragan

- **Tambah Mobil Baru:**
  Sentuh tombol biru **[+ Tambah Mobil]** di kanan atas daftar mobil. Masukkan Plat Nomor (misal `D 1234 AB`) dan Nama Sopir Tetap.
- **Ubah Sopir / Hapus Mobil:**
  Pada kartu mobil yang bersangkutan, klik tombol **[Ubah Sopir/Mobil]**. Juragan dapat mengganti nama supir cadangan atau menghapus mobil jika sudah dijual/tidak beroperasi.
- **Ganti Nama Juragan / Usaha:**
  Klik ikon roda gigi **Pengaturan** di kanan atas header untuk mengganti nama akun juragan (misal: "JURAGAN ANGKOT H. SUBANDI").

---

## 6. Arsitektur Teknis & Penyimpanan Offline

- **Framework:** Next.js 16 (React 19, TypeScript, TailwindCSS 4) dengan mode *Static Export* (`output: 'export'`).
- **Engine Mobile:** Capacitor 7 (`@capacitor/android`, `@capacitor/core`, `@capacitor/haptics`).
- **Penyimpanan:** Browser / WebView `localStorage` dengan skema JSON terisolasi (`setoran_angkot_offline_v1`).
- **Data Persistence:** Data tetap aman tersimpan meskipun aplikasi ditutup, HP direstart, atau dalam mode pesawat (Airplane mode).

---

## 7. Panduan Instalasi APK Android

File aplikasi siap pakai berekstensi `.apk` tersedia di:
```
D:\Coding\setoran-angkot\Setoran-Angkot-Offline.apk
```

### Cara Memasang di HP Android:
1. Hubungkan HP Android ke komputer via kabel data USB (atau kirim file APK melalui WhatsApp Web / Google Drive).
2. Salin file `Setoran-Angkot-Offline.apk` ke folder **Download** di HP.
3. Buka file manager di HP, cari file `Setoran-Angkot-Offline.apk` lalu sentuh file tersebut.
4. Jika muncul peringatan *"Install from unknown sources"*, pilih **Izinkan (Allow)**.
5. Tekan **Install** hingga selesai.
6. Aplikasi **Setor Angkot** siap digunakan setiap hari!
