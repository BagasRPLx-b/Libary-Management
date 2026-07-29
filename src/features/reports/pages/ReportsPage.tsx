import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const OVERDUE_LOANS = [
  { id: 1, member: 'John Doe', book: 'The Great Gatsby', dueDate: new Date('2025-03-15'), fineAmount: 2500 },
  { id: 2, member: 'Jane Smith', book: '1984', dueDate: new Date('2025-03-10'), fineAmount: 5000 },
  { id: 3, member: 'Robert Brown', book: 'To Kill a Mockingbird', dueDate: new Date('2025-03-20'), fineAmount: 1200 },
  { id: 4, member: 'Emily Davis', book: 'Pride and Prejudice', dueDate: new Date('2025-03-18'), fineAmount: 1800 },
  { id: 5, member: 'Michael Wilson', book: 'Moby Dick', dueDate: new Date('2025-03-22'), fineAmount: 3000 },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = OVERDUE_LOANS.filter(
    (loan) =>
      loan.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.book.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFine = filteredLoans.reduce((sum, loan) => sum + loan.fineAmount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Overdue Loans</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search member or book..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fine Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.member}</TableCell>
                  <TableCell>{loan.book}</TableCell>
                  <TableCell>{format(loan.dueDate, 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Overdue</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {loan.fineAmount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {filteredLoans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No overdue loans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6 border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Denda</p>
              <p className="text-2xl font-bold text-red-600">
                Rp {totalFine.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}