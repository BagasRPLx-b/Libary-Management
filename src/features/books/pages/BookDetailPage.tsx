import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BookOpen, Bookmark, Calendar, Hash, User, Building, Globe } from 'lucide-react';
import { useState } from 'react';

// Sample data buku dengan detail lengkap
const BOOKS_DETAIL = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Fiction',
    publisher: 'Scribner',
    year: 1925,
    pages: 180,
    language: 'English',
    available_copies: 3,
    total_copies: 5,
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0446310789',
    category: 'Fiction',
    publisher: 'J.B. Lippincott & Co.',
    year: 1960,
    pages: 281,
    language: 'English',
    available_copies: 0,
    total_copies: 4,
  },
];

type BookDetail = (typeof BOOKS_DETAIL)[number];

const getBookById = (id: number): BookDetail => {
  const book = BOOKS_DETAIL.find(b => b.id === id);
  if (book) return book;
  
  return {
    id,
    title: 'Unknown Book',
    author: 'Unknown Author',
    isbn: '-',
    category: '-',
    publisher: '-',
    year: 0,
    pages: 0,
    language: '-',
    available_copies: 0,
    total_copies: 0,
  };
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alert, setAlert] = useState<string | null>(null);

  const book = getBookById(Number(id));
  const isMember = user?.role === 'Member';

  const handleBorrow = () => {
    if (book.available_copies > 0) {
      setAlert('Buku berhasil dipinjam! Silakan ambil di perpustakaan.');
      setTimeout(() => setAlert(null), 3000);
    } else {
      setAlert('Maaf, buku sedang tidak tersedia.');
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/catalog')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Button>

      {alert && (
        <Alert>
          <AlertDescription>{alert}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{book.title}</CardTitle>
                <p className="text-gray-600 mt-1">by {book.author}</p>
              </div>
              <Badge variant={book.available_copies > 0 ? 'default' : 'destructive'}>
                {book.available_copies > 0 ? 'Tersedia' : 'Tidak Tersedia'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">ISBN:</span>
                <span className="font-medium">{book.isbn}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Penerbit:</span>
                <span className="font-medium">{book.publisher}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Tahun:</span>
                <span className="font-medium">{book.year}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Halaman:</span>
                <span className="font-medium">{book.pages}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Bahasa:</span>
                <span className="font-medium">{book.language}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bookmark className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Kategori:</span>
                <span className="font-medium">{book.category}</span>
              </div>
            </div>

            {isMember && (
              <div className="pt-4 border-t">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={book.available_copies === 0}
                  onClick={handleBorrow}
                >
                  {book.available_copies > 0 ? 'Pinjam Buku' : 'Tidak Tersedia'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Status Buku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{book.available_copies}</div>
              <p className="text-sm text-gray-500">Tersedia</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{book.total_copies}</div>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dipinjam</span>
                <span className="font-medium">{book.total_copies - book.available_copies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}