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
import { Search, BookOpen, Pencil, Trash2 } from 'lucide-react';

// Sample data buku
const SAMPLE_BOOKS = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction', available_copies: 3 },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0446310789', category: 'Fiction', available_copies: 0 },
  { id: 3, title: '1984', author: 'George Orwell', isbn: '978-0451524935', category: 'Dystopian', available_copies: 5 },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', category: 'Romance', available_copies: 2 },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769488', category: 'Fiction', available_copies: 1 },
  { id: 6, title: 'Moby Dick', author: 'Herman Melville', isbn: '978-0142437247', category: 'Adventure', available_copies: 0 },
  { id: 7, title: 'War and Peace', author: 'Leo Tolstoy', isbn: '978-0199232765', category: 'Historical', available_copies: 4 },
  { id: 8, title: 'Hamlet', author: 'William Shakespeare', isbn: '978-0743477123', category: 'Drama', available_copies: 2 },
  { id: 9, title: 'The Odyssey', author: 'Homer', isbn: '978-0140268867', category: 'Epic', available_copies: 0 },
  { id: 10, title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '978-0486415871', category: 'Psychological', available_copies: 3 },
];

type Book = (typeof SAMPLE_BOOKS)[number];

function BookCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <BookOpen className="h-16 w-16 mb-4" />
      <p className="text-lg font-medium">Tidak ada buku ditemukan</p>
      <p className="text-sm">Coba sesuaikan pencarian atau filter Anda.</p>
    </div>
  );
}

export default function CatalogPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [isLoading, setIsLoading] = useState(false);

  // Untuk Admin/Staff, state lokal untuk search & filter
  const [search, setSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // State modal tambah/edit
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });

  // State hapus
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isMember = user?.role === 'Member';

  // Filter data
  let filteredBooks = books;

  if (isMember) {
    const searchFromUrl = searchParams.get('search') || '';
    const authorFromUrl = searchParams.get('author') || 'all';
    const categoryFromUrl = searchParams.get('category') || 'all';
    
    filteredBooks = books.filter((book) => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchFromUrl.toLowerCase()) ||
        book.author.toLowerCase().includes(searchFromUrl.toLowerCase());
      const matchesAuthor = authorFromUrl === 'all' || book.author === authorFromUrl;
      const matchesCategory = categoryFromUrl === 'all' || book.category === categoryFromUrl;
      return matchesSearch && matchesAuthor && matchesCategory;
    });
  } else {
    filteredBooks = books.filter((book) => {
      const matchesSearch = 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesAuthor = filterAuthor === 'all' || book.author === filterAuthor;
      const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
      return matchesSearch && matchesAuthor && matchesCategory;
    });
  }

  const uniqueAuthors = [...new Set(books.map((b) => b.author))];
  const uniqueCategories = [...new Set(books.map((b) => b.category))];

  const handleSave = () => {
    if (!form.title || !form.author) {
      setAlert({ type: 'error', message: 'Judul dan Penulis wajib diisi.' });
      return;
    }
    if (editBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editBook.id
            ? { 
                ...b, 
                title: form.title, 
                author: form.author, 
                isbn: form.isbn, 
                category: form.category, 
                available_copies: form.totalCopies 
              }
            : b
        )
      );
      setAlert({ type: 'success', message: 'Buku berhasil diperbarui.' });
    } else {
      const newId = Math.max(...books.map((b) => b.id), 0) + 1;
      const newBook: Book = {
        id: newId,
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        category: form.category,
        available_copies: form.totalCopies,
      };
      setBooks([...books, newBook]);
      setAlert({ type: 'success', message: 'Buku baru berhasil ditambahkan.' });
    }
    setOpenAddEdit(false);
    setEditBook(null);
    setForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleEditClick = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.available_copies,
    });
    setOpenAddEdit(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteBook) {
      setBooks((prev) => prev.filter((b) => b.id !== deleteBook.id));
      setAlert({ type: 'success', message: 'Buku berhasil dihapus.' });
      setDeleteBook(null);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Dashboard Summary - Hanya untuk Admin/Staff */}
      {!isMember && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter & Search + Tombol Tambah - Hanya untuk Admin/Staff */}
      {!isMember && (
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or author..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdminOrStaff && (
            <Button
              onClick={() => {
                setEditBook(null);
                setForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1 });
                setOpenAddEdit(true);
              }}
            >
              + Tambah Buku
            </Button>
          )}
        </div>
      )}

      {/* Grid Buku */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full">
            <EmptyState />
          </div>
        ) : (
          filteredBooks.map((book) => (
            <Link to={`/books/${book.id}`} key={book.id}>
              <Card className="flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer">
                {isAdminOrStaff && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditClick(book);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteBook(book);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600">✍️ {book.author}</p>
                  <p className="text-xs text-gray-400 mt-1">📂 {book.category}</p>
                </CardContent>
                <CardFooter>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      book.available_copies > 0 
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' 
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${book.available_copies > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {book.available_copies > 0 
                      ? `${book.available_copies} tersedia` 
                      : 'Tidak tersedia'}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Dialog open={openAddEdit} onOpenChange={setOpenAddEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Penulis</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
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
              <Label htmlFor="copies">Total Copies</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddEdit(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Apakah Anda yakin ingin menghapus buku <strong>{deleteBook?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}