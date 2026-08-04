import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Search, AlertCircle, Users, BookX, RefreshCw, Clock, Coins, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useOverdueLoans } from '../hooks/useReports';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);

  const { data: overdueLoans = [], isLoading, isError, refetch } = useOverdueLoans(searchTerm);

  const filteredLoans = overdueLoans.filter((loan: any) => {
    if (dateFilter && loan.due_date && !loan.due_date.startsWith(dateFilter)) return false;
    return true;
  });

  const totalFine = filteredLoans.reduce((sum: number, loan: any) => sum + (loan.fine_amount || 0), 0);
  const totalOverdue = filteredLoans.length;

  // Mencari member terbanyak meminjam terlambat secara dinamis
  const memberCounts: Record<string, number> = {};
  filteredLoans.forEach((loan: any) => {
    if (loan.member) {
      memberCounts[loan.member] = (memberCounts[loan.member] || 0) + 1;
    }
  });
  let topMemberName = '-';
  let topMemberCount = 0;
  Object.entries(memberCounts).forEach(([name, count]) => {
    if (count > topMemberCount) {
      topMemberName = name;
      topMemberCount = count;
    }
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const calculateDaysOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return 0;
    try {
      const days = Math.ceil((new Date().getTime() - new Date(dueDateStr).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, days);
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat laporan.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Overdue */}
        <Card className="bg-red-50/55 border border-red-100 shadow-subtle-sm rounded-xl overflow-hidden hover:shadow-subtle-md hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Total Overdue</p>
              <p className="text-3xl font-black text-red-700">{totalOverdue}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Denda */}
        <Card className="bg-yellow-50/55 border border-yellow-100 shadow-subtle-sm rounded-xl overflow-hidden hover:shadow-subtle-md hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Total Denda</p>
              <p className="text-2xl font-black text-yellow-800">Rp {totalFine.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Member Terbanyak */}
        <Card className="bg-blue-50/55 border border-blue-100 shadow-subtle-sm rounded-xl overflow-hidden hover:shadow-subtle-md hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Member Terbanyak</p>
              <p className="text-lg font-black text-blue-900 truncate max-w-[200px]">
                {topMemberCount > 0 ? `${topMemberName}` : '-'}
              </p>
              {topMemberCount > 0 && <p className="text-[10px] text-blue-600 font-bold">{topMemberCount} buku overdue</p>}
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <User className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Table */}
      <Card className="shadow-subtle-md border-gray-100 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-gray-800 text-lg font-bold flex items-center gap-2">
            📋 Daftar Peminjaman Terlambat
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-36">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 h-10 w-full rounded-lg border-gray-200"
              />
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari member atau buku..."
                className="pl-9 h-10 w-full rounded-lg border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/20 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-semibold text-neutral-600">Member</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Buku</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Batas Kembali</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Keterlambatan</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Denda</TableHead>
                  <TableHead className="font-semibold text-neutral-600 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                      Tidak ada peminjaman terlambat yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan: any) => {
                    const days = calculateDaysOverdue(loan.due_date);
                    return (
                      <TableRow key={loan.id} className="hover:bg-gray-50/30 transition-colors">
                        <TableCell className="font-semibold text-neutral-800">{loan.member}</TableCell>
                        <TableCell className="font-medium text-neutral-700 max-w-[200px] truncate">{loan.book}</TableCell>
                        <TableCell className="text-neutral-600">{formatDate(loan.due_date)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                            <AlertCircle className="h-3 w-3" /> {days} hari
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-red-600">
                          Rp {(loan.fine_amount || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 rounded-lg text-xs hover:bg-gray-50 border-gray-200"
                            onClick={() => setSelectedLoan(loan)}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50/20">
            <div className="text-right">
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Total Akumulasi Denda</p>
              <p className="text-2xl font-black text-red-600">
                Rp {totalFine.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Detail Loan */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-md rounded-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span> Rincian Peminjaman Terlambat
            </DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4 py-3 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                <span className="text-neutral-400 font-medium">Nama Member</span>
                <span className="col-span-2 font-bold text-neutral-800">{selectedLoan.member}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                <span className="text-neutral-400 font-medium">Judul Buku</span>
                <span className="col-span-2 font-semibold text-neutral-700">{selectedLoan.book}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                <span className="text-neutral-400 font-medium">Batas Waktu</span>
                <span className="col-span-2 font-semibold text-neutral-700">{formatDate(selectedLoan.due_date)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                <span className="text-neutral-400 font-medium font-bold">Keterlambatan</span>
                <span className="col-span-2 font-bold text-red-600">{calculateDaysOverdue(selectedLoan.due_date)} hari terlambat</span>
              </div>
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex justify-between items-center shadow-inner">
                <span className="font-bold text-sm">Tagihan Denda:</span>
                <span className="text-xl font-black">Rp {(selectedLoan.fine_amount || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedLoan(null)} className="w-full rounded-xl">Tutup Detail</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}