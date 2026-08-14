# Panduan Pengguna Library Management System

Selamat datang di panduan pengguna aplikasi **Library Management System**. Panduan ini dibuat untuk membantu Anda menggunakan sistem dengan mudah, cepat, dan efektif.

Dokumen ini ditujukan untuk kedua jenis pengguna:
- **Member** (Anggota Perpustakaan)
- **Staff / Admin** (Petugas Perpustakaan)

---

## 1. Pendahuluan

### Apa itu Library Management System?
Library Management System adalah aplikasi web untuk mengelola buku, peminjaman, pengembalian, dan anggota perpustakaan.

Aplikasi ini membantu:
- member mencari buku
- staff mencatat peminjaman dan pengembalian
- admin mengelola data buku dan anggota
- melihat laporan keterlambatan dan denda

### Siapa yang menggunakan aplikasi ini?
- **Member**: Anggota perpustakaan yang meminjam dan mengembalikan buku.
- **Staff / Admin**: Petugas perpustakaan yang mengelola koleksi buku, member, dan transaksi.

### Bagaimana cara mengakses aplikasi?
Akses aplikasi melalui browser di alamat:
- **https://library-management.vercel.app**

Cukup buka alamat tersebut, lalu login menggunakan akun yang sudah terdaftar.

---

## 2. Panduan Login & Registrasi

### Cara membuat akun baru (Register)
1. Buka halaman **Register**.
2. Isi data yang diminta:
   - Nama lengkap
   - Email
   - Nomor telepon
   - Kata sandi
   - Konfirmasi kata sandi
3. Klik tombol **Daftar**.
4. Jika berhasil, Anda akan diarahkan ke halaman login.

### Cara login ke sistem
1. Buka halaman **Login**.
2. Masukkan email dan kata sandi Anda.
3. Klik tombol **Login**.
4. Jika data benar, Anda akan masuk ke area yang sesuai dengan peran Anda.

### Cara logout
1. Cari tombol **Logout** di menu navigasi.
2. Klik tombol tersebut.
3. Anda akan keluar dan kembali ke halaman login.

### Apa yang harus dilakukan jika lupa password?
Saat ini, fitur **lupa password** belum tersedia di aplikasi. Jika Anda lupa password, silakan hubungi
petugas perpustakaan atau admin sistem untuk melakukan reset password.

---

## 3. Panduan untuk Member (Anggota)

### A. Katalog Buku

#### Cara mencari buku (Search)
1. Buka halaman **Katalog Buku**.
2. Ketik judul buku atau nama penulis di kotak **Search**.
3. Hasil pencarian akan muncul secara otomatis.

#### Cara memfilter buku (kategori, penulis)
1. Di halaman Katalog, pilih **kategori** yang ingin dicari.
2. Jika tersedia, pilih juga **penulis** untuk mempersempit hasil.
3. Sistem akan menampilkan buku sesuai filter yang dipilih.

#### Cara melihat detail buku
1. Klik salah satu buku di daftar.
2. Halaman **Detail Buku** akan terbuka.
3. Di sana Anda dapat melihat informasi lengkap buku, seperti judul, pengarang, kategori, dan ketersediaan.

#### Cara melihat stok buku
1. Pada halaman detail buku, lihat bagian **Stok** atau **Ketersediaan**.
2. Jika stok tersedia, biasanya ditampilkan angka jumlah eksemplar yang bisa dipinjam.

### B. Peminjaman Saya

#### Cara melihat buku yang sedang dipinjam
1. Buka halaman **Peminjaman Saya**.
2. Anda akan melihat daftar buku yang masih dalam status dipinjam.

#### Cara melihat sisa waktu peminjaman
1. Di daftar peminjaman, periksa kolom **Jatuh Tempo** atau keterangan waktu.
2. Jika sudah hampir lewat, biasanya akan muncul status seperti **Hampir Jatuh Tempo** atau **Terlambat**.

