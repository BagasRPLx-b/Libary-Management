// src/features/members/pages/MemberLoansPage.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Library,
  BookMarked,
  Hourglass
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useMyActiveLoans, useMyLoanHistory } from '../hooks/useProfile';
import { Progress } from '@/components/ui/progress';

// ─── Types ────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author?: string;
  category?: string;
}

interface Loan {
  id: number;
  book: Book;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'active' | 'returned' | 'overdue';
  fine_amount: number;
}

export default function MemberLoansPage() {
  const { data: activeLoans = [], isLoading: isLoadingActive, isError: isErrorActive, refetch: refetchActive } = useMyActiveLoans();
  const { data: loanHistory = [], isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = useMyLoanHistory();

  const totalActive = activeLoans.length;
  const maxLoans = 5;
  const loanLimit = totalActive;

  // ─── Format tanggal ──────────────────────────────────────
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  // ─── Cari tanggal ────────────────────────────────────────
  const getLoanDate = (loan: any, type: 'borrow' | 'return'): string | null => {
    if (type === 'borrow') {
      return loan.borrowed_at || loan.borrow_date || loan.created_at || null;
    }
    if (type === 'return') {
      return loan.returned_at || loan.return_date || null;
    }
    return null;
  };

  const getDaysLeft = (dueDate?: string) => {
    if (!dueDate) return 0;
    try {
      const due = parseISO(dueDate);
      const now = new Date();
      return differenceInDays(due, now);
    } catch {
      return 0;
    }
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = status === 'overdue' || (status === 'active' && getDaysLeft(dueDate) < 0);
    
    if (isOverdue) {
      return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">⚠️ Terlambat</Badge>;
    }
    if (status === 'returned') {
      return <Badge className="bg-gray-50 text-gray-600 border-gray-200 font-medium">✅ Selesai</Badge>;
    }
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">📖 Dipinjam</Badge>;
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Peminjaman Saya</h1>
              <p className="text-sm text-gray-400">Pantau status buku yang sedang Anda pinjam</p>
            </div>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#C9A84C] rounded-full mt-2" />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { refetchActive(); refetchHistory(); }} 
          className="gap-2 border-[#E8EAED] hover:border-[#FF6B00]/30 hover:bg-[#FF6B00]/5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* ─── ERROR STATE ─── */}
      {isErrorActive && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">Gagal memuat data peminjaman.</span>
            <Button variant="outline" size="sm" onClick={() => refetchActive()} className="border-red-300 hover:bg-red-100">
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── STATS ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF6B00]/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Dipinjam</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActive}</p>
              <p className="text-xs text-gray-400 mt-0.5">buku aktif</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Library className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF6B00]/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Limit Tersisa</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{maxLoans - totalActive}</p>
              <p className="text-xs text-gray-400 mt-0.5">dari {maxLoans}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#FF6B00]/20 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Riwayat</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loanHistory.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">total peminjaman</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROGRESS LIMIT ─── */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Limit Peminjaman</span>
          <span className="text-sm font-bold text-gray-900">{totalActive}/{maxLoans} Buku</span>
        </div>
        <Progress value={(totalActive / maxLoans) * 100} className="h-2" />
      </div>

      {/* ─── SEDANG DIPINJAM ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
            <Hourglass className="h-3.5 w-3.5 text-[#FF6B00]" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Sedang Dipinjam</h2>
          <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-0 ml-2 font-medium">
            {totalActive} buku
          </Badge>
        </div>

        {isLoadingActive ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Tidak ada buku yang sedang dipinjam</p>
            <p className="text-sm text-gray-300 mt-1">Mulai pinjam buku dari koleksi perpustakaan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeLoans.map((loan: any) => {
              const daysLeft = getDaysLeft(loan.due_date);
              const isOverdue = loan.status === 'overdue' || daysLeft < 0;
              const progressPercent = Math.max(0, Math.min(100, ((14 - Math.max(0, daysLeft)) / 14) * 100));

              return (
                <div key={loan.id} className={`bg-white rounded-2xl p-6 border ${isOverdue ? 'border-red-200 bg-red-50/20' : 'border-gray-100'} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {loan.book?.title || 'Unknown Title'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {loan.book?.author || 'Unknown Author'} 
                            {loan.book?.category && <span className="text-gray-300 mx-1.5">•</span>}
                            {loan.book?.category && <span className="text-gray-400">{loan.book.category}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(loan.status, loan.due_date)}
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-700 border-0 animate-pulse">
                              ⚠️ Denda
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-400">Tanggal Pinjam</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(loan.borrowed_at || loan.borrow_date || loan.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Jatuh Tempo</p>
                          <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                            {formatDate(loan.due_date)}
                            {isOverdue && ' ⚠️'}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-xs text-gray-400">Sisa Waktu</p>
                          <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isOverdue ? 'Terlambat' : `${daysLeft} hari lagi`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress Peminjaman</span>
                          <span>{isOverdue ? '⚠️ Terlambat' : `${Math.min(100, Math.round(progressPercent))}%`}</span>
                        </div>
                        <Progress 
                          value={isOverdue ? 100 : Math.min(100, progressPercent)} 
                          className={`h-1.5 ${isOverdue ? 'bg-red-200' : ''}`}
                        />
                      </div>

                      {loan.fine_amount && loan.fine_amount > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-700 flex items-center gap-2 border border-red-100">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Denda: Rp {loan.fine_amount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── RIWAYAT PEMINJAMAN ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Riwayat Peminjaman</h2>
            <Badge className="bg-gray-100 text-gray-600 border-0 ml-2 font-medium">
              {loanHistory.length}
            </Badge>
          </div>
          {loanHistory.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-[#FF6B00] hover:text-[#FF8A3D] font-medium">
              Lihat Semua
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Buku</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tgl Pinjam</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Tgl Kembali</th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3 px-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    </tr>
                  ))
                ) : loanHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">Belum ada riwayat peminjaman</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  loanHistory.slice(0, 10).map((loan: any) => (
                    <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">{loan.book?.title || '-'}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-gray-500 text-xs">{loan.book?.category || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400">
                          {formatDate(getLoanDate(loan, 'borrow'))}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-xs text-gray-400">
                          {formatDate(getLoanDate(loan, 'return'))}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {loan.status === 'returned' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Selesai</Badge>
                        ) : loan.status === 'overdue' || getDaysLeft(loan.due_date) < 0 ? (
                          <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Terlambat</Badge>
                        ) : (
                          getStatusBadge(loan.status, loan.due_date)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {loanHistory.length > 10 && (
            <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100 bg-gray-50/30">
              Menampilkan 10 dari {loanHistory.length} riwayat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}