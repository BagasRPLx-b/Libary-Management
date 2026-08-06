// src/features/books/pages/CatalogPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, RotateCw, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
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

// ─── Skeleton ────────────────────────────────────────────
function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4 animate-pulse">
      <div className="h-44 bg-gray-100 rounded-lg" />
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState({ isAdminOrStaff, onAddFirst }: { isAdminOrStaff: boolean; onAddFirst: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <span className="text-6xl">📚</span>
      <h3 className="text-lg font-bold text-gray-800">Belum ada buku di katalog</h3>
      <p className="text-sm text-neutral-500">Mulai mengisi perpustakaan dengan menambahkan buku baru.</p>
      {isAdminOrStaff && (
        <Button onClick={onAddFirst} className="rounded-lg gap-2 mt-2">
          <Plus className="h-4 w-4" /> Tambah Buku Pertama
        </Button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function CatalogPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Ambil filter dari URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterAuthor, setFilterAuthor] = useState(searchParams.get('author') || 'all');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || 'all');

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
  const isMember = user?.role?.toLowerCase() === 'member';

  // Data dari API
  const { data: booksRaw, isLoading, isError, refetch } = useBooks({
    search: search || undefined,
    author: filterAuthor !== 'all' ? filterAuthor : undefined,
    category_id: filterCategory !== 'all' ? filterCategory : undefined,
  });

  const books = Array.isArray(booksRaw) ? booksRaw : [];

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
    if (search) params.set('search', search);
    if (filterAuthor && filterAuthor !== 'all') params.set('author', filterAuthor);
    if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory);
    setSearchParams(params, { replace: true });
  }, [search, filterAuthor, filterCategory, setSearchParams]);

  const clearFilters = () => {
    setSearch('');
    setFilterAuthor('all');
    setFilterCategory('all');
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
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📚</span> Catalog Buku
          {hasActiveFilters && (
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Filter aktif
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 gap-1">
              <X className="h-4 w-4" /> Hapus Filter
            </Button>
          )}
          {/* ✅ Tombol CRUD hanya untuk Admin/Staff */}
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

      {/* ─── SEARCH & FILTER BAR ─── */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari judul atau penulis..."
            className="pl-9 rounded-lg bg-gray-50 border-gray-200 h-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Searchable Dropdown Penulis */}
        <div className="min-w-[180px]">
          <SearchableSelect
            options={authorOptions}
            value={filterAuthor}
            onChange={setFilterAuthor}
            placeholder={isLoadingAuthors ? 'Memuat penulis...' : 'Pilih Penulis'}
            searchPlaceholder="Cari penulis..."
            emptyText="Tidak ada penulis ditemukan"
            disabled={isLoadingAuthors}
          />
        </div>

        {/* Dropdown Kategori */}
        <div className="min-w-[160px]">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
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
        <EmptyState isAdminOrStaff={isAdminOrStaff} onAddFirst={() => { setEditBook(null); resetForm(); setOpenAddEdit(true); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book: Book) => (
            <div key={book.id} className="block group relative">
              <Link to={`/books/${book.id}`} className="block">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center border-b border-gray-50">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📖</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-neutral-500 line-clamp-1">by {book.author}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full font-medium">
                        {book.category?.name ?? '-'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${book.available_copies > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {book.available_copies > 0 ? `${book.available_copies} tersedia` : 'Tidak tersedia'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              {/* ✅ Tombol Edit & Delete hanya untuk Admin/Staff */}
              {isAdminOrStaff && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100">
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