#### Cara melihat riwayat peminjaman
1. Buka halaman **Peminjaman Saya**.
2. Gulir ke bagian **Riwayat Peminjaman**.
3. Di sana akan terlihat daftar buku yang sudah pernah Anda pinjam dan dikembalikan.

#### Cara melihat total denda (jika ada)
1. Buka halaman **Profil Saya**.
2. Cari bagian **Denda Aktif** atau ringkasan total denda.
3. Jika ada denda, nilai akan tampil dalam format mata uang.

### C. Profil Saya

#### Cara melihat data diri
1. Buka halaman **Profil Saya**.
2. Informasi seperti nama, email, telepon, dan ID anggota akan tampil di halaman tersebut.

#### Cara mengubah data diri (jika ada fitur)
1. Jika tersedia tombol **Edit Profil**, klik tombol tersebut.
2. Ubah data sesuai kebutuhan.
3. Simpan perubahan.

> Catatan: Jika fitur edit profil belum aktif, silakan hubungi petugas untuk memperbarui data.

#### Cara melihat riwayat aktivitas
1. Di halaman **Profil Saya**, Anda dapat melihat ringkasan aktivitas peminjaman.
2. Riwayat dapat mencakup jumlah peminjaman, denda aktif, dan buku yang sedang dipinjam.

---

## 4. Panduan untuk Admin / Staff

### A. Katalog Buku

#### Cara menambah buku baru
1. Buka halaman **Catalog**.
2. Klik tombol **Tambah Buku**.
3. Isi data buku baru:
   - Judul
   - Penulis
   - ISBN
   - Kategori
   - Penerbit
   - Tahun terbit
   - Jumlah kopi/eksemplar
4. Klik tombol **Simpan**.
5. Buku baru akan muncul di daftar katalog.

#### Cara mengedit data buku
1. Cari buku yang ingin diubah di halaman **Catalog**.
2. Klik tombol **Edit** pada baris buku tersebut.
3. Ubah data yang diperlukan.
4. Klik **Simpan**.

#### Cara menghapus buku
1. Cari buku yang akan dihapus.
2. Klik tombol **Hapus** pada baris buku tersebut.
3. Konfirmasi penghapusan jika diminta.
4. Buku akan dihapus dari daftar.

#### Cara mencari dan filter buku
1. Pada halaman Catalog, gunakan fitur **Search** untuk mencari judul atau penulis.
2. Gunakan filter kategori dan penulis untuk mempersempit hasil.

### B. Sirkulasi (Peminjaman & Pengembalian)

#### Cara meminjamkan buku ke member (Issue)
1. Buka halaman **Book Circulation**.
2. Pastikan mode berada di **Issue**.
3. Pilih member yang akan meminjam.
4. Masukkan ISBN atau scan barcode buku.
5. Klik **Cari Buku**.
6. Jika buku tersedia, klik tombol **Pinjam Buku**.
7. Sistem akan mencatat peminjaman dan mengurangi stok buku.

#### Cara memproses pengembalian buku (Return)
1. Buka halaman **Book Circulation**.
2. Ubah mode menjadi **Return**.
3. Masukkan ISBN atau scan barcode buku yang dikembalikan.
4. Pilih peminjam jika buku sedang dipinjam oleh lebih dari satu member.
5. Klik tombol **Proses Pengembalian**.
6. Jika ada denda keterlambatan, sistem akan menampilkan konfirmasi denda.

#### Cara menggunakan scanner barcode
1. Pastikan mode di halaman **Book Circulation** sudah sesuai (Issue atau Return).
2. Masukkan atau scan kode ISBN buku pada kolom yang tersedia.
3. Sistem akan mencari buku berdasarkan ISBN.
4. Jika ditemukan, tampilkan detail buku dan lanjutkan proses.

#### Cara melihat transaksi hari ini
1. Di halaman **Book Circulation**, lihat bagian daftar **Transaksi Hari Ini**.
2. Daftar tersebut menampilkan peminjaman dan pengembalian yang terjadi hari ini.
3. Jika ada masalah, gunakan tombol **Coba Lagi** untuk memuat ulang data.

