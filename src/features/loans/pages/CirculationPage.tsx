import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Barcode, ArrowRightLeft, Undo2, Book as BookIcon, Loader2 } from 'lucide-react';
import { useTodayTransactions, useIssueBook, useReturnBook } from '../hooks/useCirculation';
import { useMembers } from '@/features/members/hooks/useMember';
import apiClient from '@/lib/api/client';
import type { Book } from '@/features/books/hooks/useBooks';

export default function CirculationPage() {
  const [barcode, setBarcode] = useState('');
  const [mode, setMode] = useState<'issue' | 'return'>('issue');
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [fineConfirm, setFineConfirm] = useState<{ show: boolean; message: string; fine: number } | null>(null);

  const { data: todayTransactions = [], isLoading: isLoadingTx, isError: isErrorTx, refetch: refetchTx } = useTodayTransactions();
  const { data: members = [] } = useMembers();
  
  const { mutate: issueBook, isPending: isIssuing } = useIssueBook();
  const { mutate: returnBook, isPending: isReturning } = useReturnBook();

  const handleScan = async () => {
    if (!barcode.trim()) return;
    setIsScanning(true);
    setAlertMsg(null);
    try {
      const response = await apiClient.get(`/books/scan/${barcode.trim()}`);
      const bookData = response.data?.data || response.data;
      
      if (mode === 'issue' && bookData.available_copies === 0) {
        setAlertMsg({ type: 'error', message: 'Buku tidak tersedia untuk dipinjam.' });
        setScannedBook(null);
      } else {
        setScannedBook(bookData);
        setAlertMsg({ type: 'success', message: `Buku ditemukan: ${bookData.title}` });
      }
    } catch (error: any) {
      setScannedBook(null);
      setAlertMsg({ type: 'error', message: error.response?.data?.message || 'Buku tidak ditemukan.' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = () => {
    if (!scannedBook) return;
    if (mode === 'issue') {
      if (!selectedMember) {
        setAlertMsg({ type: 'error', message: 'Silakan pilih member terlebih dahulu.' });
        return;
      }
      issueBook(
        { book_id: scannedBook.id, member_id: Number(selectedMember) },
        {
          onSuccess: () => {
            setAlertMsg({ type: 'success', message: `Buku "${scannedBook.title}" berhasil dipinjamkan.` });
            setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies - 1 } : null);
            setTimeout(() => {
              setScannedBook(null);
              setBarcode('');
              setSelectedMember('');
            }, 2000);
          },
          onError: (error: any) => {
            setAlertMsg({ type: 'error', message: error.response?.data?.message || 'Gagal memproses peminjaman.' });
          },
        }
      );
    } else {
      returnBook(
        { book_id: scannedBook.id },
        {
          onSuccess: (data: any) => {
            if (data?.fine && data.fine > 0) {
              setFineConfirm({ show: true, message: data.message || 'Pengembalian terlambat.', fine: data.fine });
            } else {
              setAlertMsg({ type: 'success', message: `Buku "${scannedBook.title}" berhasil dikembalikan.` });
              setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies + 1 } : null);
              setTimeout(() => {
                setScannedBook(null);
                setBarcode('');
              }, 2000);
            }
          },
          onError: (error: any) => {
            setAlertMsg({ type: 'error', message: error.response?.data?.message || 'Gagal memproses pengembalian.' });
          },
        }
      );
    }
  };

  const handleCloseFineModal = () => {
    setAlertMsg({ type: 'success', message: `Buku "${scannedBook?.title}" berhasil dikembalikan dengan denda.` });
    setScannedBook(prev => prev ? { ...prev, available_copies: prev.available_copies + 1 } : null);
    setFineConfirm(null);
    setScannedBook(null);
    setBarcode('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
      {/* Kolom Kiri: Scan & Sirkulasi (w: 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="shadow-subtle-md border-gray-100/60 overflow-hidden">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-lg font-bold">
              <Barcode className="h-5 w-5 text-primary-500" /> Book Circulation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Toggle Mode */}
            <div className="flex bg-neutral-100 rounded-xl p-1">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'issue'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => { setMode('issue'); setScannedBook(null); setAlertMsg(null); }}
              >
                <ArrowRightLeft className="h-4 w-4" /> 📤 Issue
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'return'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => { setMode('return'); setScannedBook(null); setAlertMsg(null); }}
              >
                <Undo2 className="h-4 w-4" /> 📥 Return
              </button>
            </div>

            {/* Pemilihan Member saat Issue */}
            {mode === 'issue' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-600">Member *</label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:ring-primary-500 rounded-xl bg-gray-50/50">
                    <SelectValue placeholder="Pilih Anggota Perpustakaan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m: any) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name} ({m.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Scanner Area */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-600">Scan Barcode / ISBN</label>
              <div className="relative group">
                <input
                  placeholder="Scan ISBN Barcode di sini..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  className={`w-full text-center py-5 px-4 bg-gray-50/50 border-2 border-dashed rounded-xl text-base font-medium tracking-wide transition-all focus:outline-none focus:bg-white focus:ring-4 ${
                    isScanning 
                      ? 'border-primary-400 ring-primary-100/50 bg-white animate-pulse' 
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-50 focus:border-solid'
                  }`}
                />
                {isScanning ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                )}
              </div>
            </div>

            <Button className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all" size="lg" onClick={handleScan} disabled={isScanning}>
              {isScanning ? 'Mencari...' : 'Cari Buku'}
            </Button>

            {/* Alert info/error */}
            {alertMsg && (
              <Alert variant={alertMsg.type === 'error' ? 'destructive' : 'default'} className="rounded-xl shadow-inner animate-fade-in">
                <AlertDescription>{alertMsg.message}</AlertDescription>
              </Alert>
            )}

            {/* Scanned Book Detail Card */}
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
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                        ✅ {scannedBook.available_copies} tersedia
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">ISBN: {scannedBook.isbn || '-'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className={`w-full h-11 rounded-xl font-bold transition-all shadow-sm ${
                    mode === 'return' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                  onClick={handleAction}
                  disabled={isIssuing || isReturning}
                >
                  {isIssuing || isReturning ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                    </span>
                  ) : mode === 'issue' ? (
                    'Pinjamkan ke Member'
                  ) : (
                    'Proses Pengembalian'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kolom Ranan: Today's Transactions (w: 7 cols) */}
      <div className="lg:col-span-7">
        <Card className="shadow-subtle-md border-gray-100/60 h-full flex flex-col">
          <CardHeader className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-gray-800 text-lg font-bold flex items-center gap-2">
              Transaksi Hari Ini
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
                  <Button variant="outline" size="sm" onClick={() => refetchTx()}>Coba Lagi</Button>
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
                            : tx.type === 'Return'
                              ? 'bg-gray-50 text-gray-600 border-gray-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-neutral-400 font-medium">{tx.time}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Konfirmasi Denda */}
      <Dialog open={!!fineConfirm} onOpenChange={() => handleCloseFineModal()}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>⚠️</span> Konfirmasi Denda
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">{fineConfirm?.message}</p>
            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl flex justify-between items-center shadow-sm">
              <span className="font-bold text-sm">Total Denda:</span>
              <span className="text-2xl font-black text-red-600">Rp {fineConfirm?.fine?.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseFineModal} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold">
              Selesai & Bayar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}