import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Users, BookOpen, Coins, Eye, RefreshCw, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOverdueLoans } from '../hooks/useReports';
import type { OverdueLoan } from '@/types';

interface MemberSummary {
  member_id: number;
  member_name: string;
  member_code: string;
  total_overdue: number;
  total_estimated_fine: number;
  loans: OverdueLoan[];
  last_overdue_date: string | null;
}

export default function MemberOverdueSummary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);

  const { data: overdueLoans = [], isLoading: isLoadingOverdue, refetch } = useOverdueLoans();

  const memberSummary = useMemo(() => {
    const grouped = new Map<number, MemberSummary>();

    overdueLoans.forEach((loan) => {
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

      if (loan.due_date) {
        const dueDate = new Date(loan.due_date);
        if (!entry.last_overdue_date || dueDate > new Date(entry.last_overdue_date)) {
          entry.last_overdue_date = loan.due_date;
        }
      }
    });

    return Array.from(grouped.values());
  }, [overdueLoans]);

  const filteredMembers = memberSummary.filter((member) => {
    if (!searchTerm) return true;
    return member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalMembers = memberSummary.length;
  const totalOverdueBooks = memberSummary.reduce((sum, member) => sum + member.total_overdue, 0);
  const totalEstimatedFine = memberSummary.reduce((sum, member) => sum + member.total_estimated_fine, 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#0055FF]" /> Member Overdue Summary
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan anggota yang memiliki peminjaman terlambat (overdue).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari member (nama/kode)..."
          className="pl-9 h-10 rounded-lg border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
      </div>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0055FF]" /> Detail Overdue Member
            </DialogTitle>
            {selectedMember && (
              <div className="mt-1">
                <p className="font-semibold text-gray-900">{selectedMember.member_name}</p>
                <p className="text-sm text-gray-500">{selectedMember.member_code}</p>
              </div>
            )}
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Total Overdue</span>
                <span className="font-bold">{selectedMember.total_overdue} buku</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Estimasi Denda</span>
                <span className="font-bold text-yellow-600">
                  Rp {selectedMember.total_estimated_fine.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-[#0055FF]" /> Daftar Buku Tertunggak
                </div>
                {selectedMember.loans.map((loan) => (
                  <div key={loan.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="font-medium text-gray-800">{loan.book?.title || 'Judul tidak tersedia'}</span>
                      <Badge className="bg-red-50 text-red-700 border-red-200">{loan.status}</Badge>
                    </div>
                    <p className="text-gray-500 mt-1">Jatuh tempo: {loan.due_date ? formatDate(loan.due_date) : '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}