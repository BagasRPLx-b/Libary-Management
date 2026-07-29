# 📚 Library Management System - Frontend (Week 1)

> **Periode:** Week 1 (Day 1-5)  
> **Tim Frontend:** Andhika & Bagas  
> **Status:** ✅ Static Layout & Foundation Complete

---

## 📋 Daftar Isi

- [Tujuan Week 1](#-tujuan-week-1)
- [Fitur yang Telah Dikembangkan](#-fitur-yang-telah-dikembangkan)
- [Struktur Folder](#-struktur-folder)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Menjalankan Project](#-cara-menjalankan-project)
- [Halaman yang Tersedia](#-halaman-yang-tersedia)
- [Mock Data](#-mock-data)
- [Checklist Week 1](#-checklist-week-1)
- [Tim Pengembang](#-tim-pengembang)

---

## 🎯 Tujuan Week 1

Membangun fondasi aplikasi **Library Management System** berbasis React dengan:

1. ✅ **Inisialisasi Project** - React + TypeScript + Vite
2. ✅ **Routing & Navigation** - 3 Layout berbeda (Public, Admin/Staff, Member)
3. ✅ **Static Layout** - Semua halaman dengan sample data
4. ✅ **UI/UX Best Practices** - Loading, Error, Empty states
5. ✅ **Siap Presentasi** - Day 5 Checkpoint

---

## ✨ Fitur yang Telah Dikembangkan

### 1. Sistem Autentikasi (UI)
- [x] Halaman Login (`/login`)
- [x] Halaman Register (`/register`)
- [x] Form dengan validasi (React Hook Form + Zod)
- [x] ProtectedRoute & RoleRoute wrapper

### 2. 3 Layout Berbeda (Role-Based)

| Role | Layout | Navigasi | Halaman |
| :--- | :--- | :--- | :--- |
| **Public** | `PublicLayout` | - | Login, Register |
| **Admin/Staff** | `PrivateLayout` | Sidebar (kiri) | Catalog, Circulation, Members, Reports |
| **Member** | `MemberLayout` | Navbar (atas) | Catalog, Profile |

### 3. Halaman Catalog (`/catalog`)
- [x] Grid Card daftar buku (sample data)
- [x] Search bar & filter dropdown (UI only)
- [x] Status stok (hijau/merah)
- [x] **Tombol "Tambah Buku"** + Modal Form
- [x] **Dropdown Category** di form
- [x] **Ikon Edit (✏️)** + Modal Form terisi data
- [x] **Ikon Hapus (🗑️)** + Modal Konfirmasi
- [x] Halaman Detail Buku (`/books/:id`)

### 4. Halaman Circulation (`/circulation`)
- [x] Input scanner barcode (UI)
- [x] Toggle mode ISSUE/RETURN
- [x] Book detail card (hasil scan)
- [x] Daftar transaksi hari ini (sample data)

### 5. Halaman Members (`/members`)
- [x] Tabel daftar member (sample data)
- [x] Status member (Active/Suspended)
- [x] Tombol "Tambah Member" + Modal Form
- [x] Search bar (UI only)
- [x] Halaman Profil Member (`/profile`)

### 6. Halaman Reports (`/reports`)
- [x] Tabel overdue loans (sample data)
- [x] Badge status "Overdue"
- [x] Total fine amount

### 7. UI/UX Components (shadcn/ui)
- [x] Loading Skeleton
- [x] Error Alert
- [x] Empty State
- [x] Modal/Dialog
- [x] Badge
- [x] Card
- [x] Table
- [x] Responsive Design

---

## 📁 Struktur Folder

```
library-management-system/
├── .env.development          # Environment variable untuk development
├── .env.production           # Environment variable untuk production
├── .gitignore
├── components.json           # Konfigurasi shadcn/ui
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json             # Konfigurasi TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts            # Konfigurasi Vite + Alias
│
├── public/                   # Aset statis
│   └── vite.svg
│
└── src/                      # Source code utama
    ├── main.tsx              # Entry point aplikasi
    ├── App.tsx               # Root component
    ├── index.css             # Global styles (Tailwind CSS)
    ├── vite-env.d.ts         # Type declarations untuk Vite
    │
    ├── components/           # Komponen UI
    │   ├── layout/           # Layout components
    │   │   ├── AppLayout.tsx        # Layout selector (Admin/Staff vs Member)
    │   │   ├── PublicLayout.tsx     # Layout untuk halaman publik (Login/Register)
    │   │   ├── PrivateLayout.tsx    # Layout dengan Sidebar + Navbar (Admin/Staff)
    │   │   ├── MemberLayout.tsx     # Layout dengan Navbar Horizontal (Member)
    │   │   ├── Navbar.tsx           # Navbar untuk PrivateLayout
    │   │   └── Sidebar.tsx          # Sidebar dengan navigasi role-based
    │   │
    │   └── ui/               # Komponen shadcn/ui (atomic components)
    │       ├── alert.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── command.tsx
    │       ├── dialog.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── popover.tsx
    │       ├── select.tsx
    │       ├── skeleton.tsx
    │       └── table.tsx
    │
    ├── context/              # React Context
    │   └── AuthContext.tsx   # Auth context (user, login, logout, token)
    │
    ├── features/             # Feature-based modules
    │   ├── auth/             # Authentication feature
    │   │   ├── components/
    │   │   │   ├── ProtectedRoute.tsx  # Wrapper untuk halaman perlu autentikasi
    │   │   │   └── RoleRoute.tsx       # Wrapper untuk akses berdasarkan role
    │   │   ├── hooks/
    │   │   │   └── useAuth.ts          # Custom hooks (useLogin, useRegister)
    │   │   └── pages/
    │   │       ├── LoginPage.tsx       # Halaman Login
    │   │       └── RegisterPage.tsx    # Halaman Register
    │   │
    │   ├── books/            # Books/Catalog feature
    │   │   └── pages/
    │   │       ├── CatalogPage.tsx     # Halaman Katalog Buku (CRUD + Grid)
    │   │       └── BookDetailPage.tsx  # Halaman Detail Buku (/books/:id)
    │   │
    │   ├── loans/            # Circulation feature
    │   │   └── pages/
    │   │       └── CirculationPage.tsx # Halaman Sirkulasi (Issue/Return)
    │   │
    │   ├── members/          # Members feature
    │   │   └── pages/
    │   │       ├── MembersPage.tsx     # Halaman Manajemen Member (Admin/Staff)
    │   │       └── ProfilePage.tsx     # Halaman Profil Member (/profile)
    │   │
    │   └── reports/          # Reports feature
    │       └── pages/
    │           └── ReportsPage.tsx     # Halaman Laporan Overdue
    │
    ├── hooks/                # Global custom hooks (jika ada)
    │
    ├── lib/                  # Library/utilities
    │   ├── api/
    │   │   └── client.ts     # Axios instance + interceptors
    │   ├── utils.ts          # Utility functions (cn, dll)
    │   └── validations/
    │       └── auth.schema.ts # Zod schemas (login, register)
    │
    └── routes/               # Routing configuration
        └── index.tsx         # React Router v6 configuration
```

---

## 🛠️ Teknologi yang Digunakan

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" height="32"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" height="32"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" height="32"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" height="32"/>
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" height="32"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" height="32"/>
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" alt="React Hook Form" height="32"/>
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" height="32"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" height="32"/>
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" height="32"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" height="32"/>
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier" height="32"/>
</p>

| Teknologi | Versi | Kegunaan |
| :--- | :--- | :--- |
| **React** | 18.x | Library UI utama |
| **TypeScript** | 5.x | Type safety & maintainability |
| **Vite** | 5.x | Build tool & development server |
| **Tailwind CSS** | 3.x | Styling & utility classes |
| **shadcn/ui** | Latest | Komponen UI atomic |
| **React Router** | 6.x | Routing & navigation |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 3.x | Validasi form |
| **Axios** | 1.x | HTTP client (siap untuk Week 2) |
| **TanStack Query** | 5.x | Server state management (siap untuk Week 2) |
| **ESLint** | 9.x | Code linting |
| **Prettier** | 3.x | Code formatting |

---

## 🚀 Cara Menjalankan Project

### Prasyarat
- Node.js >= 18.x
- npm atau yarn atau pnpm

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/your-username/lms-frontend.git
cd lms-frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.development
# Edit .env.development dengan URL backend (untuk Week 2)
# VITE_API_URL=http://localhost:8000/api/v1

# 4. Jalankan development server
npm run dev

# 5. Buka browser di http://localhost:5173
```

### Perintah Lainnya

```bash
# Build untuk production
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Format code
npm run format
```

---

## 📄 Halaman yang Tersedia

| Halaman | URL | Layout | Status |
| :--- | :--- | :--- | :--- |
| **Login** | `/login` | Public | ✅ UI siap |
| **Register** | `/register` | Public | ✅ UI siap |
| **Catalog** | `/catalog` | Private (Admin) / Member | ✅ UI siap |
| **Book Detail** | `/books/:id` | Private (Admin) / Member | ✅ UI siap |
| **Circulation** | `/circulation` | Private (Admin/Staff) | ✅ UI siap |
| **Members** | `/members` | Private (Admin/Staff) | ✅ UI siap |
| **Member Profile** | `/profile` | Member | ✅ UI siap |
| **Reports** | `/reports` | Private (Admin/Staff) | ✅ UI siap |

---

## 🎨 Mock Data

### Sample Books (10 data)
```typescript
const sampleBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publisher: "Scribner",
    publication_year: 1925,
    category_id: 1,
    category: "Fiction",
    total_copies: 10,
    available_copies: 3,
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    publisher: "HarperCollins",
    publication_year: 1960,
    category_id: 1,
    category: "Fiction",
    total_copies: 8,
    available_copies: 0,
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publisher: "Signet Classics",
    publication_year: 1949,
    category_id: 4,
    category: "Dystopian",
    total_copies: 12,
    available_copies: 5,
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    publisher: "Penguin Classics",
    publication_year: 1813,
    category_id: 5,
    category: "Romance",
    total_copies: 7,
    available_copies: 2,
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769488",
    publisher: "Little, Brown and Company",
    publication_year: 1951,
    category_id: 1,
    category: "Fiction",
    total_copies: 6,
    available_copies: 1,
  },
  {
    id: 6,
    title: "Moby Dick",
    author: "Herman Melville",
    isbn: "9780142437247",
    publisher: "Penguin Classics",
    publication_year: 1851,
    category_id: 6,
    category: "Adventure",
    total_copies: 5,
    available_copies: 0,
  },
  {
    id: 7,
    title: "War and Peace",
    author: "Leo Tolstoy",
    isbn: "9781400079988",
    publisher: "Vintage Classics",
    publication_year: 1869,
    category_id: 7,
    category: "Historical",
    total_copies: 8,
    available_copies: 4,
  },
  {
    id: 8,
    title: "Hamlet",
    author: "William Shakespeare",
    isbn: "9780743477123",
    publisher: "Simon & Schuster",
    publication_year: 1603,
    category_id: 8,
    category: "Drama",
    total_copies: 10,
    available_copies: 2,
  },
  {
    id: 9,
    title: "The Odyssey",
    author: "Homer",
    isbn: "9780140268867",
    publisher: "Penguin Classics",
    publication_year: -800,
    category_id: 9,
    category: "Epic",
    total_copies: 6,
    available_copies: 0,
  },
  {
    id: 10,
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    isbn: "9780140449136",
    publisher: "Penguin Classics",
    publication_year: 1866,
    category_id: 10,
    category: "Psychological",
    total_copies: 9,
    available_copies: 3,
  },
];
```

### Sample Categories (10 data)
```typescript
const sampleCategories = [
  { id: 1, name: "Fiction", slug: "fiction" },
  { id: 2, name: "Non-Fiction", slug: "non-fiction" },
  { id: 3, name: "Fantasy", slug: "fantasy" },
  { id: 4, name: "Dystopian", slug: "dystopian" },
  { id: 5, name: "Romance", slug: "romance" },
  { id: 6, name: "Adventure", slug: "adventure" },
  { id: 7, name: "Historical", slug: "historical" },
  { id: 8, name: "Drama", slug: "drama" },
  { id: 9, name: "Epic", slug: "epic" },
  { id: 10, name: "Psychological", slug: "psychological" },
];
```

### Sample Members (10 data)
```typescript
const sampleMembers = [
  {
    id: 1,
    member_code: "M001",
    name: "Andhika",
    email: "andhika@email.com",
    phone: "081234567890",
    status: "active",
  },
  {
    id: 2,
    member_code: "M002",
    name: "Bagas",
    email: "bagas@email.com",
    phone: "081298765432",
    status: "active",
  },
  {
    id: 3,
    member_code: "M003",
    name: "Citra",
    email: "citra@email.com",
    phone: "081234567891",
    status: "suspended",
  },
  {
    id: 4,
    member_code: "M004",
    name: "Dewi",
    email: "dewi@email.com",
    phone: "081234567892",
    status: "active",
  },
  {
    id: 5,
    member_code: "M005",
    name: "Eko",
    email: "eko@email.com",
    phone: "081234567893",
    status: "active",
  },
  {
    id: 6,
    member_code: "M006",
    name: "Fitri",
    email: "fitri@email.com",
    phone: "081234567894",
    status: "active",
  },
  {
    id: 7,
    member_code: "M007",
    name: "Gilang",
    email: "gilang@email.com",
    phone: "081234567895",
    status: "suspended",
  },
  {
    id: 8,
    member_code: "M008",
    name: "Hana",
    email: "hana@email.com",
    phone: "081234567896",
    status: "active",
  },
  {
    id: 9,
    member_code: "M009",
    name: "Indra",
    email: "indra@email.com",
    phone: "081234567897",
    status: "active",
  },
  {
    id: 10,
    member_code: "M010",
    name: "Joko",
    email: "joko@email.com",
    phone: "081234567898",
    status: "active",
  },
];
```

### Sample Transactions (5 data)
```typescript
const sampleTransactions = [
  {
    id: 1,
    member: "Andhika",
    book: "The Great Gatsby",
    borrowed_at: "2026-07-28",
    due_date: "2026-08-11",
    status: "active",
  },
  {
    id: 2,
    member: "Bagas",
    book: "1984",
    borrowed_at: "2026-07-25",
    due_date: "2026-08-08",
    status: "active",
  },
  {
    id: 3,
    member: "Citra",
    book: "Pride and Prejudice",
    borrowed_at: "2026-07-20",
    due_date: "2026-08-03",
    status: "returned",
  },
  {
    id: 4,
    member: "Dewi",
    book: "Hamlet",
    borrowed_at: "2026-07-22",
    due_date: "2026-08-05",
    status: "active",
  },
  {
    id: 5,
    member: "Eko",
    book: "Crime and Punishment",
    borrowed_at: "2026-07-18",
    due_date: "2026-08-01",
    status: "overdue",
  },
];
```

### Sample Overdue Loans (5 data)
```typescript
const sampleOverdue = [
  {
    id: 1,
    member: "Citra",
    book: "To Kill a Mockingbird",
    due_date: "2026-07-20",
    fine_amount: 5000,
  },
  {
    id: 2,
    member: "Dewi",
    book: "Moby Dick",
    due_date: "2026-07-15",
    fine_amount: 10000,
  },
  {
    id: 3,
    member: "Eko",
    book: "Crime and Punishment",
    due_date: "2026-08-01",
    fine_amount: 0,
  },
  {
    id: 4,
    member: "Fitri",
    book: "The Odyssey",
    due_date: "2026-07-25",
    fine_amount: 5000,
  },
  {
    id: 5,
    member: "Gilang",
    book: "War and Peace",
    due_date: "2026-07-28",
    fine_amount: 3000,
  },
];
```

---

## ✅ Checklist Week 1

### Project Setup
- [x] Inisialisasi React + TypeScript + Vite
- [x] Install dependencies (react-router, axios, react-query, react-hook-form, zod)
- [x] Setup Tailwind CSS
- [x] Setup shadcn/ui
- [x] Struktur folder feature-based
- [x] Environment variables (.env.development, .env.production)
- [x] TypeScript configuration (tsconfig.json, tsconfig.app.json, tsconfig.node.json)
- [x] Vite alias configuration

### Routing & Layout
- [x] React Router v6 setup
- [x] PublicLayout (Login, Register)
- [x] PrivateLayout (Sidebar + Navbar untuk Admin/Staff)
- [x] MemberLayout (Navbar untuk Member)
- [x] AppLayout (Layout selector based on role)
- [x] ProtectedRoute wrapper
- [x] RoleRoute wrapper
- [x] Sidebar menu (Catalog, Circulation, Members, Reports)
- [x] Navbar (nama user & logout)

### Halaman Catalog
- [x] Grid daftar buku (sample data)
- [x] Search bar & filter (UI)
- [x] Status stok (hijau jika > 0, merah jika 0)
- [x] Tombol "Tambah Buku"
- [x] Modal form (dengan dropdown category)
- [x] Ikon Edit + Modal form terisi data
- [x] Ikon Hapus + Modal konfirmasi
- [x] Halaman Detail Buku

### Halaman Circulation
- [x] Input scanner barcode
- [x] Toggle Issue/Return
- [x] Book detail card (hasil scan - sample data)
- [x] Daftar transaksi hari ini (sample data)

### Halaman Members
- [x] Tabel daftar member (sample data)
- [x] Status member (Active/Suspended)
- [x] Tombol "Tambah Member"
- [x] Search bar (UI)
- [x] Halaman Profil Member (/profile)

### Halaman Reports
- [x] Tabel overdue loans (sample data)
- [x] Badge status "Overdue"
- [x] Total fine amount

### UI/UX Components (shadcn/ui)
- [x] Alert
- [x] Badge
- [x] Button
- [x] Card
- [x] Dialog/Modal
- [x] Form
- [x] Input
- [x] Label
- [x] Select
- [x] Skeleton
- [x] Table

### Best Practices
- [x] Named exports (prefer named exports)
- [x] Feature-based structure (src/features/)
- [x] Reusable atomic components (src/components/ui/)
- [x] TypeScript interfaces untuk semua data
- [x] Zod schemas untuk validasi
- [x] React Hook Form untuk form handling
- [x] Async feedback components (loading, error, empty)

---

## 📊 Catatan Penting

### Database Relation
- `books.category_id` → `categories.id` (Foreign Key)
- `loans.member_id` → `members.id` (Foreign Key)
- `loans.book_id` → `books.id` (Foreign Key)

### API yang Sudah Siap (Week 2)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/v1/login` | Login user |
| `POST` | `/api/v1/register` | Register member |
| `GET` | `/api/v1/books` | Daftar buku (dengan filter) |
| `POST` | `/api/v1/books` | Tambah buku |
| `PUT` | `/api/v1/books/{id}` | Edit buku |
| `DELETE` | `/api/v1/books/{id}` | Hapus buku |
| `POST` | `/api/v1/loans/issue` | Peminjaman buku |
| `POST` | `/api/v1/loans/{id}/return` | Pengembalian buku |
| `GET` | `/api/v1/members/{id}/history` | Riwayat member |
| `GET` | `/api/v1/reports/overdue` | Laporan overdue |

---

## 👥 Tim Pengembang

| Peran | Nama | Kontak |
| :--- | :--- | :--- |
| **Frontend Lead** | Andhika | [GitHub](#) |
| **Frontend Developer** | Bagas | [GitHub](#) |
| **Backend Lead** | [Nama] | [GitHub](#) |
| **Mobile Lead** | Alfa | [GitHub](#) |
| **UI/UX Designer** | [Nama] | [Figma](#) |

---

## 📅 Next Steps (Week 2)

### Yang Akan Dikerjakan

1. **API Integration**
   - Koneksi ke backend dengan Axios
   - Setup TanStack Query
   - Data dinamis dari API

2. **Autentikasi Real**
   - Login/Register ke API
   - JWT token management
   - Role-based access (Admin, Staff, Member)

3. **CRUD Real**
   - Tambah/Edit/Hapus buku ke API
   - Issue/Return real (dengan fine calculation)
   - Member management real

4. **Feedback Real**
   - Loading state dari API
   - Error handling (401, 404, 500)
   - Success notifications (toast)

5. **Data Real-time**
   - Stok buku update otomatis
   - Overdue calculation
   - Member history

---

**Status:** ✅ Week 1 Complete

---

> Dibuat dengan ❤️ oleh Tim Frontend Library Management System
