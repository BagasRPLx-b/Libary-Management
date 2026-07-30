import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember, type Member } from '../hooks/useMember';

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const { data: members = [], isLoading } = useMembers(search);
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
    <div className="space-y-4">
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Input
          placeholder="Cari member berdasarkan nama, email, atau kode..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ name: '', email: '', phone: '' })}>
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                {isCreating ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member: Member) => (
                <TableRow key={member.id || member.code}>
                  <TableCell className="font-medium">{member.code}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'Active' ? 'default' : 'destructive'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800" onClick={() => setDeletingMember(member)}>
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

      {/* Dialog Edit Member */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
              {isUpdating ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Member</DialogTitle>
          </DialogHeader>
          <p className="py-4">Apakah Anda yakin ingin menghapus member <strong>{deletingMember?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMember(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}