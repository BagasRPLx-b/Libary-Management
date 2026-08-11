// src/components/layout/MemberPageHeader.tsx
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

interface MemberPageHeaderProps {
  onSearch?: (value: string) => void;
  searchValue?: string;
  placeholder?: string;
}

export default function MemberPageHeader({ onSearch, searchValue, placeholder = "Cari buku, penulis, atau koleksi..." }: MemberPageHeaderProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
      {/* Search Bar */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-4 h-11 w-full bg-blue-50/50 border-transparent rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:bg-white transition-all shadow-sm"
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      {/* Right Side: Notifications & Profile */}
      <div className="flex items-center gap-6 ml-4">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800 leading-tight">
              {user?.name || 'User'}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {user?.role === 'Member' ? 'Anggota Mahasiswa' : user?.role || 'Anggota'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-300 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border border-white">
              <span className="text-sm font-bold text-primary-600">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
