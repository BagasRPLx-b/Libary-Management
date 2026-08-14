// src/features/books/pages/CatalogPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, RotateCw, X, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useBooks,
  useCategories,
  useAuthors,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  type Book,
} from '@/features/books/hooks/useBooks';
import { getErrorMessage } from '@/lib/error-handler';

import { BookCardSkeleton } from '@/features/books/components/BookCardSkeleton';
import { BookEmptyState } from '@/features/books/components/BookEmptyState';

// ─── Main Component ──────────────────────────────────────
export default function CatalogPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Ambil filter dari URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);
  const [filterAuthor, setFilterAuthor] = useState(searchParams.get('author') || 'all');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk modal CRUD
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    totalCopies: 1,
    publisher: '',
    publication_year: new Date().getFullYear(),
  });

  // Role check dengan lowercase
  const isAdminOrStaff = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'staff';

  // Data dari API
  const { data: booksData, isLoading, isError, refetch } = useBooks({
    search: debouncedSearch || undefined,
    author: filterAuthor !== 'all' ? filterAuthor : undefined,
    category_id: filterCategory !== 'all' ? filterCategory : undefined,
    page: currentPage,
    per_page: 12,
  });

  const books = Array.isArray(booksData) ? booksData : (booksData?.data || []);
  const totalBooks = !Array.isArray(booksData) && booksData?.total ? booksData.total : books.length;
  const lastPage = !Array.isArray(booksData) && booksData?.last_page ? booksData.last_page : 1;


  const { data: categoriesRaw = [], isLoading: isLoadingCategories } = useCategories();
  const { data: authorsRaw = [], isLoading: isLoadingAuthors } = useAuthors();

  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const authors = Array.isArray(authorsRaw) ? authorsRaw : [];

  // Mutations
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBookMutation, isPending: isDeleting } = useDeleteBook();

  // ─── Convert ke format option untuk SearchableSelect ──
  const authorOptions = [
    { value: 'all', label: 'Semua Penulis' },
    ...authors.map((author) => ({
      value: author,
      label: author,
    })),
  ];

  // ─── Update URL saat filter berubah ───────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterAuthor && filterAuthor !== 'all') params.set('author', filterAuthor);
    if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, filterAuthor, filterCategory, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterAuthorChange = (value: string) => {
    setFilterAuthor(value);
    setCurrentPage(1);
  };

  const handleFilterCategoryChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterAuthor('all');
    setFilterCategory('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || filterAuthor !== 'all' || filterCategory !== 'all';

  // ─── CRUD Handlers ──────────────────────────────────────
  const resetForm = () => {
    setForm({
      title: '',
      author: '',
      isbn: '',
      category_id: '',
      totalCopies: 1,
      publisher: '',
      publication_year: new Date().getFullYear(),
    });
  };

  const handleSave = () => {
    if (!form.title || !form.author) {
      setAlert({ type: 'error', message: 'Judul dan Penulis wajib diisi.' });
      return;
    }
    if (!form.category_id) {
      setAlert({ type: 'error', message: 'Kategori wajib dipilih.' });
      return;
    }

    const bookData = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      category_id: Number(form.category_id),
      publication_year: form.publication_year,
      total_copies: form.totalCopies,
      publisher: form.publisher,
    };

    if (editBook) {
      updateBook(
        { id: editBook.id, ...bookData },
        {
          onSuccess: () => {
            setAlert({ type: 'success', message: 'Buku berhasil diperbarui.' });
            setOpenAddEdit(false);
            setEditBook(null);
            resetForm();
          },
          onError: (error) => {
            setAlert({ type: 'error', message: getErrorMessage(error) });
          },
        }
      );
    } else {
      createBook(bookData, {
        onSuccess: () => {
          setAlert({ type: 'success', message: 'Buku baru berhasil ditambahkan.' });
          setOpenAddEdit(false);
          resetForm();
        },
        onError: (error) => {
          setAlert({ type: 'error', message: getErrorMessage(error) });
        },
      });
    }
  };

  const handleEditClick = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category_id: String(book.category_id || ''),
      totalCopies: book.total_copies || 1,
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
    });
    setOpenAddEdit(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteBook) {
      deleteBookMutation(deleteBook.id, {
        onSuccess: () => {
          setAlert({ type: 'success', message: 'Buku berhasil dihapus.' });
          setDeleteBook(null);
        },
        onError: (error) => {
          setAlert({ type: 'error', message: getErrorMessage(error) });
        },
      });
    }
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="shadow-sm">
          <AlertDescription className="flex items-center justify-between">
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat data buku.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCw className="h-4 w-4 mr-1" /> Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📚</span> Catalog Buku
            {hasActiveFilters && (
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Filter aktif
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Temukan koleksi buku perpustakaan.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 gap-1">
              <X className="h-4 w-4" /> Hapus Filter
            </Button>
          )}
          {isAdminOrStaff && (
            <Button
              onClick={() => {
                setEditBook(null);
                resetForm();
                setOpenAddEdit(true);
              }}
              className="rounded-lg gap-2"
            >
              <Plus className="h-5 w-5" /> Tambah Buku
            </Button>
          )}
        </div>
      </div>

      {/* ─── SEARCH & FILTER BAR (SAMA UNTUK ADMIN & MEMBER) ─── */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari judul atau penulis..."
            className="pl-9 rounded-lg bg-gray-50 border-gray-200 h-10 w-full"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Dropdown Penulis (Searchable) */}
        <div className="min-w-[180px]">
          <SearchableSelect
            options={authorOptions}
            value={filterAuthor}
            onChange={handleFilterAuthorChange}
            placeholder={isLoadingAuthors ? 'Memuat penulis...' : 'Pilih Penulis'}
            searchPlaceholder="Cari penulis..."
            emptyText="Tidak ada penulis ditemukan"
            disabled={isLoadingAuthors}
          />
        </div>

        {/* Dropdown Kategori */}
        <div className="min-w-[160px]">
          <Select value={filterCategory} onValueChange={handleFilterCategoryChange}>
            <SelectTrigger className="w-full rounded-lg border-gray-200 h-10 bg-gray-50">
              <SelectValue placeholder={isLoadingCategories ? "Memuat kategori..." : "Kategori"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── BOOK LIST ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <BookEmptyState isAdminOrStaff={isAdminOrStaff} onAddFirst={() => { setEditBook(null); resetForm(); setOpenAddEdit(true); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book: Book) => (
            <div key={book.id} className="block group relative">
              <Link to={`/books/${book.id}`} className="block">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="h-48 bg-gradient-to-tr from-gray-50 to-gray-200 relative overflow-hidden flex items-center justify-center p-4">
                    {book.available_copies > 0 ? (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                        TERSEDIA
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                        DIPINJAM
                      </div>
                    )}
                    <div className="w-full h-full max-w-[120px] bg-white rounded shadow-md border border-gray-100 flex items-center justify-center relative z-0">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📖</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#0055FF] font-bold uppercase tracking-wider">{book.category?.name ?? 'UMUM'}</p>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#0055FF] transition-colors line-clamp-1 text-base">{book.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Stok: {book.available_copies}</span>
                      </div>
                      {/* ✅ Tombol Detail untuk SEMUA user (Admin & Member) */}
                      <Button size="sm" variant="outline" className="border-[#0055FF] text-[#0055FF] hover:bg-blue-50">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Detail
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Tombol Edit & Delete hanya untuk Admin/Staff */}
              {isAdminOrStaff && (
                <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(book); }}
                    className="p-1 text-gray-500 hover:text-primary-600 rounded"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteBook(book); }}
                    className="p-1 text-gray-500 hover:text-red-600 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── PAGINATION ─── */}
      {books.length > 0 && (
        <div className="flex items-center justify-between mt-8 text-sm text-gray-500">
          <span>
            Menampilkan {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, totalBooks)} dari {totalBooks} buku
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(lastPage, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === pageNum ? 'bg-[#0055FF] text-white font-medium' : 'border border-gray-200 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            {lastPage > 5 && (
              <>
                <span className="w-8 h-8 flex items-center justify-center">...</span>
                <button
                  onClick={() => setCurrentPage(lastPage)}
                  className={`w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50`}
                >
                  {lastPage}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === lastPage ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ───────────────────────────── */}
      <Dialog open={openAddEdit} onOpenChange={setOpenAddEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masukkan judul buku"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Penulis *</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Masukkan nama penulis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  placeholder="978-xxx-xxx-xxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select value={form.category_id} onValueChange={(value) => setForm({ ...form, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Memuat kategori..." : "Pilih kategori"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Memuat...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>Tidak ada kategori</SelectItem>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Penerbit</Label>
                <Input
                  id="publisher"
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="Nama penerbit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Tahun Terbit</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.publication_year}
                  onChange={(e) => setForm({ ...form, publication_year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copies">Total Eksemplar</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={form.totalCopies}
                  onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddEdit(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE MODAL ────────────────────────────────── */}
      <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Apakah Anda yakin ingin menghapus buku <strong>{deleteBook?.title}</strong>?
            <br />
            <span className="text-xs text-red-500">Tindakan ini tidak dapat dibatalkan.</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}