// src/features/members/pages/ProfilePage.tsx
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail, Phone, Clock, RefreshCw, MapPin, User, Shield, ChevronRight, BookOpen,
  DollarSign, Settings, Edit3, Key, Library, Calendar, CheckCircle,
  ArrowUpRight, Camera
} from 'lucide-react';
import MemberPageHeader from '@/components/layout/MemberPageHeader';
import { useProfile, useMyLoans } from '../hooks/useProfile';
import { formatRupiah, formatDateString } from '@/lib/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile, refetch: refetchProfile } = useProfile();
  const { data: myLoans = [], isLoading: isLoadingLoans, isError: isErrorLoans, refetch: refetchLoans } = useMyLoans();

  const activeLoans = myLoans.filter((loan: any) => loan.status === 'active' || loan.status === 'overdue');
  const loanHistory = myLoans.filter((loan: any) => loan.status === 'returned');

  const currentProfile = profile || user;

  const totalBorrowed = myLoans.length;
  const totalActiveLoans = activeLoans.length;
  
  const totalFine = myLoans.reduce((sum, loan) => {
    // Hanya loan yang sudah returned dan punya fine_amount
    if (loan.status === 'returned' && loan.fine_amount) {
      const fine = parseFloat(String(loan.fine_amount));
      return sum + (isNaN(fine) ? 0 : fine);
    }
    // ❌ JANGAN tambahkan estimated_fine dari loan overdue (belum final)
    return sum;
  }, 0);

  const recentHistory = loanHistory.slice(0, 5);

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
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Dipinjam</Badge>;
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
    <div className="max-w-6xl mx-auto space-y-6">
      <MemberPageHeader placeholder="Cari buku, penulis, atau koleksi..." />

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-[#0055FF]">Profil Anggota</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT COLUMN ─── */}
        <div className="lg:col-span-5 space-y-6">

          {/* User Profile Summary Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile?.name || 'U')}&background=0055FF&color=fff&size=200`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#0055FF] text-white p-2 rounded-full border-2 border-white shadow-sm hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{currentProfile?.name}</h2>
                  <Badge className="bg-blue-50 text-[#0055FF] border-transparent font-semibold text-[10px] px-1.5 py-0">
                    <CheckCircle className="w-3 h-3 mr-1 inline" /> Aktif
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">ID Anggota: {(currentProfile as any)?.member_code || 'LC-20240901'}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-[#0055FF] hover:bg-blue-700 text-white rounded-lg gap-2 shadow-sm font-semibold">
                <Edit3 className="h-4 w-4" /> Edit Profil
              </Button>
              <Button variant="outline" className="flex-1 rounded-lg gap-2 font-semibold text-[#0055FF] border-[#0055FF] hover:bg-blue-50">
                <Settings className="h-4 w-4" /> Pengaturan Akun
              </Button>
            </div>
          </div>

          {/* Informasi Pribadi Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Informasi Pribadi</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#0055FF]" /> {currentProfile?.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Nomor Telepon</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#0055FF]" /> {currentProfile?.phone || '-'}
                  </p>
                </div>
              </div>
              <div className="border-b border-gray-100 pb-5">
                <p className="text-xs font-semibold text-gray-500 mb-1">Alamat Tempat Tinggal</p>
                <p className="text-sm font-medium text-gray-900 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#0055FF] mt-0.5 flex-shrink-0" />
                  Jl. Pendidikan No. 42, Kel. Sarjana, Kec. Akademik, Kota Perpustakaan, Jawa Barat 40123
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Tanggal Bergabung</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#0055FF]" /> 15 Januari 2022
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Berlaku Hingga</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#0055FF]" /> 15 Januari 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0055FF] rounded-xl p-6 text-white relative overflow-hidden shadow-md">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Library className="w-32 h-32 -mr-8 -mb-8" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">Total Peminjaman</p>
                <p className="text-5xl font-bold mb-1">{totalBorrowed}</p>
                <p className="text-xs text-blue-200 font-medium">+12 bulan ini</p>
              </div>
            </div>

            {/* ✅ Denda Aktif - Menggunakan data dari API */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-100 relative overflow-hidden shadow-sm">
              <div className="absolute right-0 bottom-0 opacity-5">
                <DollarSign className="w-32 h-32 -mr-6 -mb-6 text-red-900" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Denda Aktif</p>
                  <p className={`text-4xl font-bold ${totalFine > 0 ? 'text-red-600' : 'text-gray-400'} mb-1`}>
                    {formatRupiah(totalFine)}
                  </p>
                </div>
                {totalFine > 0 && (
                  <Button variant="link" className="text-red-600 font-bold p-0 h-auto justify-start mt-2 hover:text-red-800">
                    Bayar Sekarang →
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EBF1FF] rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sedang Dipinjam</p>
                  <p className="text-4xl font-bold text-gray-900 mb-3">{totalActiveLoans}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {activeLoans.slice(0, 3).map((loan: any, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <img src={`https://picsum.photos/32/32?random=${loan.id || idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium ml-2">Lihat Detail</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <h3 className="text-base font-bold text-gray-900 mb-4">Preferensi Keamanan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Key className="h-4 w-4 text-[#0055FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Ubah Password</p>
                      <p className="text-[10px] text-gray-500 font-medium">Terakhir diubah 3 bulan lalu</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#0055FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">2FA Verification</p>
                      <p className="text-[10px] text-red-500 font-medium">Belum Aktif</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIWAYAT AKTIVITAS ─── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Riwayat Aktivitas Terakhir</h3>
          <Button variant="link" className="text-[#0055FF] font-semibold h-auto p-0">Lihat Semua</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Aktivitas</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Judul Buku / Keterangan</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Tanggal</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Belum ada aktivitas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentHistory.map((loan) => {
                  const dateStr = getLoanDate(loan);

                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className={loan.status === 'returned' ? 'text-[#0055FF]' : 'text-[#0055FF]'}>
                          {loan.status === 'returned' ? <ArrowUpRight className="h-4 w-4 rotate-180" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-gray-700">
                          {loan.status === 'returned' ? 'Pengembalian' : 'Peminjaman'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {loan.book?.title || '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {formatDateString(dateStr)}
                      </td>
                      <td className="py-4 px-6">
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
    </div>
  );
}