import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pencil, Trash2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMembers, useUpdateMember, useDeleteMember, type Member } from '../hooks/useMember';
import apiClient from '@/lib/api/client';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state untuk edit: name, email, phone, status
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const { data: members = [], isLoading, isError, refetch } = useMembers(search);
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
  const { mutate: deleteMemberMutation, isPending: isDeleting } = useDeleteMember();

  // Toggle status via PATCH /members/:id/status
  const { mutate: toggleStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'suspended' }) => {
      const response = await apiClient.patch(`/members/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const filteredMembers = members.filter((m: Member) => {
    if (statusFilter !== 'all') {
      return m.status?.toLowerCase() === statusFilter.toLowerCase();
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── Handlers ──────────────────────────────────────────

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: (member.status?.toLowerCase() === 'suspended' ? 'suspended' : 'active') as 'active' | 'suspended',
    });
  };

  const handleUpdate = () => {
    if (!editingMember || !form.name || !form.email || !form.phone) return;

    const oldStatus = editingMember.status?.toLowerCase();
    const newStatus = form.status;

    // 🔥 Optimistic update
    queryClient.setQueryData(['members'], (oldData: Member[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: form.name, email: form.email, phone: form.phone, status: newStatus }
          : m
      );
    });

    // Tutup dialog & reset form
    setEditingMember(null);
    setForm({ name: '', email: '', phone: '', status: 'active' });

    // 1. Update data member (name, email, phone)
    updateMember(
      { id: editingMember.id, name: form.name, email: form.email, phone: form.phone },
      {
        onSuccess: () => {
          // 2. Update status jika berubah
          if (oldStatus !== newStatus) {
            toggleStatus(
              { id: editingMember.id, status: newStatus },
              {
                onSuccess: () => {
                  setAlert({ type: 'success', message: 'Data member berhasil diperbarui.' });
                },
                onError: (err: any) => {
                  setAlert({ type: 'error', message: err.response?.data?.errors?.email?.[0] || 'Gagal mengubah status.' });
                },
                onSettled: () => {
                  queryClient.invalidateQueries({ queryKey: ['members'] });
                },
              }
            );
          } else {
            setAlert({ type: 'success', message: 'Data member berhasil diperbarui.' });
          }
        },
        onError: (err: any) => {
          setAlert({ type: 'error', message: err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Gagal memperbarui member.' });
          queryClient.invalidateQueries({ queryKey: ['members'] });
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['members'] });
        },
      }
    );
  };
  const handleDelete = () => {
    if (!deletingMember) return;
    deleteMemberMutation(deletingMember.id, {
      onSuccess: () => {
        setAlert({ type: 'success', message: 'Member berhasil dihapus.' });
        setDeletingMember(null);
        if (paginatedMembers.length === 1 && currentPage > 1) setCurrentPage((prev) => prev - 1);
      },
      onError: (err: any) => {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus member.' });
      },
    });
  };

  // ─── Helpers ───────────────────────────────────────────

  const getMemberCode = (member: Member) => {
    return member.member_code || `MBR-${String(member.id).padStart(4, '0')}`;
  };
  const getStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === 'active';
    return (
      <Badge
        variant={isActive ? 'default' : 'destructive'}
        className="font-semibold px-3 py-1 text-xs"
      >
        {isActive ? '✅ Aktif' : '⛔ Dinonaktifkan'}
      </Badge>
    );
  };

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="shadow-sm">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Gagal memuat data member.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Coba Lagi</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary-600" />
          Manajemen Member
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau kode..."
            className="pl-9 rounded-lg bg-gray-50 border-gray-200 h-10 w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px] rounded-lg border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">✅ Aktif</SelectItem>
            <SelectItem value="suspended">⛔ Dinonaktifkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="font-semibold">Kode Member</TableHead>
                <TableHead className="font-semibold">Nama</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Telepon</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-gray-300" />
                      <span>Tidak ditemukan data member.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member: Member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/40 transition-colors">
                    <TableCell className="font-bold text-neutral-800">
                      {getMemberCode(member)}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-700">{member.name}</TableCell>
                    <TableCell className="text-neutral-600">{member.email}</TableCell>
                    <TableCell className="text-neutral-600">{member.phone || '-'}</TableCell>
                    <TableCell>
                      {getStatusBadge(member.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => openEditDialog(member)}
                          title="Edit Member"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => setDeletingMember(member)}
                          title="Hapus Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-neutral-500">
              Menampilkan {Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredMembers.length, currentPage * itemsPerPage)} dari {filteredMembers.length} member
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button key={idx} variant={currentPage === idx + 1 ? 'default' : 'outline'} size="sm" className={`h-8 w-8 rounded-lg font-semibold ${currentPage === idx + 1 ? 'bg-primary-600 text-white' : ''}`} onClick={() => setCurrentPage(idx + 1)}>
                  {idx + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Edit Dialog ─────────────────────────────────── */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-800">Edit Data Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Alamat Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Nomor Telepon</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>

            {/* Status Toggle */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status Keanggotaan</Label>
              <Select
                value={form.status}
                onValueChange={(value: 'active' | 'suspended') => setForm({ ...form, status: value })}
              >
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">✅ Aktif</SelectItem>
                  <SelectItem value="suspended">⛔ Dinonaktifkan</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                {form.status === 'active'
                  ? 'Member dapat meminjam buku.'
                  : 'Member tidak dapat meminjam buku sampai diaktifkan kembali.'}
              </p>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold mt-2"
            >
              {isUpdating ? 'Memperbarui...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Dialog ───────────────────────────────── */}
      <Dialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-800">Hapus Member</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600 text-sm">
            Apakah Anda yakin ingin menghapus member <strong>{deletingMember?.name}</strong>?
            <br />
            <span className="text-red-500 text-xs">Tindakan ini tidak dapat dibatalkan.</span>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMember(null)} className="rounded-xl">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl">
              {isDeleting ? 'Menghapus...' : 'Hapus Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}