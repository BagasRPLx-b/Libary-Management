// src/features/members/pages/MemberLoansPage.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Calendar, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useMyActiveLoans, useMyLoanHistory } from '../hooks/useProfile';
import { Progress } from '@/components/ui/progress';

// 👇 TAMBAHKAN TYPE UNTUK BOOK
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
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
    // Cek overdue dari status atau tanggal
    const isOverdue = status === 'overdue' || (status === 'active' && getDaysLeft(dueDate) < 0);
    
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">⚠️ Terlambat</Badge>;
    }
    if (status === 'returned') {
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">✅ Selesai</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">📖 Dipinjam</Badge>;
  };

  const getFineText = (fineAmount?: number) => {
    if (fineAmount && fineAmount > 0) {
      return `Rp ${fineAmount.toLocaleString('id-ID')}`;
    }
    return 'Tidak ada denda';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Peminjaman Saya</h1>
          <p className="text-sm text-gray-500">Pantau status buku yang sedang Anda pinjam.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchActive(); refetchHistory(); }} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Error States */}
      {isErrorActive && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat data peminjaman.</span>
            <Button variant="outline" size="sm" onClick={() => refetchActive()}>Coba Lagi</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Limit Peminjaman */}
      <Card className="shadow-sm border-gray-100 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Limit Peminjaman</span>
            <span className="text-sm font-bold text-gray-900">{loanLimit}/{maxLoans} Buku</span>
          </div>
          <Progress value={(loanLimit / maxLoans) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Sedang Dipinjam */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-500" /> Sedang Dipinjam
        </h2>

        {isLoadingActive ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-gray-100">
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeLoans.length === 0 ? (
          <Card className="shadow-sm border-gray-100 bg-white">
            <CardContent className="p-8 text-center text-gray-400">
              <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Tidak ada buku yang sedang dipinjam</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeLoans.map((loan: any) => {
              const daysLeft = getDaysLeft(loan.due_date);
              const isOverdue = loan.status === 'overdue' || daysLeft < 0;
              // Progress: dari 14 hari, semakin mendekati due date semakin tinggi
              const progressPercent = Math.max(0, Math.min(100, ((14 - Math.max(0, daysLeft)) / 14) * 100));

              return (
                <Card key={loan.id} className={`shadow-sm border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-primary-500'} bg-white`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {loan.book?.title || 'Unknown Title'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {loan.book?.author || 'Unknown Author'} 
                              {loan.book?.category && ` • ${loan.book.category}`}
                            </p>
                          </div>
                          {getStatusBadge(loan.status, loan.due_date)}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Tanggal Pinjam</p>
                            <p className="font-medium text-gray-700">{formatDate(loan.borrow_date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Jatuh Tempo</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                              {formatDate(loan.due_date)}
                              {isOverdue && ' ⚠️'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{isOverdue ? 'Terlambat' : `${daysLeft} Hari Lagi`}</span>
                          </div>
                          <Progress value={isOverdue ? 100 : Math.min(100, progressPercent)} className="h-1.5" />
                        </div>
                        {loan.fine_amount && loan.fine_amount > 0 && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Status Denda: Rp {loan.fine_amount.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Riwayat Peminjaman */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" /> Riwayat Peminjaman
        </h2>

        <Card className="shadow-sm border-gray-100 bg-white">
          <CardContent className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Buku</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Pinjam</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      </tr>
                    ))
                  ) : loanHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        Belum ada riwayat peminjaman
                      </td>
                    </tr>
                  ) : (
                    loanHistory.slice(0, 10).map((loan: any) => (
                      <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700">{loan.book?.title || '-'}</td>
                        <td className="py-3 px-4 text-gray-500">{loan.book?.category || '-'}</td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(loan.borrow_date)}</td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(loan.return_date) || '-'}</td>
                        <td className="py-3 px-4">
                          {loan.status === 'returned' ? (
                            <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">Selesai</Badge>
                          ) : loan.status === 'overdue' || getDaysLeft(loan.due_date) < 0 ? (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Terlambat</Badge>
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
              <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                Menampilkan 10 dari {loanHistory.length} riwayat
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}