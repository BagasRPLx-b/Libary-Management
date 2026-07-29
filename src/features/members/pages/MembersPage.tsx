import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus } from 'lucide-react';

const INITIAL_MEMBERS = [
  { code: 'M001', name: 'John Doe', email: 'john@example.com', phone: '081234567890', status: 'Active' },
  { code: 'M002', name: 'Jane Smith', email: 'jane@example.com', phone: '081234567891', status: 'Active' },
  { code: 'M003', name: 'Robert Brown', email: 'robert@example.com', phone: '081234567892', status: 'Suspended' },
  { code: 'M004', name: 'Emily Davis', email: 'emily@example.com', phone: '081234567893', status: 'Active' },
  { code: 'M005', name: 'Michael Wilson', email: 'michael@example.com', phone: '081234567894', status: 'Active' },
  { code: 'M006', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '081234567895', status: 'Active' },
  { code: 'M007', name: 'David Lee', email: 'david@example.com', phone: '081234567896', status: 'Suspended' },
  { code: 'M008', name: 'Lisa Anderson', email: 'lisa@example.com', phone: '081234567897', status: 'Active' },
  { code: 'M009', name: 'Thomas Brown', email: 'thomas@example.com', phone: '081234567898', status: 'Active' },
  { code: 'M010', name: 'Anna White', email: 'anna@example.com', phone: '081234567899', status: 'Active' },
];

export default function MembersPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.phone) return;
    const code = `M${String(members.length + 1).padStart(3, '0')}`;
    setMembers([...members, { ...newMember, code, status: 'Active' }]);
    setNewMember({ name: '', email: '', phone: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search members..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Save
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => (
              <TableRow key={member.code}>
                <TableCell className="font-medium">{member.code}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <Badge variant={member.status === 'Active' ? 'default' : 'destructive'}>
                    {member.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}