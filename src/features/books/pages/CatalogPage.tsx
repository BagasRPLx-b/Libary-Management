import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Pencil, Trash2, LayoutGrid, List, Plus } from 'lucide-react';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook, type Book } from '@/features/books/hooks/useBooks';

function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4 animate-pulse">
      {/* Cover placeholder */}
      <div className="h-44 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isAdminOrStaff, onAddFirst }: { isAdminOrStaff: boolean; onAddFirst: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <span className="text-6xl animate-bounce-slow">📚</span>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-800">Belum ada buku di katalog</h3>
        <p className="text-sm text-neutral-500">Mulai mengisi perpustakaan dengan menambahkan buku baru.</p>
      </div>
      {isAdminOrStaff && (
        <Button onClick={onAddFirst} className="rounded-lg gap-2 mt-2">
          <Plus className="h-4 w-4" /> Tambah Buku Pertama
        </Button>
      )}
    </div>
  );
}

export default function CatalogPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    publisher: '',
    year: new Date().getFullYear(),
    pages: 0,
    language: 'Indonesia',
    description: '',
  });

  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isMember = user?.role === 'Member';

  const queryParams = isMember
    ? {
        search: searchParams.get('search') || undefined,
        author: searchParams.get('author') || undefined,
        category: searchParams.get('category') || undefined,
      }
    : {
        search: search || undefined,
        author: filterAuthor !== 'all' ? filterAuthor : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
      };

  const { data: books = [], isLoading, isError, refetch } = useBooks(queryParams);
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBookMutation } = useDeleteBook();

  // Fix tipe data
  const uniqueAuthors: string[] = [...new Set(books.map((b: Book) => b.author).filter(Boolean))];
  const uniqueCategories: string[] = [...new Set(books.map((b: Book) => (typeof b.category === 'string' ? b.category : b.category?.name)).filter(Boolean))];

  const handleSave = () => {
    if (!form.title || !form.author) {
      setAlert({ type: 'error', message: 'Judul dan Penulis wajib diisi.' });
      return;
    }

    const bookData = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      category: form.category,
      available_copies: form.totalCopies,
      total_copies: form.totalCopies,
      publisher: form.publisher,
      year: form.year,
      pages: form.pages,
      language: form.language,
      description: form.description,
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
          onError: (error: any) => {
            setAlert({ type: 'error', message: error.response?.data?.message || 'Gagal memperbarui buku.' });
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
        onError: (error: any) => {
          setAlert({ type: 'error', message: error.response?.data?.message || 'Gagal menambahkan buku.' });
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
      category: typeof book.category === 'string' ? book.category : book.category?.name || '',
      totalCopies: book.available_copies,
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      pages: book.pages || 0,
      language: book.language || 'Indonesia',
      description: book.description || '',
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
        onError: (error: any) => {
          setAlert({ type: 'error', message: error.response?.data?.message || 'Gagal menghapus buku.' });
        },
      });
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: 1,
      publisher: '',
      year: new Date().getFullYear(),
      pages: 0,
      language: 'Indonesia',
      description: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="shadow-sm">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat data buku.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Coba Lagi</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>📚</span> Catalog Buku
        </h1>
        {isAdminOrStaff && (
          <Button onClick={() => { setEditBook(null); resetForm(); setOpenAddEdit(true); }} className="rounded-lg gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm transition-all duration-200">
            <Plus className="h-5 w-5" />
            Tambah Buku
          </Button>
        )}
      </div>

      {/* Dashboard Stats for Admin/Staff */}
      {!isMember && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-subtle-sm border-gray-100 hover:shadow-subtle-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-500">Total Buku</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary-600">{books.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-subtle-sm border-gray-100 hover:shadow-subtle-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-500">Total Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-neutral-800">-</div>
            </CardContent>
          </Card>
          <Card className="shadow-subtle-sm border-gray-100 hover:shadow-subtle-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-500">Peminjaman Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-neutral-800">-</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar for Staff/Admin */}
      {!isMember && (
        <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-subtle-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari judul atau penulis..."
                className="pl-9 rounded-full bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="w-[180px] rounded-lg border-gray-200 bg-white">
                <SelectValue placeholder="Penulis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Penulis</SelectItem>
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] rounded-lg border-gray-200 bg-white">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Book Grid / List Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <EmptyState isAdminOrStaff={isAdminOrStaff} onAddFirst={() => { setEditBook(null); resetForm(); setOpenAddEdit(true); }} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book: Book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="block group">
              <div className="bg-white rounded-xl shadow-subtle-sm border border-gray-100 hover:shadow-subtle-md hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col h-full">
                {isAdminOrStaff && (
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(book); }} 
                      className="p-1 text-gray-500 hover:text-primary-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteBook(book); }} 
                      className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* Cover Image / Placeholder */}
                <div className="h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center border-b border-gray-50 flex-shrink-0">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📖</span>
                </div>
                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors line-clamp-1 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-1">by {book.author}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full font-medium">
                      {typeof book.category === 'string' ? book.category : book.category?.name ?? '-'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${book.available_copies > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {book.available_copies > 0 ? `${book.available_copies} tersedia` : 'Tidak tersedia'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // List Mode
        <div className="space-y-4">
          {books.map((book: Book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="block group">
              <div className="bg-white rounded-xl shadow-subtle-sm border border-gray-100 hover:shadow-subtle-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row relative">
                {isAdminOrStaff && (
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(book); }} 
                      className="p-1.5 text-gray-500 hover:text-primary-600 bg-gray-50 hover:bg-white rounded-lg border border-gray-100 shadow-sm transition-all"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteBook(book); }} 
                      className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-white rounded-lg border border-gray-100 shadow-sm transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/* Left Cover block */}
                <div className="w-full sm:w-28 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 flex-shrink-0">
                  <span className="text-3xl group-hover:scale-115 transition-transform duration-300">📖</span>
                </div>
                {/* Right content */}
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="font-semibold text-base text-neutral-800 group-hover:text-primary-600 transition-colors leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-sm text-neutral-500">by {book.author}</p>
                    <p className="text-xs text-neutral-400">ISBN: {book.isbn || '-'}</p>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-start gap-2 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                      {typeof book.category === 'string' ? book.category : book.category?.name ?? '-'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${book.available_copies > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {book.available_copies > 0 ? `${book.available_copies} tersedia` : 'Tidak tersedia'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={openAddEdit} onOpenChange={setOpenAddEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul *</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Penulis *</Label>
                <Input id="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Dystopian">Dystopian</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Historical">Historical</SelectItem>
                    <SelectItem value="Drama">Drama</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Psychological">Psychological</SelectItem>
                    <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                    <SelectItem value="Horror">Horror</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Penerbit</Label>
                <Input id="publisher" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Halaman</Label>
                <Input id="pages" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Bahasa</Label>
                <Input id="language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copies">Total Copies</Label>
                <Input id="copies" type="number" min="1" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea id="description" className="w-full min-h-[100px] px-3 py-2 border rounded-md" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

      {/* Delete Dialog */}
      <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="py-4">Apakah Anda yakin ingin menghapus buku <strong>{deleteBook?.title}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}