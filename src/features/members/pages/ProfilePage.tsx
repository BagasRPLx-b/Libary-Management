// src/features/members/pages/ProfilePage.tsx
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Phone, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  MapPin, 
  Calendar,
  User,
  Shield,
  Lock,
  ChevronRight,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useProfile, useMyActiveLoans, useMyLoanHistory } from '../hooks/useProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile, refetch: refetchProfile } = useProfile();
  const { data: activeLoans = [], isLoading: isLoadingActive, isError: isErrorActive, refetch: refetchActive } = useMyActiveLoans();
  const { data: loanHistory = [], isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = useMyLoanHistory();

  const currentProfile = profile || user;

  // Hitung statistik
  const totalBorrowed = loanHistory.length + activeLoans.length;
  const totalActiveLoans = activeLoans.length;
  
  // Hitung total denda
  const totalFine = activeLoans.reduce((sum, loan) => {
    if (loan.fine_amount) return sum + loan.fine_amount;
    if (loan.status === 'overdue' && loan.due_date) {
      const daysOverdue = Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, daysOverdue * 1000);
    }
    return sum;
  }, 0);

  // Ambil 5 riwayat terakhir
  const recentHistory = loanHistory.slice(0, 5);

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm');
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Dipinjam</Badge>;
      case 'returned':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Berhasil</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Belum Lunas</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Header Profil */}
      <Card className="shadow-sm border-gray-100 overflow-hidden bg-white">
        <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-400"></div>
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md relative z-10 flex-shrink-0 shadow-inner">
              {currentProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 pt-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {currentProfile?.name}
                </h1>
                <Badge className="bg-green-100 text-green-700 border-0 font-semibold text-xs">
                  ✅ Aktif
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-medium">ID Anggota: {currentProfile?.member_code || '-'}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {currentProfile?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> {currentProfile?.phone || '-'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-sm gap-1">
                <User className="h-3.5 w-3.5" /> Edit Profil
              </Button>
              <Button variant="outline" size="sm" className="text-sm gap-1">
                <Shield className="h-3.5 w-3.5" /> Pengaturan Akun
              </Button>
            </div>
          </div>

          {/* Informasi Pribadi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Informasi Pribadi</p>
              <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {currentProfile?.email || '-'}</p>
              <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {currentProfile?.phone || '-'}</p>
              <p className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /> Jl. Pendidikan No. 42, Kel. Sarjana, Kec. Akademik</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Keanggotaan</p>
              <p className="text-sm flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-gray-400" /> Bergabung: 15 Januari 2022</p>
              <p className="text-sm flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-gray-400" /> Berlaku Hingga: 15 Januari 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Peminjaman</p>
                <p className="text-2xl font-bold text-gray-900">{totalBorrowed}</p>
                <p className="text-xs text-green-600">+12 bulan ini</p>
              </div>
              <div className="p-2.5 bg-primary-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-gray-100 ${totalFine > 0 ? 'bg-red-50/50' : 'bg-white'}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Denda Aktif</p>
                <p className={`text-2xl font-bold ${totalFine > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  Rp {totalFine.toLocaleString('id-ID')}
                </p>
                {totalFine > 0 && (
                  <Button variant="link" className="text-xs text-red-600 p-0 h-auto font-semibold">
                    Bayar Sekarang →
                  </Button>
                )}
              </div>
              <div className={`p-2.5 rounded-lg ${totalFine > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <DollarSign className={`h-5 w-5 ${totalFine > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sedang Dipinjam</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveLoans}</p>
                <Button variant="link" className="text-xs text-primary-600 p-0 h-auto font-semibold">
                  Lihat Detail →
                </Button>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferensi Keamanan */}
      <Card className="shadow-sm border-gray-100 bg-white">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" /> Preferensi Keamanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Ubah Password</p>
                <p className="text-xs text-gray-400">Terakhir diubah 3 bulan lalu</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">2FA Verification</p>
                <p className="text-xs text-gray-400">Belum Aktif</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Aktivitas Terakhir */}
      <Card className="shadow-sm border-gray-100 bg-white">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" /> Riwayat Aktivitas Terakhir
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktivitas</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Judul Buku / Keterangan</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-2"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-2"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-2"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    </tr>
                  ))
                ) : recentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">Belum ada aktivitas</td>
                  </tr>
                ) : (
                  recentHistory.map((loan) => (
                    <tr key={loan.id} className="border-b border-gray-50">
                      <td className="py-2.5 font-medium text-gray-700">
                        {loan.status === 'returned' ? 'Pengembalian' : loan.status === 'active' ? 'Peminjaman' : 'Denda Terlambat'}
                      </td>
                      <td className="py-2.5 text-gray-600">{loan.book?.title || '-'}</td>
                      <td className="py-2.5 text-gray-400 text-xs">
                        {formatDateString(loan.borrow_date || loan.return_date)}
                      </td>
                      <td className="py-2.5">{getStatusBadge(loan.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}