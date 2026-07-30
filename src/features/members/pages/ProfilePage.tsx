import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useProfile, useMyActiveLoans, useMyLoanHistory } from '../hooks/useProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: activeLoans = [], isLoading: isLoadingActive } = useMyActiveLoans();
  const { data: loanHistory = [], isLoading: isLoadingHistory } = useMyLoanHistory();

  const currentProfile = profile || user;

  const totalFine = activeLoans.reduce((sum, loan) => {
    if (loan.fine_amount) return sum + loan.fine_amount;
    if (loan.status === 'overdue' && loan.due_date) {
      const daysOverdue = Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, daysOverdue * 1000);
    }
    return sum;
  }, 0);

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

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
                {isLoadingProfile ? <Skeleton className="h-5 w-32 mt-1" /> : <p className="font-medium">{currentProfile?.name || '-'}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                {isLoadingProfile ? <Skeleton className="h-5 w-40 mt-1" /> : <p className="font-medium">{currentProfile?.email || '-'}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                {isLoadingProfile ? <Skeleton className="h-5 w-28 mt-1" /> : <p className="font-medium">{currentProfile?.phone || '-'}</p>}
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
              {isLoadingActive ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : activeLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Tidak ada peminjaman aktif.
                  </TableCell>
                </TableRow>
              ) : (
                activeLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.book?.title || 'Unknown Title'}</TableCell>
                    <TableCell>{formatDateString(loan.borrow_date)}</TableCell>
                    <TableCell>{formatDateString(loan.due_date)}</TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'overdue' ? 'destructive' : 'default'}>
                        {loan.status === 'overdue' ? 'Terlambat' : 'Aktif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
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
              {isLoadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : loanHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                    Belum ada riwayat peminjaman.
                  </TableCell>
                </TableRow>
              ) : (
                loanHistory.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.book?.title || 'Unknown Title'}</TableCell>
                    <TableCell>{formatDateString(loan.borrow_date)}</TableCell>
                    <TableCell>{formatDateString(loan.return_date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Dikembalikan</Badge>
                    </TableCell>
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