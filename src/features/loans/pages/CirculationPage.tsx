import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Barcode, ArrowRightLeft, Undo2, Book as BookIcon } from 'lucide-react';
import { useTodayTransactions, useIssueBook, useReturnBook } from '../hooks/useCirculation';
import apiClient from '@/lib/api/client';
import type { Book } from '@/features/books/hooks/useBooks';

export default function CirculationPage() {
  const [barcode, setBarcode] = useState('');
  const [mode, setMode] = useState<'issue' | 'return'>('issue');
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const { data: todayTransactions = [], isLoading: isLoadingTx } = useTodayTransactions();
  const { mutate: issueBook, isPending: isIssuing } = useIssueBook();
  const { mutate: returnBook, isPending: isReturning } = useReturnBook();

  const handleScan = async () => {
    if (!barcode.trim()) return;
    setIsScanning(true);
    setAlert(null);
    try {
      const response = await apiClient.get(`/books/scan/${barcode.trim()}`);
      const bookData = response.data?.data || response.data;
      setScannedBook(bookData);
      setAlert(`Buku ditemukan: ${bookData.title}`);
    } catch (error: any) {
      setScannedBook(null);
      setAlert(error.response?.data?.message || 'Buku tidak ditemukan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = () => {
    if (!scannedBook) return;
    if (mode === 'issue') {
      issueBook(
        { book_id: scannedBook.id },
        {
          onSuccess: () => {
            setAlert(`Buku "${scannedBook.title}" berhasil dipinjamkan.`);
            setScannedBook(null);
            setBarcode('');
          },
          onError: (error: any) => {
            setAlert(error.response?.data?.message || 'Gagal memproses peminjaman.');
          },
        }
      );
    } else {
      returnBook(
        { book_id: scannedBook.id },
        {
          onSuccess: () => {
            setAlert(`Buku "${scannedBook.title}" berhasil dikembalikan.`);
            setScannedBook(null);
            setBarcode('');
          },
          onError: (error: any) => {
            setAlert(error.response?.data?.message || 'Gagal memproses pengembalian.');
          },
        }
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kolom Kiri: Scan */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" /> Book Circulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={mode === 'issue' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setMode('issue')}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" /> ISSUE
            </Button>
            <Button
              variant={mode === 'return' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setMode('return')}
            >
              <Undo2 className="mr-2 h-4 w-4" /> RETURN
            </Button>
          </div>

          <div className="relative">
            <Input
              placeholder="Scan ISBN or enter barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="pl-9 py-6 text-lg"
            />
            <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <Button className="w-full" size="lg" onClick={handleScan} disabled={isScanning}>
            {isScanning ? 'Mencari...' : 'Cari Buku'}
          </Button>

          {scannedBook && (
            <Card className="mt-4 border-dashed">
              <CardContent className="pt-4 flex items-start gap-4">
                <BookIcon className="h-10 w-10 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-lg">{scannedBook.title}</p>
                  <p className="text-sm text-gray-600">by {scannedBook.author}</p>
                  <p className="text-sm text-gray-500">ISBN: {scannedBook.isbn || '-'}</p>
                  <Badge variant={scannedBook.available_copies > 0 ? 'default' : 'secondary'} className="mt-1">
                    {scannedBook.available_copies > 0 ? `${scannedBook.available_copies} Tersedia` : 'Tidak Tersedia'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {scannedBook && (
            <Button
              className="w-full"
              variant={mode === 'return' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={isIssuing || isReturning}
            >
              {isIssuing || isReturning
                ? 'Memproses...'
                : mode === 'issue'
                ? 'Konfirmasi Issue'
                : 'Konfirmasi Return'}
            </Button>
          )}

          {alert && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">{alert}</div>
          )}
        </CardContent>
      </Card>

      {/* Kolom Kanan: Today's Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTx ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : todayTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Belum ada transaksi hari ini.
                  </TableCell>
                </TableRow>
              ) : (
                todayTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.member}</TableCell>
                    <TableCell>{tx.book}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'Issue' ? 'default' : 'secondary'}>{tx.type}</Badge>
                    </TableCell>
                    <TableCell>{tx.time}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}