import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Mail, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

// Sample data peminjaman
const ACTIVE_LOANS = [
  { id: 1, book: 'The Great Gatsby', borrowDate: new Date('2025-03-01'), dueDate: new Date('2025-03-15'), status: 'active' },
  { id: 2, book: '1984', borrowDate: new Date('2025-02-20'), dueDate: new Date('2025-03-06'), status: 'overdue' },
];

const LOAN_HISTORY = [
  { id: 3, book: 'Pride and Prejudice', borrowDate: new Date('2025-01-10'), returnDate: new Date('2025-01-24'), status: 'returned' },
  { id: 4, book: 'Hamlet', borrowDate: new Date('2024-12-05'), returnDate: new Date('2024-12-19'), status: 'returned' },
  { id: 5, book: 'Moby Dick', borrowDate: new Date('2024-11-15'), returnDate: new Date('2024-11-29'), status: 'returned' },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const totalFine = ACTIVE_LOANS
    .filter(loan => loan.status === 'overdue')
    .reduce((sum, loan) => {
      const daysOverdue = Math.ceil((new Date().getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + (daysOverdue * 1000); // 1000 per hari
    }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Informasi Profil */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{user?.name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">081234567890</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </div>

          {/* Total Denda */}
          {totalFine > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Total Denda</p>
                  <p className="text-lg font-bold text-red-700">Rp {totalFine.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peminjaman Aktif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peminjaman Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buku</TableHead>
                <TableHead>Tanggal Pinjam</TableHead>
                <TableHead>Batas Kembali</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVE_LOANS.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.book}</TableCell>
                  <TableCell>{format(loan.borrowDate, 'dd MMM yyyy')}</TableCell>
                  <TableCell>{format(loan.dueDate, 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={loan.status === 'overdue' ? 'destructive' : 'default'}>
                      {loan.status === 'overdue' ? 'Terlambat' : 'Aktif'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {ACTIVE_LOANS.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Tidak ada peminjaman aktif.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Riwayat Peminjaman */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Riwayat Peminjaman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buku</TableHead>
                <TableHead>Tanggal Pinjam</TableHead>
                <TableHead>Tanggal Kembali</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOAN_HISTORY.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.book}</TableCell>
                  <TableCell>{format(loan.borrowDate, 'dd MMM yyyy')}</TableCell>
                  <TableCell>{loan.returnDate ? format(loan.returnDate, 'dd MMM yyyy') : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Dikembalikan</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {LOAN_HISTORY.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Belum ada riwayat peminjaman.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}