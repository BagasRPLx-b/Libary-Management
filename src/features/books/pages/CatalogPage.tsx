// src/features/books/pages/CatalogPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, RotateCw, X } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  useBooks,
  useCategories,
  useAuthors,
  type Book,
} from '@/features/books/hooks/useBooks';

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
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <span className="text-6xl">📚</span>
      <h3 className="text-lg font-bold text-gray-800">Tidak ada buku ditemukan</h3>
      <p className="text-sm text-neutral-500">Coba ubah kata kunci atau filter pencarian</p>
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

  // ─── Convert ke format option untuk SearchableSelect ──
  const authorOptions = [
    { value: 'all', label: 'Semua Penulis' },
    ...authors.map((author) => ({
      value: author,
      label: author,
    })),
  ];

  const isMember = user?.role === 'Member';

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

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📚</span> Catalog Buku
          {hasActiveFilters && (
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Filter aktif
            </span>
          )}
        </h1>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 gap-1">
            <X className="h-4 w-4" /> Hapus Filter
          </Button>
        )}
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

        {/* 👇 Searchable Dropdown Penulis (BANYAK) */}
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

        {/* 👇 Dropdown Kategori (Select Biasa - SEDIKIT) */}
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
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book: Book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="block group">
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
          ))}
        </div>
      )}
    </div>
  );
}