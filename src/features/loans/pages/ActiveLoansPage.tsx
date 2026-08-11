// src/features/loans/pages/ActiveLoansPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ActiveLoansPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: loans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['loans', 'active', 'all'],
    queryFn: async () => {
      // ✅ Ambil SEMUA peminjaman dengan status active (tanpa filter tanggal)
      const response = await apiClient.get('/loans', { 
        params: { 
          status: 'active',
          per_page: 100 // Ambil semua
        } 
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Filter berdasarkan search
  const filteredLoans = loans.filter((loan: any) => {
    if (!searchTerm) return true;
    const memberName = loan.member?.name || '';
    const bookTitle = loan.book?.title || '';
    return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    if (status === 'overdue') {
      return <Badge className="bg-red-100 text-red-700 border-red-200">⚠️ Terlambat</Badge>;
    }
    if (status === 'active' && dueDate) {
      const now = new Date();
      const due = new Date(dueDate);
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⏳ Hampir Jatuh Tempo</Badge>;
      }
    }
    return <Badge className="bg-green-100 text-green-700 border-green-200">📖 Dipinjam</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#0055FF]" /> Peminjaman Aktif
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Semua buku yang sedang dipinjam oleh member
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-sm px-3 py-1">
            {filteredLoans.length} buku dipinjam
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari member atau judul buku..."
          className="pl-9 h-10 rounded-lg border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            📋 Daftar Peminjaman Aktif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-semibold">No</TableHead>
                  <TableHead className="font-semibold">Member</TableHead>
                  <TableHead className="font-semibold">Buku</TableHead>
                  <TableHead className="font-semibold">Tanggal Pinjam</TableHead>
                  <TableHead className="font-semibold">Jatuh Tempo</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                      {loans.length === 0 ? 'Belum ada buku yang dipinjam.' : 'Tidak ditemukan.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan: any, index: number) => (
                    <TableRow key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                      <TableCell className="font-semibold text-gray-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {loan.member?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium text-gray-700">
                        {loan.book?.title || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(loan.borrowed_at)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(loan.due_date)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(loan.status, loan.due_date)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLoans.length > 0 && (
            <div className="p-4 border-t border-gray-100 text-sm text-gray-500 bg-gray-50/30">
              Menampilkan {filteredLoans.length} dari {loans.length} peminjaman aktif
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}