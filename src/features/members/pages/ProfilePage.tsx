// src/features/members/pages/ProfilePage.tsx
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Phone,
  Clock,
  RefreshCw,
  MapPin,
  User,
  Shield,
  ChevronRight,
  BookOpen,
  DollarSign,
  Settings,
  Edit3,
  Key,
  Smartphone,
  Library,
  Calendar,
  CheckCircle,
  AlertCircle,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useProfile, useMyLoans } from '../hooks/useProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile, refetch: refetchProfile } = useProfile();
  const { data: myLoans = [], isLoading: isLoadingLoans, isError: isErrorLoans, refetch: refetchLoans } = useMyLoans();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const activeLoans = myLoans.filter((loan: any) => loan.status === 'active' || loan.status === 'overdue');
  const loanHistory = myLoans.filter((loan: any) => loan.status === 'returned');

  const currentProfile = profile || user;

  const totalBorrowed = loanHistory.length + activeLoans.length;
  const totalActiveLoans = activeLoans.length;
  
  const totalFine = activeLoans.reduce((sum, loan) => {
    if (loan.fine_amount) return sum + parseFloat(loan.fine_amount);
    if (loan.status === 'overdue' && loan.due_date) {
      const daysOverdue = Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, daysOverdue * 1000);
    }
    return sum;
  }, 0);

  const recentHistory = loanHistory.slice(0, 5);

  const formatDateString = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  const getLoanDate = (loan: any): string | null => {
    return loan.returned_at || 
           loan.return_date || 
           loan.borrowed_at || 
           loan.borrow_date || 
           loan.created_at || 
           loan.date || 
           loan.updated_at || 
           null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Aktif</Badge>;
      case 'returned':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Dikembalikan</Badge>;
      case 'overdue':
        return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // ─── Loading State ────────────────────────────────────────
  if (isLoadingProfile || isLoadingLoans) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────
  if (isErrorProfile || isErrorLoans) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">Gagal memuat data profil. Silakan coba lagi.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                refetchProfile();
                refetchLoans();
              }}
              className="border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar dengan gradient */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#C9A84C] p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#FF6B00]">
                {currentProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProfile?.name}
              </h1>
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20 font-medium text-xs">
                Anggota Aktif
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {currentProfile?.email}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {(currentProfile as any)?.member_code || 'ID Tidak Tersedia'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
            <Settings className="h-4 w-4" />
            Pengaturan
          </Button>
        </div>
      </div>

      {/* ─── STATISTICS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6B00]/20 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Peminjaman</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalBorrowed}</p>
              <p className="text-xs text-gray-400 mt-0.5">buku</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Library className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6B00]/20 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sedang Dipinjam</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalActiveLoans}</p>
              <p className="text-xs text-gray-400 mt-0.5">buku aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-2xl p-6 border ${totalFine > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'} hover:shadow-lg transition-all duration-300 group`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Denda</p>
              <p className={`text-3xl font-bold mt-1 ${totalFine > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatRupiah(totalFine)}
              </p>
              {totalFine > 0 && (
                <Button variant="link" className="text-xs text-red-600 p-0 h-auto mt-0.5 font-semibold hover:text-red-700">
                  Bayar sekarang →
                </Button>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${totalFine > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
              <DollarSign className={`h-6 w-6 ${totalFine > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── DETAIL & SECURITY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Anggota */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-[#FF6B00]" />
            </div>
            Informasi Anggota
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{currentProfile?.email || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Telepon</span>
              <span className="text-sm font-medium text-gray-900">{currentProfile?.phone || '-'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Alamat</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                Jl. Pendidikan No. 42, Jakarta
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Bergabung</span>
              <span className="text-sm font-medium text-gray-900">15 Januari 2022</span>
            </div>
          </div>
        </div>

        {/* Keamanan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-[#FF6B00]" />
            </div>
            Keamanan & Preferensi
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Key className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Ubah Password</p>
                  <p className="text-xs text-gray-400">Terakhir diubah 3 bulan lalu</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6B00] transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Verifikasi 2 Langkah</p>
                  <p className="text-xs text-gray-400">Belum diaktifkan</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6B00] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── RIWAYAT AKTIVITAS ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
            </div>
            Riwayat Aktivitas Terakhir
          </h3>
          {loanHistory.length > 5 && (
            <Button variant="ghost" size="sm" className="text-xs text-[#FF6B00] hover:text-[#FF8A3D] font-medium">
              Lihat Semua
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Aktivitas</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Buku</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400">Belum ada aktivitas peminjaman</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentHistory.map((loan) => {
                  const dateStr = getLoanDate(loan);
                  
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="text-sm font-medium text-gray-900">
                          {loan.status === 'returned' ? 'Pengembalian' : 'Peminjaman'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm text-gray-600">{loan.book?.title || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-gray-400">
                          {formatDateString(dateStr)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {getStatusBadge(loan.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MEMBERSHIP BADGE ─── */}
      <div className="bg-gradient-to-r from-[#FF6B00]/5 to-[#C9A84C]/5 rounded-2xl p-5 border border-[#FF6B00]/10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Anggota Premium</p>
            <p className="text-xs text-gray-500">Akses penuh ke semua koleksi digital</p>
          </div>
        </div>
        <Badge className="bg-[#FF6B00] text-white border-0 px-4 py-1.5 text-xs font-semibold">
          Aktif Sampai 2026
        </Badge>
      </div>
    </div>
  );
}