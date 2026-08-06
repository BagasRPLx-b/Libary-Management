// src/features/loans/pages/CirculationPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Barcode, ArrowRightLeft, Undo2, Loader2, Search, Calendar } from 'lucide-react';
import { useMembers } from '@/features/members/hooks/useMember';
import apiClient from '@/lib/api/client';
import type { Book } from '@/features/books/hooks/useBooks';
import { getErrorMessage } from '@/lib/error-handler';

// ─── GET today transactions ──────────────────────────────
const fetchTodayTransactions = async () => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await apiClient.get('/transactions', { params: { date: today } });
    const data = response.data;

    if (data && typeof data === 'object') {
      // Gabungkan issued + returned
      const allTransactions = [
        ...(Array.isArray(data.issued) ? data.issued : []),
        ...(Array.isArray(data.returned) ? data.returned : []),
      ];

      // ✅ Hapus duplikat berdasarkan ID
      const uniqueTransactions = allTransactions.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
      );

      // ✅ SORT: Urutkan dari yang terbaru
      const sortedTransactions = uniqueTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at || a.borrowed_at).getTime();
        const dateB = new Date(b.created_at || b.borrowed_at).getTime();
        return dateB - dateA;
      });

      // ✅ Format untuk tabel
      return sortedTransactions.map((item: any) => ({
        id: item.id,
        member: item.member?.name || 'Unknown',
        book: item.book?.title || 'Unknown',
        type: item.status === 'active' ? 'Issue' : 'Return',
        time: item.created_at
          ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-',
        status: item.status,
      }));
    }

    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;

    return [];
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    return [];
  }
};

