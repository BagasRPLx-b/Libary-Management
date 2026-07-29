import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Barcode, ArrowRightLeft, Undo2, Book } from 'lucide-react';

const SAMPLE_BOOK = {
  id: 1,
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0743273565',
  status: 'Available',
};

const TODAY_TRANSACTIONS = [
  { id: 1, member: 'John Doe', book: 'The Great Gatsby', type: 'Issue', time: '09:15 AM' },
  { id: 2, member: 'Jane Smith', book: '1984', type: 'Return', time: '10:22 AM' },
  { id: 3, member: 'Robert Brown', book: 'To Kill a Mockingbird', type: 'Issue', time: '11:05 AM' },
  { id: 4, member: 'Emily Davis', book: 'Pride and Prejudice', type: 'Issue', time: '01:30 PM' },
  { id: 5, member: 'Michael Wilson', book: 'Moby Dick', type: 'Return', time: '02:45 PM' },
];

export default function CirculationPage() {
  const [barcode, setBarcode] = useState('');
  const [mode, setMode] = useState<'issue' | 'return'>('issue');
  const [scannedBook, setScannedBook] = useState<typeof SAMPLE_BOOK | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  const handleScan = () => {
    if (!barcode.trim()) return;
    setScannedBook(SAMPLE_BOOK);
    setAlert(`Buku ditemukan: ${SAMPLE_BOOK.title} (${SAMPLE_BOOK.status})`);
  };

  const handleAction = () => {
    if (!scannedBook) return;
    if (mode === 'issue') {
      setAlert(`Buku "${scannedBook.title}" berhasil dipinjamkan.`);
    } else {
      setAlert(`Buku "${scannedBook.title}" berhasil dikembalikan.`);
    }
    setScannedBook(null);
    setBarcode('');
    setTimeout(() => setAlert(null), 3000);
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

          <Button className="w-full" size="lg" onClick={handleScan}>
            Cari Buku
          </Button>

          {scannedBook && (
            <Card className="mt-4 border-dashed">
              <CardContent className="pt-4 flex items-start gap-4">
                <Book className="h-10 w-10 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-lg">{scannedBook.title}</p>
                  <p className="text-sm text-gray-600">by {scannedBook.author}</p>
                  <p className="text-sm text-gray-500">ISBN: {scannedBook.isbn}</p>
                  <Badge variant={scannedBook.status === 'Available' ? 'default' : 'secondary'} className="mt-1">
                    {scannedBook.status}
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
            >
              {mode === 'issue' ? 'Konfirmasi Issue' : 'Konfirmasi Return'}
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
              {TODAY_TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.member}</TableCell>
                  <TableCell>{tx.book}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'Issue' ? 'default' : 'secondary'}>{tx.type}</Badge>
                  </TableCell>
                  <TableCell>{tx.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}