### C. Manajemen Member

#### Cara melihat daftar member
1. Buka halaman **Manajemen Member**.
2. Anda akan melihat daftar semua member perpustakaan.
3. Data ditampilkan meliputi nama, email, telepon, dan status.

#### Cara menambah member baru
1. Jika tersedia tombol **Tambah Member**, klik tombol tersebut.
2. Isi informasi member baru.
3. Simpan data member.

> Catatan: Jika fitur tambah member belum tampil, Anda dapat menambahkan member melalui backend atau menu khusus yang disediakan oleh sistem.

#### Cara mengedit data member
1. Cari member yang ingin diubah.
2. Klik tombol **Edit**.
3. Ubah nama, email, telepon, atau status member.
4. Simpan perubahan.

#### Cara menonaktifkan member
1. Pilih member yang ingin dinonaktifkan.
2. Ubah status menjadi **suspended** atau nonaktif.
3. Simpan perubahan.
4. Member yang dinonaktifkan tidak dapat meminjam buku sementara waktu.

### D. Laporan

#### Cara melihat laporan peminjaman terlambat (Overdue)
1. Buka halaman **Reports**.
2. Laporan akan menampilkan daftar peminjaman yang sudah melewati batas waktu.
3. Gunakan kolom **Search** untuk mencari member atau buku tertentu.
4. Gunakan filter tanggal untuk menyaring daftar berdasarkan batas kembali.

#### Cara melihat total denda
1. Di halaman **Reports**, lihat ringkasan **Total Denda**.
2. Total denda menunjukkan jumlah keseluruhan denda dari transaksi terlambat.

---

## 5. FAQ (Frequently Asked Questions)

### Bagaimana cara melihat stok buku?
- Lihat halaman **Katalog Buku**.
- Pilih buku yang diinginkan.
- Di halaman detail buku, cek bagian **Stok** atau **Jumlah tersedia**.

### Berapa lama batas waktu peminjaman?
- Batas waktu peminjaman biasanya ditentukan oleh perpustakaan.
- Informasi pasti dapat dilihat di halaman peminjaman atau konfirmasi peminjaman.
- Jika tidak ada informasi jelas, tanyakan ke staff/admin.

### Bagaimana jika buku hilang atau rusak?
- Segera laporkan kepada staff perpustakaan.
- Sistem ini biasanya akan mencatat masalah dan menghitung denda sesuai aturan perpustakaan.

### Bagaimana cara membayar denda?
- Informasi detail pembayaran denda dapat ditanyakan langsung ke petugas.
- Di aplikasi, Anda dapat melihat jumlah total denda di halaman **Profil Saya** atau **Laporan**.

### Siapa yang harus dihubungi jika ada masalah?
- Hubungi **staff perpustakaan** atau **admin sistem**.
- Jika tersedia kontak di perpustakaan, gunakan kontak resmi yang diberikan oleh perpustakaan.

---

## 6. Istilah Penting (Glossary)

- **Issue** = Peminjaman buku
- **Return** = Pengembalian buku
- **Overdue** = Peminjaman terlambat
- **Fine** = Denda
- **ISBN** = Nomor identifikasi buku
- **Member** = Anggota perpustakaan

---

## 7. Tips Singkat

- Gunakan fungsi **Search** terlebih dahulu sebelum menanyakan stok buku ke petugas.
- Pastikan memasukkan **ISBN** dengan benar saat memproses scan buku.
- Selalu cek halaman **Profil Saya** untuk melihat informasi terkini tentang peminjaman dan denda.
- Jika sistem menampilkan error, refresh halaman atau hubungi petugas.

---

Terima kasih telah menggunakan Library Management System. Jika Anda ingin panduan tambahan, silakan minta kepada tim perpustakaan atau admin aplikasi.
