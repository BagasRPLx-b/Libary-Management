import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { useProfile, useMyActiveLoans, useMyLoanHistory } from '../hooks/useProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile, refetch: refetchProfile } = useProfile();
  const { data: activeLoans = [], isLoading: isLoadingActive, isError: isErrorActive, refetch: refetchActive } = useMyActiveLoans();
  const { data: loanHistory = [], isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = useMyLoanHistory();

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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Informasi Profil Card */}
      <Card className="shadow-subtle-md border-gray-100 overflow-hidden bg-white">
        <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-400"></div>
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-4 text-center sm:text-left">
            {/* Avatar besar (80px) */}
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md relative z-10 flex-shrink-0 shadow-inner">
              {currentProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 pt-2 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {currentProfile?.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-none">{currentProfile?.email}</p>
              <p className="text-xs text-gray-400 font-bold tracking-wider">KODE ANGGOTA: {currentProfile?.code || '-'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Alamat Email</p>
                <p className="font-semibold text-gray-700">{currentProfile?.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nomor Telepon</p>
                <p className="font-semibold text-gray-700">{currentProfile?.phone || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Denda Card */}
      {totalFine > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm flex items-center gap-4 animate-pulse">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Total Denda ⚠️</p>
            <p className="text-xl font-black text-red-700">Rp {totalFine.toLocaleString('id-ID')}</p>
          </div>
        </div>
      )}

      {/* Peminjaman Aktif */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" /> Peminjaman Aktif
        </h2>
        
        {isErrorActive && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Gagal memuat peminjaman aktif.</span>
              <Button variant="outline" size="sm" onClick={() => refetchActive()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoadingActive ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 animate-pulse">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="text-center py-8 bg-white border border-gray-100 rounded-xl shadow-subtle-sm text-neutral-500 font-medium">
            Tidak ada peminjaman aktif.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="bg-white p-4 rounded-xl shadow-subtle-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-neutral-800 truncate">{loan.book?.title || 'Unknown Title'}</h4>
                  <p className="text-xs text-neutral-500">Pinjam: {formatDateString(loan.borrow_date)}</p>
                  <p className="text-xs text-neutral-500 font-semibold">Batas Kembali: {formatDateString(loan.due_date)}</p>
                </div>
                <Badge variant={loan.status === 'overdue' ? 'destructive' : 'default'} className="flex-shrink-0">
                  {loan.status === 'overdue' ? 'Terlambat' : 'Aktif'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Peminjaman */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" /> Riwayat Peminjaman
        </h2>

        {isErrorHistory && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Gagal memuat riwayat peminjaman.</span>
              <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoadingHistory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 animate-pulse">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : loanHistory.length === 0 ? (
          <div className="text-center py-8 bg-white border border-gray-100 rounded-xl shadow-subtle-sm text-neutral-500 font-medium">
            Belum ada riwayat peminjaman.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loanHistory.map((loan) => (
              <div key={loan.id} className="bg-white p-4 rounded-xl shadow-subtle-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-neutral-700 truncate">{loan.book?.title || 'Unknown Title'}</h4>
                  <p className="text-xs text-neutral-400">Pinjam: {formatDateString(loan.borrow_date)}</p>
                  <p className="text-xs text-neutral-400">Kembali: {formatDateString(loan.return_date)}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  Dikembalikan
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}