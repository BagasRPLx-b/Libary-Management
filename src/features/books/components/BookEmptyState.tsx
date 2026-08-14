import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BookEmptyStateProps {
  isAdminOrStaff: boolean;
  onAddFirst: () => void;
}

export function BookEmptyState({ isAdminOrStaff, onAddFirst }: BookEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <span className="text-6xl">📚</span>
      <h3 className="text-lg font-bold text-gray-800">Belum ada buku di katalog</h3>
      <p className="text-sm text-neutral-500">Mulai mengisi perpustakaan dengan menambahkan buku baru.</p>
      {isAdminOrStaff && (
        <Button onClick={onAddFirst} className="rounded-lg gap-2 mt-2">
          <Plus className="h-4 w-4" /> Tambah Buku Pertama
        </Button>
      )}
    </div>
  );
}
