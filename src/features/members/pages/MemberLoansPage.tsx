// src/features/members/pages/MemberLoansPage.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, CheckCircle, Download, Eye, Info, AlertCircle
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { useMyLoans, useMyLoanHistory } from '../hooks/useProfile';
import { Progress } from '@/components/ui/progress';
import MemberPageHeader from '@/components/layout/MemberPageHeader';

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
  return_date?: string | null;
  borrowed_at?: string;
  returned_at?: string | null;
  created_at?: string;
  status: 'active' | 'returned' | 'overdue';
  fine_amount?: number;
  estimated_fine?: number;
}

export default function MemberLoansPage() {
  // ✅ Ambil SEMUA loan (tanpa filter status)
  const { data: allLoans = [], isLoading: isLoadingLoans, isError: isErrorLoans, refetch: refetchLoans } = useMyLoans();
  const { data: loanHistory = [], isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = useMyLoanHistory();

  // ✅ Filter untuk "Sedang Dipinjam" = active + overdue
  const currentLoans = allLoans.filter(
    (loan: Loan) => loan.status === 'active' || loan.status === 'overdue'
  );

  // ─── Pagination State ───────────────────────────────────
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;
  const totalHistoryItems = loanHistory.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / itemsPerPage);
  const paginatedHistory = loanHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  const totalActive = currentLoans.length;
  const maxLoans = 5;

  // ─── Format tanggal ──────────────────────────────────────
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  // ─── Cari tanggal ────────────────────────────────────────
  const getLoanDate = (loan: Loan, type: 'borrow' | 'return'): string | null => {
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
      return <Badge className="bg-red-50 text-red-600 border-red-200 font-medium">⚠️ Terlambat</Badge>;
    }
    if (status === 'returned') {
      return <Badge className="bg-gray-50 text-gray-600 border-gray-200 font-medium">✅ Selesai</Badge>;
    }
    return <Badge className="bg-blue-50 text-[#0055FF] border-blue-200 font-medium">📖 Dipinjam</Badge>;
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <MemberPageHeader placeholder="Cari buku atau riwayat..." />

      {/* ─── HEADER & LIMIT BADGE ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Peminjaman Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau status buku yang sedang Anda pinjam.</p>
        </div>
        <div className="flex items-center bg-blue-100/50 text-[#0055FF] px-4 py-2 rounded-lg gap-2 text-sm font-semibold border border-blue-100">
          <Info className="h-4 w-4" /> Limit Peminjaman: {totalActive}/{maxLoans} Buku
        </div>
      </div>

      {/* ─── ERROR STATE ─── */}
      {(isErrorLoans || isErrorHistory) && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">Gagal memuat data peminjaman.</span>
            <Button variant="outline" size="sm" onClick={() => { refetchLoans(); refetchHistory(); }} className="border-red-300 hover:bg-red-100">
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── SEDANG DIPINJAM ─── */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#0055FF]" /> Sedang Dipinjam
        </h2>

        {isLoadingLoans ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 min-w-[300px]">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : currentLoans.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">Tidak ada buku yang sedang dipinjam</p>
            <p className="text-sm text-gray-300 mt-1">Mulai pinjam buku dari koleksi perpustakaan</p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {currentLoans.map((loan: Loan) => {
              const daysLeft = getDaysLeft(loan.due_date);
              const isOverdue = loan.status === 'overdue' || daysLeft < 0;
              const progressPercent = Math.max(0, Math.min(100, ((14 - Math.max(0, daysLeft)) / 14) * 100));
              const estimatedFine = loan.estimated_fine || 0;

              return (
                <div key={loan.id} className={`bg-white rounded-xl p-5 border shadow-sm min-w-[380px] w-[380px] flex gap-4 relative overflow-hidden ${isOverdue ? 'border-red-200 bg-red-50/10' : 'border-gray-200 hover:border-blue-200'} transition-all duration-300 hover:shadow-md`}>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isOverdue ? (
                      <Badge className="bg-red-50 text-red-600 border-red-200 font-medium text-[10px]">⚠️ Terlambat</Badge>
                    ) : (
                      <Badge className="bg-blue-50 text-[#0055FF] border-blue-200 font-medium text-[10px]">Sedang Dipinjam</Badge>
                    )}
                  </div>

                  {/* Book Cover */}
                  <div className="w-24 h-36 bg-gray-100 rounded-lg shadow-sm border border-gray-200 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    <img src={`https://picsum.photos/120/180?random=${loan.id}`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between pt-1">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1 pr-20">
                        {loan.book?.title || 'Unknown Title'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {loan.book?.author || 'Unknown Author'} {loan.book?.category && `• ${loan.book.category}`}
                      </p>
                    </div>

                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Tanggal Pinjam:</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {formatDate(loan.borrowed_at || loan.borrow_date || loan.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Jatuh Tempo:</p>
                          <p className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatDate(loan.due_date)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-[#0055FF]'}`}>
                            {isOverdue ? `Terlambat ${Math.abs(daysLeft)} hari` : `${daysLeft} Hari Lagi`}
                          </span>
                        </div>
                        <Progress 
                          value={isOverdue ? 100 : Math.min(100, progressPercent)} 
                          className={`h-2 ${isOverdue ? 'bg-red-200' : 'bg-gray-100'} [&>div]:bg-[#0055FF]`}
                        />
                      </div>

                      {/* ✅ Tampilkan estimasi denda jika overdue */}
                      {isOverdue && estimatedFine > 0 && (
                        <div className="mt-1 flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                          <span className="text-[10px] text-yellow-700 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Estimasi Denda
                          </span>
                          <span className="text-xs font-bold text-yellow-800">Rp {estimatedFine.toLocaleString('id-ID')}</span>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Riwayat Peminjaman</h2>
          <Button variant="ghost" size="sm" className="text-[#0055FF] hover:bg-blue-50 font-semibold gap-2">
            Unduh Laporan <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Buku</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Pinjam</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6"><Skeleton className="h-4 w-40" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Belum ada riwayat peminjaman</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((loan: Loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden relative">
                          <img src={`https://picsum.photos/40/60?random=${loan.id+100}`} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-gray-800">{loan.book?.title || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{loan.book?.category || '-'}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {formatDate(getLoanDate(loan, 'borrow'))}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {formatDate(getLoanDate(loan, 'return'))}
                    </td>
                    <td className="py-4 px-6">
                      {loan.status === 'returned' ? (
                        <Badge className="bg-green-100 text-green-700 border-transparent font-medium px-2 py-0.5 rounded-md">Selesai</Badge>
                      ) : loan.status === 'overdue' || getDaysLeft(loan.due_date) < 0 ? (
                        <Badge className="bg-red-100 text-red-700 border-transparent font-medium px-2 py-0.5 rounded-md">Terlambat</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-transparent font-medium px-2 py-0.5 rounded-md">Dipinjam</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#0055FF]">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* ✅ Pagination Dinamis */}
        {totalHistoryItems > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
            <span>
              Menampilkan {((historyPage - 1) * itemsPerPage) + 1} - {Math.min(historyPage * itemsPerPage, totalHistoryItems)} dari {totalHistoryItems} riwayat
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className={`w-7 h-7 flex items-center justify-center rounded border ${historyPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(totalHistoryPages, 3) }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setHistoryPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded ${historyPage === i + 1 ? 'bg-[#0055FF] text-white font-medium' : 'border border-gray-200 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              {totalHistoryPages > 3 && (
                <>
                  <span className="w-7 h-7 flex items-center justify-center">...</span>
                  <button
                    onClick={() => setHistoryPage(totalHistoryPages)}
                    className={`w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50`}
                  >
                    {totalHistoryPages}
                  </button>
                </>
              )}
              <button 
                onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                disabled={historyPage === totalHistoryPages}
                className={`w-7 h-7 flex items-center justify-center rounded border ${historyPage === totalHistoryPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}