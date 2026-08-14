# 📚 Library Management System - Frontend

> **Status Project:** ✅ Full API Integration, State Management & Production Ready  
> **Tech Stack:** React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + TanStack Query v5 + React Router v7  
> **Backend Base URL:** `VITE_API_URL` (Cloudflare Tunnel API v1)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Environment Variables](#-environment-variables)
- [Cara Menjalankan Project](#-cara-menjalankan-project)
- [Alur Aplikasi & Sistem Autentikasi](#-alur-aplikasi--sistem-autentikasi)
- [Aturan Denda & Perhitungan (LMS)](#-aturan-denda--perhitungan-lms)
- [Integrasi API Endpoint](#-integrasi-api-endpoint)
- [Checklist Kualitas & Audit](#-checklist-kualitas--audit)

---

## ✨ Fitur Utama

### 1. Sistem Autentikasi & Role-Based Access
- **Multi-Role Support:** Admin, Staff, dan Member.
- **Protected & Role-Based Routing:** 
  - `ProtectedRoute`: Memastikan hanya user terautentikasi yang dapat mengakses aplikasi.
  - `RoleRoute`: Menjaga akses khusus Admin/Staff untuk menu manajemen (Circulation, Members, Reports).
- **JWT Token Management:** Otomatis melampirkan token di setiap HTTP Request melalui Axios Interceptor.

### 2. Katalog Buku (`/catalog` & `/books/:id`)
- **Server-State Management:** Data buku, kategori, dan penulis dikelola dengan **TanStack Query**.
- **Real-time Search & Filter:** Pencarian judul/penulis dilengkapi dengan `useDebounce` hook (400ms) untuk efisiensi request API.
- **CRUD Buku (Admin/Staff):** Tambah, Edit, dan Hapus buku dengan update otomatis via query invalidation.
- **Searchable Select & Dynamic Dropdown:** Filter berdasarkan kategori dan penulis yang dinamis.

### 3. Sirkulasi & Scanner (`/circulation`)
- **Mode Issue & Return:** Dukungan penuh peminjaman dan pengembalian buku.
- **Barcode / ISBN Scanner:** Input scan barcode langsung terintegrasi dengan endpoint `/books/scan/{isbn}`.
- **Real-time Today Transactions:** Tabel transaksi hari ini otomatis ter-refresh secara asynchronous.
- **Modal Konfirmasi Denda:** Menampilkan jumlah denda keterlambatan saat pengembalian.

### 4. Manajemen Member & Profil (`/members` & `/profile`)
- **Daftar Member (Admin/Staff):** Monitoring status member (Active / Suspended) beserta aksi ubah data dan status.
- **Profil Member (`/profile`):** Menampilkan ringkasan total pinjaman, denda aktif yang valid dari server state, dan riwayat aktivitas peminjaman.

### 5. Laporan Overdue (`/reports`)
- **Monitoring Keterlambatan:** Menampilkan daftar peminjaman yang melewati tanggal jatuh tempo (`due_date`).
- **Pencarian & Filter Laporan:** Memudahkan Staff/Admin memantau pengembalian buku yang belum dilakukan.

---

## 📁 Arsitektur & Struktur Folder

Aplikasi ini menggunakan struktur folder **Feature-Based Architecture** yang memisahkan kode berdasarkan modul fitur domain bisnis (`auth`, `books`, `loans`, `members`, `reports`):

```
library-management-system/
├── .env.development          # Variable environment development
├── .env.production           # Variable environment production
├── .env.example              # Template environment variable
├── components.json           # Konfigurasi shadcn/ui
├── eslint.config.js          # Konfigurasi ESLint
├── index.html
├── package.json              # Script & Dependencies
├── tailwind.config.js        # Konfigurasi Tailwind CSS
├── tsconfig.json             # Root TypeScript config
├── tsconfig.app.json         # Strict Mode TypeScript config (strict: true)
├── vite.config.ts            # Vite config (Alias @ -> src, Server Proxy)
│
└── src/
    ├── main.tsx              # Entry Point React app
    ├── App.tsx               # App Root
    ├── index.css             # Styling Global (Tailwind v4)
    │
    ├── components/           # Reusable Component UI & Layout
    │   ├── layout/           # App Layouts
    │   │   ├── AppLayout.tsx        # Layout Switcher (Admin/Staff vs Member)
    │   │   ├── PublicLayout.tsx     # Public Layout (Login/Register)
    │   │   ├── PrivateLayout.tsx    # Sidebar + Topbar Layout (Admin/Staff)
    │   │   ├── MemberLayout.tsx     # Top Navbar Layout (Member)
    │   │   ├── Navbar.tsx           # Global Header & User Menu
    │   │   └── Sidebar.tsx          # Navigasi Role-Based
    │   │
    │   └── ui/               # Atomic Components (shadcn/ui)
    │       ├── alert.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       ├── select.tsx
    │       ├── skeleton.tsx
    │       └── table.tsx
    │
    ├── context/
    │   └── AuthContext.tsx   # React Context Auth (user state & token storage)
    │
    ├── features/             # Feature Modules (Feature-Based Architecture)
    │   ├── auth/
    │   │   ├── components/   # ProtectedRoute.tsx, RoleRoute.tsx
    │   │   ├── hooks/        # useAuth.ts (useLogin, useRegister)
    │   │   └── pages/        # LoginPage.tsx, RegisterPage.tsx
    │   │
    │   ├── books/
    │   │   ├── components/   # BookCardSkeleton.tsx, BookEmptyState.tsx
    │   │   ├── hooks/        # useBooks.ts (useBooks, useBook, useCreateBook, dll)
    │   │   └── pages/        # CatalogPage.tsx, BookDetailPage.tsx
    │   │
    │   ├── loans/
    │   │   ├── hooks/        # useCirculation.ts (useTodayTransactions, useIssueBook, useReturnBook)
    │   │   └── pages/        # CirculationPage.tsx, ActiveLoansPage.tsx
    │   │
    │   ├── members/
    │   │   ├── hooks/        # useMember.ts, useProfile.ts
    │   │   └── pages/        # MembersPage.tsx, ProfilePage.tsx, MemberLoansPage.tsx
    │   │
    │   └── reports/
    │       ├── hooks/        # useReports.ts (useOverdueLoans)
    │       └── pages/        # ReportsPage.tsx
    │
    ├── hooks/
    │   └── useDebounce.ts    # Custom hook pencarian ter-debounce (400ms)
    │
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts     # Axios Instance + Auth Interceptor
    │   │   ├── books.ts      # API Calls Buku & Kategori
    │   │   ├── loans.ts      # API Calls Sirkulasi & Transaksi
    │   │   ├── members.ts    # API Calls Member
    │   │   └── types.ts      # API Data Transfer Interfaces
    │   │
    │   ├── error-handler.ts  # Standardized Error Handler (Axios & Validation)
    │   ├── formatters.ts     # Currency & Date Formatters (formatRupiah, formatDateString)
    │   └── utils.ts          # Utility Classmerge (cn)
    │
    └── routes/
        └── index.tsx         # React Router v7 Router Configuration
```

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi | Peran Dalam Project |
| :--- | :--- | :--- |
| **React** | 19.x | Framework UI Komponen |
| **TypeScript** | 6.x | Type Safety (Mode Strict Aktif) |
| **Vite** | 8.x | Build Tooling & Development Server Fast HMR |
| **TanStack Query** | 5.x | Server-State Management, Caching, & Mutations |
| **React Router** | 7.x | Routing Client-Side & Nested Role Guards |
| **Tailwind CSS** | 4.x | Styling Utility-First |
| **Axios** | 1.x | HTTP Client dengan Interceptor Token |
| **date-fns** | 4.x | Format Tanggal & Bahasa Indonesia Locale |
| **Lucide React** | 1.x | Icon Library Modern |

---

## ⚙️ Environment Variables

Aplikasi menggunakan environment variable yang didefinisikan dalam `.env.development` dan `.env.production`.

Contoh file `.env.example`:
```env
# URL Base Endpoint API Backend
VITE_API_URL=https://barrier-generation-queensland-session.trycloudflare.com/api/v1
```

> **Catatan:** `apiClient` di `src/lib/api/client.ts` secara otomatis membaca `import.meta.env.VITE_API_URL`.

---

## 🚀 Cara Menjalankan Project

### Prasyarat
- **Node.js** >= 18.x
- **npm** >= 9.x

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/your-username/library-management-system.git
cd library-management-system

# 2. Install dependencies
npm install

# 3. Buat file .env.development (opsional, ikuti template .env.example)
cp .env.example .env.development

# 4. Menjalankan server development
npm run dev

# 5. Buka di browser
http://localhost:5173
```

### Perintah Pembangunan & Kualitas

```bash
# Jalankan pembuktian type-check TypeScript + build bundler production
npm run build

# Menjalankan linter ESLint
npm run lint

# Menjalankan preview build hasil bundler production
npm run preview
```

---

## 🔄 Alur Aplikasi & Sistem Autentikasi

### Alur Alur Autentikasi User (Flowchart)
```
[ User Input Email/Password ]
             │
             ▼
      [ POST /login ]
             │
   ┌─────────┴─────────┐
   ▼                   ▼
 (Gagal)           (Sukses)
   │                   │
[Pesan Error]   [Simpan access_token & User Data ke localStorage]
                       │
                       ▼
            [ AuthContext Updated ]
                       │
                       ▼
      [ Navigate -> /catalog atau /circulation ]
```

### Alur Guard Otorisasi Role (Routing)
```
                  [ URL Requested ]
                          │
                          ▼
                 [ ProtectedRoute ]
                  /               \
         (Is Authenticated?)   (Not Authenticated)
                /                     \
             [YES]                  [Redirect /login]
              /
             ▼
        [ RoleRoute ]
       /             \
(Role Permitted?)  (Role Denied)
     /                 \
  [YES]               [Redirect /catalog]
   /
  ▼
[ Render Target Page ]
```

---

## 💰 Aturan Denda & Perhitungan (LMS)

Aplikasi LMS ini mengikuti aturan bisnis perhitungan denda yang tepat:

1. **Denda Final dari Backend API:**  
   Nilai denda final yang valid **diambil dari field `fine_amount` pada API response** saat transaksi statusnya sudah `'returned'`.
2. **Estimasi Denda (`estimated_fine`):**  
   Field `estimated_fine` pada data pinjaman overdue hanya dijadikan estimasi sementara dan **tidak dihitung/diakumulasikan sebagai denda terutang resmi** sebelum pengembalian diproses oleh backend.
3. **Format Mata Uang:**  
   Menggunakan formatter terpusat `formatRupiah()` (`Rp X.XXX`) di `src/lib/formatters.ts`.

---

## 📡 Integrasi API Endpoint

| Method | Endpoint | Fungsi | Akses Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Autentikasi pengguna & pengambilan JWT Token | Public |
| `POST` | `/register` | Pendaftaran akun member baru | Public |
| `GET` | `/books` | Mengambil data katalog buku (support query params: `search`, `author`, `category_id`, `page`) | All Roles |
| `GET` | `/books/scan/{isbn}` | Mencari detail buku berdasarkan scan barcode ISBN | Admin, Staff |
| `POST` | `/books` | Menambahkan buku baru | Admin, Staff |
| `PUT` | `/books/{id}` | Memperbarui data buku | Admin, Staff |
| `DELETE` | `/books/{id}` | Menghapus data buku | Admin, Staff |
| `POST` | `/loans/issue` | Memproses peminjaman buku ke anggota | Admin, Staff |
| `POST` | `/loans/{id}/return` | Memproses pengembalian buku & menghitung denda | Admin, Staff |
| `GET` | `/transactions` | Mengambil transaksi sirkulasi hari ini | Admin, Staff |
| `GET` | `/members` | Daftar seluruh anggota perpustakaan | Admin, Staff |
| `GET` | `/profile` | Memuat data profil & riwayat pinjaman pengguna yang login | All Roles |
| `GET` | `/reports/overdue` | Laporan data peminjaman terlambat | Admin, Staff |

---

## 🔍 Checklist Kualitas & Audit

- [x] **Arsitektur Feature-Based:** Terpisah jelas antara modul `auth`, `books`, `loans`, `members`, `reports`.
- [x] **State Management:** Penggunaan **TanStack Query** untuk server state caching dan mutasi data.
- [x] **Pencarian Ter-debounce:** Memakai `useDebounce` hook untuk mencegah spam request API.
- [x] **Clean Imports:** Seluruh import menggunakan path alias `@/`.
- [x] **Error Handling:** Terstandarisasi dengan `getErrorMessage()` dan penanganan error Axios HTTP status.
- [x] **Loading & Empty State:** Tersedia komponen Skeleton dan Empty State di seluruh modul.
- [x] **TypeScript Strict:** Mode `"strict": true` aktif di `tsconfig.app.json` dan bebas error kompilasi.
- [x] **Environment Variable:** Konfigurasi API terhubung dengan `.env.development` & `.env.example`.

---

> Dibuat dengan ❤️ untuk **Library Management System Frontend**
