import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useOverdueLoans } from '../hooks/useReports';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: overdueLoans = [], isLoading } = useOverdueLoans(searchTerm);

  const totalFine = overdueLoans.reduce((sum, loan) => sum + (loan.fine_amount || 0), 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : overdueLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No overdue loans found.
                  </TableCell>
                </TableRow>
              ) : (
                overdueLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.member}</TableCell>
                    <TableCell>{loan.book}</TableCell>
                    <TableCell>{formatDate(loan.due_date)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Overdue</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {(loan.fine_amount || 0).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))
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