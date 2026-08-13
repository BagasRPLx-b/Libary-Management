// src/features/reports/pages/MemberOverdueSummary.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Users, BookOpen, Coins, Eye, RefreshCw, 
  AlertCircle, Calendar 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOverdueLoans } from '../hooks/useReports';
import { useMembers } from '@/features/members/hooks/useMember';

interface MemberSummary {
  member_id: number;
  member_name: string;
  member_code: string;
  total_overdue: number;
  total_estimated_fine: number;
  loans: any[]; // untuk detail
  last_overdue_date: string | null;
}

export default function MemberOverdueSummary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);

  // ✅ Ambil data overdue loans (sudah ada)
  const { data: overdueLoans = [], isLoading: isLoadingOverdue, isError, refetch } = useOverdueLoans();

  // ✅ (Opsional) Ambil data semua member, untuk menampilkan member tanpa overdue
  const { data: allMembers = [] } = useMembers();

  // ✅ Agregasi data di frontend
  const memberSummary = useMemo(() => {
    // Group loans by member_id
    const grouped = new Map<number, MemberSummary>();

    overdueLoans.forEach((loan: any) => {
      const memberId = loan.member?.id || loan.member_id;
      if (!memberId) return;

      if (!grouped.has(memberId)) {
        grouped.set(memberId, {
          member_id: memberId,
          member_name: loan.member?.name || 'Unknown',
          member_code: loan.member?.member_code || '-',
          total_overdue: 0,
          total_estimated_fine: 0,
          loans: [],
          last_overdue_date: null,
        });
      }

      const entry = grouped.get(memberId)!;
      entry.total_overdue += 1;
      const fine = parseFloat(String(loan.estimated_fine ?? loan.fine_amount ?? 0));
      entry.total_estimated_fine += fine;
      entry.loans.push(loan);

      // Update last overdue date
      if (loan.due_date) {
        const dueDate = new Date(loan.due_date);
        if (!entry.last_overdue_date || dueDate > new Date(entry.last_overdue_date)) {
          entry.last_overdue_date = loan.due_date;
        }
      }
    });

    return Array.from(grouped.values());
  }, [overdueLoans]);

  // Filter berdasarkan search
  const filteredMembers = memberSummary.filter((member) => {
    if (!searchTerm) return true;
    return member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.member_code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Summary cards
  const totalMembers = memberSummary.length;
  const totalOverdueBooks = memberSummary.reduce((sum, m) => sum + m.total_overdue, 0);
  const totalEstimatedFine = memberSummary.reduce((sum, m) => sum + m.total_estimated_fine, 0);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#0055FF]" /> Member Overdue Summary
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan anggota yang memiliki peminjaman terlambat (overdue).
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50/55 border border-blue-100 rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Member dengan Overdue</p>
              <p className="text-3xl font-black text-blue-800">{totalMembers}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50/55 border border-red-100 rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Total Overdue Buku</p>
              <p className="text-3xl font-black text-red-800">{totalOverdueBooks}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-700 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/55 border border-yellow-100 rounded-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Total Estimasi Denda</p>
              <p className="text-2xl font-black text-yellow-800">
                Rp {totalEstimatedFine.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-yellow-600">*Estimasi, menunggu pengembalian</p>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari member (nama/kode)..."
          className="pl-9 h-10 rounded-lg border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead className="font-semibold text-center">Total Overdue</TableHead>
                <TableHead className="font-semibold text-right">Estimasi Denda</TableHead>
                <TableHead className="font-semibold">Terakhir Overdue</TableHead>
                <TableHead className="font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOverdue ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                    {searchTerm ? 'Tidak ditemukan member dengan overdue.' : 'Belum ada member dengan peminjaman terlambat.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.member_id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">{member.member_name}</p>
                        <p className="text-xs text-gray-400">{member.member_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        {member.total_overdue} buku
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-yellow-600">
                      Rp {member.total_estimated_fine.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(member.last_overdue_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => setSelectedMember(member)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredMembers.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-sm text-gray-500 bg-gray-50/30">
            Menampilkan {filteredMembers.length} dari {totalMembers} member dengan overdue
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0055FF]" />
              Detail Overdue Member
            </DialogTitle>
            {selectedMember && (
              <div className="mt-1">
                <p className="font-semibold text-gray-900">{selectedMember.member_name}</p>
                <p className="text-sm text-gray-500">{selectedMember.member_code}</p>
              </div>
            )}
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center">
                <span className="text-sm font-medium text-yellow-800">Total Estimasi Denda</span>
                <span className="text-xl font-bold text-yellow-900">
                  Rp {selectedMember.total_estimated_fine.toLocaleString('id-ID')}
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buku</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead className="text-center">Keterlambatan</TableHead>
                    <TableHead className="text-right">Estimasi Denda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMember.loans.map((loan: any) => {
                    const days = Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.book?.title || 'Unknown'}</TableCell>
                        <TableCell className="text-gray-500">{formatDate(loan.due_date)}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            {Math.max(0, days)} hari
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-yellow-600">
                          Rp {(loan.estimated_fine || 0).toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}