// ─── Component ────────────────────────────────────────────
export default function CirculationPage() {
  const queryClient = useQueryClient();

  // ─── State ──────────────────────────────────────────────
  const [barcode, setBarcode] = useState('');
  const [mode, setMode] = useState<'issue' | 'return'>('issue');
  const [scannedBook, setScannedBook] = useState<Book & { active_loans?: any[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [fineConfirm, setFineConfirm] = useState<{ show: boolean; message: string; fine: number } | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  // ─── React Query ────────────────────────────────────────
  const { data: todayTransactions = [], isLoading: isLoadingTx, isError: isErrorTx, refetch: refetchTx } = useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: fetchTodayTransactions,
    staleTime: 1000 * 60 * 5,
  });

  const { data: members = [] } = useMembers();

  // ─── Mutations ──────────────────────────────────────────
  const issueMutation = useMutation({
    mutationFn: async (data: { book_id: number; member_id: number }) => {
      const response = await apiClient.post('/loans/issue', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const response = await apiClient.post(`/loans/${loanId}/return`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  // ─── Handlers ────────────────────────────────────────────

  const handleScan = async () => {
    if (!barcode.trim()) {
      setAlertMsg({ type: 'error', message: 'Silakan masukkan ISBN terlebih dahulu.' });
      return;
    }

    setIsScanning(true);
    setAlertMsg(null);
    setScannedBook(null);
    setSelectedLoanId(null);

    try {
      const response = await apiClient.get(`/books/scan/${barcode.trim()}`);
      const bookData = response.data;

      if (mode === 'issue' && bookData.available_copies === 0) {
        setAlertMsg({ type: 'error', message: `Stok buku "${bookData.title}" habis.` });
        setIsScanning(false);
        return;
      }

      setScannedBook(bookData);
      setAlertMsg({ type: 'success', message: `✅ Buku ditemukan: ${bookData.title}` });

      if (mode === 'return') {
        try {
          const loansResponse = await apiClient.get('/loans', {
            params: { book_id: bookData.id, status: 'active' }
          });
          let activeLoans = loansResponse.data?.data || loansResponse.data || [];
          if (!Array.isArray(activeLoans)) activeLoans = [];

          if (activeLoans.length === 0) {
            setAlertMsg({ type: 'error', message: 'Tidak ada peminjaman aktif untuk buku ini.' });
            setScannedBook(null);
            setIsScanning(false);
            return;
          }

          setScannedBook({ ...bookData, active_loans: activeLoans });

          if (activeLoans.length === 1) {
            setSelectedLoanId(activeLoans[0].id);
          }
        } catch {
          setAlertMsg({ type: 'error', message: 'Gagal memuat data peminjaman aktif.' });
          setIsScanning(false);
          return;
        }
      }
    } catch (error: any) {
      setAlertMsg({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Buku tidak ditemukan.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleIssue = async () => {
    if (!scannedBook) return;
    if (!selectedMember) {
      setAlertMsg({ type: 'error', message: 'Silakan pilih member terlebih dahulu.' });
      return;
    }

    setAlertMsg(null);

    issueMutation.mutate(
      { book_id: scannedBook.id, member_id: Number(selectedMember) },
      {
        onSuccess: () => {
          setAlertMsg({ type: 'success', message: `✅ Buku "${scannedBook.title}" berhasil dipinjamkan.` });
          setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies - 1 } : null);
          setTimeout(() => {
            setScannedBook(null);
            setBarcode('');
            setSelectedMember('');
            refetchTx();
          }, 1500);
        },
        onError: (error) => {
          setAlertMsg({ type: 'error', message: getErrorMessage(error) });
        },
      }
    );
  };

  const handleReturn = () => {
    if (!scannedBook) return;
    if (!selectedLoanId) {
      setAlertMsg({ type: 'error', message: 'Silakan pilih peminjam buku ini.' });
      return;
    }

    setAlertMsg(null);

    returnMutation.mutate(selectedLoanId, {
      onSuccess: (data: any) => {
        if (data?.fine && data.fine > 0) {
          setFineConfirm({
            show: true,
            message: data.message || 'Buku dikembalikan dengan denda keterlambatan.',
            fine: data.fine,
          });
        } else {
          setAlertMsg({ type: 'success', message: `✅ Buku "${scannedBook.title}" berhasil dikembalikan.` });
          setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies + 1 } : null);
          setTimeout(() => {
            setScannedBook(null);
            setBarcode('');
            setSelectedLoanId(null);
            refetchTx();
          }, 1500);
        }
      },
      onError: (error) => {
        setAlertMsg({ type: 'error', message: getErrorMessage(error) });
      },
    });
  };

  const handleCloseFineModal = () => {
    setAlertMsg({ type: 'success', message: `✅ Buku "${scannedBook?.title}" berhasil dikembalikan dengan denda.` });
    setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies + 1 } : null);
    setFineConfirm(null);
    setTimeout(() => {
      setScannedBook(null);
      setBarcode('');
      setSelectedLoanId(null);
      refetchTx();
    }, 1500);
  };

  // ─── Render ──────────────────────────────────────────────
  const isIssuing = issueMutation.isPending;
  const isReturning = returnMutation.isPending;
  const isProcessing = isIssuing || isReturning || isScanning;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
      {/* ─── KOLOM KIRI: Scan & Sirkulasi ─── */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="shadow-sm border-gray-100/60 overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-lg font-bold">
              <Barcode className="h-5 w-5 text-primary-500" /> Book Circulation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* ─── Toggle Mode ─── */}
            <div className="flex bg-neutral-100 rounded-xl p-1">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'issue'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => {
                  setMode('issue');
                  setScannedBook(null);
                  setAlertMsg(null);
                  setSelectedLoanId(null);
                }}
              >
                <ArrowRightLeft className="h-4 w-4" /> Issue
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'return'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => {
                  setMode('return');
                  setScannedBook(null);
                  setAlertMsg(null);
                  setSelectedLoanId(null);
                }}
              >
                <Undo2 className="h-4 w-4" /> Return
              </button>
            </div>

            {/* ─── Pilih Member (hanya untuk Issue) ─── */}
            {mode === 'issue' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-600">Pilih Member *</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:ring-primary-500 rounded-xl bg-gray-50/50">
                    <SelectValue placeholder="Pilih Anggota Perpustakaan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m: any) => (
                      <SelectItem key={m.member_id || m.id} value={String(m.member_id || m.id)}>
                        {m.name} ({m.member_code || m.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ─── Pilih Peminjam (hanya untuk Return) ─── */}
            {mode === 'return' && scannedBook?.active_loans && scannedBook.active_loans.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-600">Pilih Peminjam *</Label>
                <Select
                  value={selectedLoanId?.toString() || ''}
                  onValueChange={(val) => setSelectedLoanId(Number(val))}
                >
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:ring-primary-500 rounded-xl bg-gray-50/50">
                    <SelectValue placeholder="Pilih peminjam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {scannedBook.active_loans.map((loan: any) => (
                      <SelectItem key={loan.id} value={loan.id.toString()}>
                        {loan.member?.name || loan.member_name || `Loan #${loan.id}`}
                        {loan.due_date && ` (Jatuh tempo: ${new Date(loan.due_date).toLocaleDateString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ─── Scanner Area ─── */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-neutral-600">Scan Barcode / ISBN</Label>
              <div className="relative group">
                <Input
                  placeholder="Scan ISBN Barcode di sini..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleScan()}
                  className={`w-full text-center py-6 px-4 bg-gray-50/50 border-2 border-dashed rounded-xl text-base font-medium tracking-wide transition-all focus:outline-none focus:bg-white focus:ring-4 ${
                    isScanning
                      ? 'border-primary-400 ring-primary-100/50 bg-white animate-pulse'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-50 focus:border-solid'
                  }`}
                  disabled={isScanning}
                />
                {isScanning ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                )}
              </div>
              <Button
                className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all"
                onClick={handleScan}
                disabled={isScanning || isProcessing}
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Mencari...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" /> Cari Buku
                  </span>
                )}
              </Button>
            </div>

            {/* ─── Alert ─── */}
            {alertMsg && (
              <Alert variant={alertMsg.type === 'error' ? 'destructive' : 'default'} className="rounded-xl shadow-inner animate-fade-in">
                <AlertDescription className="flex items-center justify-between">
                  <span>{alertMsg.message}</span>
                  <button onClick={() => setAlertMsg(null)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* ─── Scanned Book Detail ─── */}
            {scannedBook && (
              <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-primary-500 animate-slide-in space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="text-3xl">📖</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{scannedBook.title}</h3>
                    <p className="text-neutral-500 text-sm">{scannedBook.author}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        scannedBook.available_copies > 0
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {scannedBook.available_copies > 0 ? '✅' : '❌'} {scannedBook.available_copies} tersedia
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">ISBN: {scannedBook.isbn || '-'}</span>
                    </div>
                    {mode === 'return' && scannedBook.active_loans && scannedBook.active_loans.length === 1 && (
                      <div className="mt-2 text-xs text-neutral-500">
                        Dipinjam oleh: <span className="font-medium text-neutral-700">
                          {scannedBook.active_loans[0]?.member?.name || scannedBook.active_loans[0]?.member_name || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className={`w-full h-11 rounded-xl font-bold transition-all shadow-sm ${
                    mode === 'return' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'
                  } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={mode === 'issue' ? handleIssue : handleReturn}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                    </span>
                  ) : mode === 'issue' ? (
                    '📤 Pinjamkan ke Member'
                  ) : (
                    '📥 Proses Pengembalian'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── KOLOM KANAN: Today's Transactions ─── */}
      <div className="lg:col-span-7">
        <Card className="shadow-sm border-gray-100/60 h-full flex flex-col">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-gray-800 text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" /> Transaksi Hari Ini
            </CardTitle>
            <Badge className="bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-full font-bold px-2.5 py-0.5">
              {todayTransactions.length} transaksi
            </Badge>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            {isErrorTx && (
              <Alert variant="destructive" className="m-4">
                <AlertDescription className="flex justify-between items-center">
                  <span>Gagal memuat daftar transaksi hari ini.</span>
                  <Button variant="outline" size="sm" onClick={() => refetchTx()}>
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-semibold text-neutral-600">Member</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Buku</TableHead>
                  <TableHead className="font-semibold text-neutral-600">Tipe</TableHead>
                  <TableHead className="font-semibold text-neutral-600 text-right">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTx ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : todayTransactions.length === 0 && !isErrorTx ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400 py-16">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-4xl">🗒️</span>
                        <p className="font-medium">Belum ada transaksi hari ini.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  todayTransactions.map((tx: any) => (
                    <TableRow key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-semibold text-neutral-800">{tx.member}</TableCell>
                      <TableCell className="text-neutral-700 font-medium max-w-[200px] truncate">{tx.book}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          tx.type === 'Issue'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-neutral-400 font-medium">
                        {tx.time || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ─── MODAL DENDA ─── */}
      <Dialog open={!!fineConfirm} onOpenChange={() => setFineConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              ⚠️ Konfirmasi Denda
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">{fineConfirm?.message}</p>
            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-sm">Total Denda:</span>
              <span className="text-2xl font-black text-red-600">
                Rp {fineConfirm?.fine?.toLocaleString('id-ID') || 0}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCloseFineModal}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold"
            >
              Selesai & Bayar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}