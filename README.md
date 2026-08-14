# 📚 Sistem Manajemen Perpustakaan - Frontend

> **Platform modern untuk mengelola koleksi buku, peminjaman, dan anggota perpustakaan**  
> Dibangun dengan React 19, TypeScript, dan Vite

---

## 📋 Daftar Isi

- [Pengenalan Singkat](#-pengenalan-singkat)
- [Fitur Utama](#-fitur-utama)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Cara Install & Jalankan](#-cara-install--jalankan)
- [Panduan Penggunaan Cepat](#-panduan-penggunaan-cepat)
- [Struktur Folder Project](#-struktur-folder-project)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Pengenalan Singkat

**Library Management System** adalah aplikasi web yang dirancang untuk memudahkan pengelolaan perpustakaan modern. Dengan antarmuka yang intuitif dan responsif, aplikasi ini mendukung tiga peran pengguna:

- **👤 Admin**: Kelola semua fitur sistem termasuk data member dan laporan
- **👥 Staff**: Kelola sirkulasi peminjaman dan pengembalian buku
- **📖 Member**: Lihat katalog buku, cek profil, dan riwayat peminjaman

---

## ✨ Fitur Utama

### 1. 🔐 Sistem Login & Keamanan
- Login dengan email dan password
- Daftar akun member baru
- Proteksi halaman berdasarkan role pengguna
- Logout otomatis

### 2. 📚 Katalog Buku
- Cari dan filter buku berdasarkan judul, pengarang, atau kategori
- Lihat detail lengkap setiap buku
- Tambah, edit, dan hapus buku (hanya Admin/Staff)
- Tampilan responsif di desktop dan mobile

### 3. 📤📥 Sirkulasi (Peminjaman & Pengembalian)
- Proses peminjaman buku dengan scan barcode
- Proses pengembalian dan perhitungan denda otomatis
- Lihat riwayat transaksi hari ini
- Modal konfirmasi denda untuk pengembalian terlambat

### 4. 👥 Manajemen Member
- Daftar semua member perpustakaan
- Monitor status member (Aktif/Suspend)
- Lihat profil pribadi dan riwayat pinjaman
- Ubah data profil member

### 5. 📊 Laporan Overdue
- Pantau buku yang belum dikembalikan tepat waktu
- Filter dan cari laporan dengan mudah
- Export data untuk keperluan administrasi

---

## 💻 Persyaratan Sistem

Sebelum mulai, pastikan device Anda memiliki:

- **Node.js** versi 18.x atau lebih baru  
  [Download di sini](https://nodejs.org/)
  
- **npm** versi 9.x atau lebih baru  
  (Biasanya sudah terinstal bersama Node.js)

- **Web Browser modern** (Chrome, Firefox, Safari, atau Edge)

### Cara Cek Versi

Buka terminal/command prompt dan jalankan:

```bash
node --version
npm --version
```

---

## 🚀 Cara Install & Jalankan

### Langkah 1: Clone Repository

```bash
git clone https://github.com/BagasRPLx-b/Libary-Management.git
cd Libary-Management
```

### Langkah 2: Install Dependencies

```bash
npm install
```

Tunggu proses instalasi selesai (biasanya 2-5 menit tergantung kecepatan internet).

### Langkah 3: Konfigurasi Environment (Opsional)

Buat file `.env` di folder root project:

Buka `.env` dengan text editor dan pastikan berisi:

```env
VITE_API_URL=https://barrier-generation-queensland-session.trycloudflare.com/api/v1
```

> **Catatan:** Jika API URL berbeda, sesuaikan dengan URL backend Anda.

### Langkah 4: Jalankan Aplikasi

```bash
npm run dev
```

Tunggu hingga muncul pesan seperti:

```
  Local:        http://localhost:5173/
  press h to show help
```

### Langkah 5: Buka di Browser

Buka browser Anda dan ketik:

```
http://localhost:5173
```

**Selamat! Aplikasi sudah berjalan.** 🎉

---

## 📖 Panduan Penggunaan Cepat

### 🔑 Login Pertama Kali

1. Buka halaman login
2. Pilih antara **Login** atau **Daftar** (untuk member baru)
3. Masukkan email dan password Anda
4. Klik tombol **Login**
5. Anda akan dialihkan ke dashboard sesuai role Anda

### 📚 Melihat Katalog Buku

1. Klik menu **Katalog** di sidebar
2. Gunakan kolom pencarian untuk cari buku
3. Filter berdasarkan kategori atau pengarang
4. Klik judul buku untuk melihat detail lengkap

### 📥 Meminjam Buku (untuk Admin/Staff)

1. Buka menu **Sirkulasi**
2. Pilih mode **Peminjaman**
3. Masukkan data member (email atau ID)
4. Scan barcode buku atau masukkan ISBN
5. Klik **Konfirmasi Peminjaman**

### 📤 Mengembalikan Buku (untuk Admin/Staff)

1. Buka menu **Sirkulasi**
2. Pilih mode **Pengembalian**
3. Scan barcode buku yang dikembalikan
4. Sistem otomatis menghitung denda (jika ada)
5. Klik **Konfirmasi Pengembalian**

### 👤 Lihat Profil & Riwayat Pinjaman

1. Klik foto profil di sudut kanan atas
2. Pilih **Profil**
3. Lihat data pribadi, total pinjaman, dan riwayat pinjaman

---

## 📁 Struktur Folder Project

Untuk referensi, berikut struktur project:

```
Libary-Management/
├── src/
│   ├── features/              # Modul fitur utama
│   │   ├── auth/             # Login & Register
│   │   ├── books/            # Katalog Buku
│   │   ├── loans/            # Sirkulasi Peminjaman
│   │   ├── members/          # Data Member
│   │   └── reports/          # Laporan Overdue
│   │
│   ├── components/            # Komponen UI yang dapat digunakan kembali
│   │   ├── layout/           # Layout halaman
│   │   └── ui/               # Komponen UI dasar
│   │
│   ├── lib/                   # Fungsi & utilitas
│   │   ├── api/              # Integrasi API backend
│   │   └── formatters.ts     # Format tanggal & mata uang
│   │
│   ├── App.tsx               # Aplikasi utama
│   └── main.tsx              # Entry point
│
├── .env.example              # Template konfigurasi
├── package.json              # Daftar dependencies
├── vite.config.ts            # Konfigurasi Vite
└── README.md                 # File ini
```

---

## ⚙️ Perintah Useful

Saat mengembangkan project, berikut perintah yang sering digunakan:

```bash
# Jalankan dalam mode development (dengan hot reload)
npm run dev

# Buat build production (hasil file static)
npm run build

# Preview build production di local
npm run preview

# Jalankan linter untuk cek kualitas kode
npm run lint
```

---

## 🔧 Teknologi yang Digunakan

| Nama | Versi | Kegunaan |
|------|-------|---------|
| React | 19.x | Framework UI |
| TypeScript | 6.x | Type safety & kualitas kode |
| Vite | 8.x | Build tool & dev server cepat |
| Tailwind CSS | 4.x | Styling & desain responsif |
| TanStack Query | 5.x | Manajemen data server |
| React Router | 7.x | Navigasi antar halaman |
| Axios | 1.x | HTTP client untuk API |
| date-fns | 4.x | Format tanggal & waktu |

---

## ❓ Troubleshooting

### Masalah: Port 5173 sudah digunakan

**Solusi:**  
Jalankan dengan port berbeda:
```bash
npm run dev -- --port 3000
```

### Masalah: Halaman kosong atau error saat load

**Solusi:**
1. Bersihkan cache browser (Ctrl+Shift+Delete)
2. Refresh halaman (Ctrl+F5)
3. Pastikan API URL di `.env` benar

### Masalah: Tidak bisa login atau error API

**Solusi:**
1. Pastikan backend API sedang berjalan
2. Periksa URL API di `.env` benar sesuai dengan yang ditentukan
3. Buka DevTools (F12) → Console untuk melihat error detail
4. Hubungi admin jika masalah terus berlanjut

### Masalah: npm install gagal atau lambat

**Solusi:**
```bash
# Bersihkan cache npm
npm cache clean --force

# Install ulang
npm install
```

### Masalah: TypeScript error saat build

**Solusi:**
```bash
# Jalankan type check
npm run build

# Jika ada error, baca pesan error dan perbaiki
```

---

## 📞 Butuh Bantuan?

Jika mengalami masalah atau punya pertanyaan:

1. **Lihat error di Console**  
   Buka DevTools (tekan F12), tab **Console** untuk melihat pesan error detail

2. **Cek dokumentasi project**  
   Lihat file dokumentasi di folder `docs/` (jika ada)

3. **Hubungi developer**  
   Buat issue di GitHub: https://github.com/BagasRPLx-b/Libary-Management/issues

---

## 📝 Catatan Penting

- **Simpan kredensial dengan aman** - Jangan bagikan password atau token Anda
- **Backup data regularly** - Pastikan data penting selalu di-backup
- **Update dependencies** - Jalankan `npm install` untuk update package terbaru
- **Gunakan HTTPS di production** - Jangan gunakan HTTP untuk data sensitif

---

## 📄 Lisensi

Project ini dibuat untuk keperluan manajemen perpustakaan.

---

**Dibuat dengan ❤️ untuk Sistem Manajemen Perpustakaan Modern**

> Terakhir diperbarui: Agustus 2026
