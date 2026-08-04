import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, BookOpen, Bookmark, Calendar, Hash, Building, Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useBook } from '../hooks/useBooks';
import { useIssueBook } from '@/features/loans/hooks/useCirculation';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alert, setAlert] = useState<string | null>(null);

  const { data: book, isLoading, isError, refetch } = useBook(Number(id));
  const { mutate: issueBook, isPending: isIssuing } = useIssueBook();
  const isMember = user?.role === 'Member';

  const handleBorrow = () => {
    if (!book) return;
    issueBook(
      { book_id: book.id },
      {
        onSuccess: () => {
          setAlert('Buku berhasil dipinjam!');
          setTimeout(() => setAlert(null), 3000);
        },
        onError: (error: any) => {
          setAlert(error.response?.data?.message || 'Gagal meminjam buku.');
          setTimeout(() => setAlert(null), 4000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat detail buku.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Coba Lagi</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">Buku tidak ditemukan</h2>
        <Button className="mt-4" onClick={() => navigate('/catalog')}>
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

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
            {book.description && (
              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">ISBN:</span>
                <span className="font-medium">{book.isbn || '-'}</span>
              </div>
              {book.publisher && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Penerbit:</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
              )}
              {book.year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Tahun:</span>
                  <span className="font-medium">{book.year}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Halaman:</span>
                  <span className="font-medium">{book.pages}</span>
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Bahasa:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Bookmark className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Kategori:</span>
                <span className="font-medium">{typeof book.category === 'string' ? book.category : book.category?.name ?? '-'}</span>
              </div>
            </div>

            {isMember && (
              <div className="pt-4 border-t">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={book.available_copies === 0 || isIssuing}
                  onClick={handleBorrow}
                >
                  {isIssuing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : book.available_copies > 0 ? (
                    'Pinjam Buku'
                  ) : (
                    'Tidak Tersedia'
                  )}
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
            {book.total_copies && (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{book.total_copies}</div>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            )}
            {book.total_copies && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dipinjam</span>
                  <span className="font-medium">{book.total_copies - book.available_copies}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}