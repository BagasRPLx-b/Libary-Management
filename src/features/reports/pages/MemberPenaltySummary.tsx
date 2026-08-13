import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Coins, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { MemberPenaltySummaryItem } from '@/types';
import { useMemberPenalty } from '../hooks/useReports';

export default function MemberPenaltySummary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<MemberPenaltySummaryItem | null>(null);

  const { data, isLoading, refetch } = useMemberPenalty({
    search: searchTerm || undefined,
    page,
    per_page: 10,
  });

  const members = data?.data ?? [];
  const summary = data?.summary ?? { total_members: 0, total_penalty_count: 0, total_final_fine: 0 };
  const pagination = data?.pagination ?? { current_page: 1, last_page: 1, per_page: 10, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="h-6 w-6 text-[#0055FF]" /> Member Penalty Summary
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan denda final dan riwayat keterlambatan per anggota.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50/55 border border-blue-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Member dengan Penalti</p>
              <p className="text-3xl font-black text-blue-800">{summary.total_members}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50/55 border border-red-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Total Keterlambatan</p>
              <p className="text-3xl font-black text-red-800">{summary.total_penalty_count}</p>
            </div>
            <div className="p-3 bg-red-100 text-red-700 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/55 border border-green-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Total Denda Final</p>
              <p className="text-2xl font-black text-green-800">
                Rp {summary.total_final_fine?.toLocaleString('id-ID') || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 text-green-700 rounded-xl">
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
                <TableHead className="font-semibold text-center">Total Keterlambatan</TableHead>
                <TableHead className="font-semibold text-right">Total Denda Final</TableHead>
                <TableHead className="font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-12">
                    {searchTerm ? 'Tidak ditemukan member dengan penalti.' : 'Belum ada data penalti member.'}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.member_id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">{member.member_name}</p>
                        <p className="text-xs text-gray-400">{member.member_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        {member.total_penalty_count} kali
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      Rp {member.total_final_fine.toLocaleString('id-ID')}
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
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Menampilkan {((pagination.current_page - 1) * (pagination.per_page || 10)) + 1} - {Math.min(pagination.current_page * (pagination.per_page || 10), pagination.total || 0)} dari {pagination.total || 0} member
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                &lt;
              </button>
              <span className="px-3 py-1 rounded bg-[#0055FF] text-white">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page}
                className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0055FF]" /> Detail Penalti Member
            </DialogTitle>
            {selectedMember && (
              <div className="mt-1">
                <p className="font-semibold text-gray-900">{selectedMember.member_name}</p>
                <p className="text-sm text-gray-500">{selectedMember.member_code}</p>
              </div>
            )}
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-3 py-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Total Keterlambatan</span>
                <span className="font-bold">{selectedMember.total_penalty_count} kali</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Denda Final</span>
                <span className="font-bold text-green-600">
                  Rp {selectedMember.total_final_fine.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">*Detail per transaksi akan tersedia di endpoint detail.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}