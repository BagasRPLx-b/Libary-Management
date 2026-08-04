import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Pencil, Trash2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember, type Member } from '../hooks/useMember';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: members = [], isLoading, isError, refetch } = useMembers(search);

  const filteredMembers = members.filter((m: Member) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const { mutate: createMember, isPending: isCreating } = useCreateMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
  const { mutate: deleteMemberMutation, isPending: isDeleting } = useDeleteMember();

  const handleCreate = () => {
    if (!form.name || !form.email || !form.phone) {
      setAlert({ type: 'error', message: 'Semua field wajib diisi.' });
      return;
    }
    createMember(form, {
      onSuccess: () => {
        setAlert({ type: 'success', message: 'Member berhasil ditambahkan.' });
        setForm({ name: '', email: '', phone: '' });
        setOpenAdd(false);
        setCurrentPage(1);
      },
      onError: (err: any) => {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menambahkan member.' });
      },
    });
  };

  const handleUpdate = () => {
    if (!editingMember || !form.name || !form.email || !form.phone) return;
    updateMember(
      { id: editingMember.id, ...form },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: 'Member berhasil diperbarui.' });
          setEditingMember(null);
          setForm({ name: '', email: '', phone: '' });
        },
        onError: (err: any) => {
          setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal memperbarui member.' });
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
        if (paginatedMembers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      },
      onError: (err: any) => {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Gagal menghapus member.' });
      },
    });
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setForm({ name: member.name, email: member.email, phone: member.phone });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'} className="shadow-sm">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary-600" /> Manajemen Member
        </h1>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ name: '', email: '', phone: '' })} className="rounded-lg bg-primary-600 hover:bg-primary-700 shadow-sm transition-all duration-200">
              <UserPlus className="mr-2 h-4 w-4" /> Tambah Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold text-gray-800">Tambah Anggota Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Lengkap"
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-gray-700">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="rounded-xl border-gray-200"
                />
              </div>
              <Button onClick={handleCreate} disabled={isCreating} className="w-full h-11 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold shadow-md shadow-primary-500/10 transition-all duration-200 mt-2">
                {isCreating ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-subtle-sm border border-gray-100">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau kode..."
            className="pl-9 rounded-full bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm h-10 w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px] rounded-lg border-gray-200 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-subtle-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70 border-b border-gray-100">
              <TableRow>
                <TableHead className="font-semibold text-neutral-600">Kode Member</TableHead>
                <TableHead className="font-semibold text-neutral-600">Nama</TableHead>
                <TableHead className="font-semibold text-neutral-600">Email</TableHead>
                <TableHead className="font-semibold text-neutral-600">Telepon</TableHead>
                <TableHead className="font-semibold text-neutral-600">Status</TableHead>
                <TableHead className="font-semibold text-neutral-600 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                    Tidak ditemukan data member.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member: Member, idx) => (
                  <TableRow key={member.id || member.code} className={`hover:bg-gray-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/20' : ''}`}>
                    <TableCell className="font-bold text-neutral-800">{member.code}</TableCell>
                    <TableCell className="font-medium text-neutral-700">{member.name}</TableCell>
                    <TableCell className="text-neutral-600">{member.email}</TableCell>
                    <TableCell className="text-neutral-600">{member.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        member.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={() => openEditDialog(member)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors" onClick={() => setDeletingMember(member)}>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <div className="text-sm text-neutral-500 font-medium">
              Menampilkan {Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredMembers.length, currentPage * itemsPerPage)} dari {filteredMembers.length} member
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPage === idx + 1 ? 'default' : 'outline'}
                  size="sm"
                  className={`h-8 w-8 rounded-lg font-semibold ${currentPage === idx + 1 ? 'bg-primary-600 text-white' : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Edit Member */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-md rounded-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-800">Ubah Data Anggota</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-semibold text-gray-700">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="font-semibold text-gray-700">Alamat Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="font-semibold text-gray-700">Nomor Telepon</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border-gray-200"
              />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating} className="w-full h-11 bg-primary-600 hover:bg-primary-700 rounded-xl font-bold shadow-md shadow-primary-500/10 transition-all duration-200 mt-2">
              {isUpdating ? 'Memperbarui...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent className="max-w-md rounded-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-800">Hapus Member</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600 text-sm leading-relaxed">Apakah Anda yakin ingin menghapus member <strong>{deletingMember?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMember(null)} className="rounded-xl">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl bg-red-600 hover:bg-red-700 font-semibold">
              {isDeleting ? 'Menghapus...' : 'Hapus Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}