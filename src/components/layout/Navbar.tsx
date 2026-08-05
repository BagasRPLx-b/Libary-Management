import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Search, User, LogOut, ChevronDown, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <header className="bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Kiri: Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
        <Link to="/catalog" className="hover:text-primary-600 flex items-center gap-1 transition-colors">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          
          return (
            <span key={name} className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              {isLast ? (
                <span className="text-gray-800 font-semibold">{displayName}</span>
              ) : (
                <Link to={routeTo} className="hover:text-primary-600 transition-colors">
                  {displayName}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Kanan: Search bar kecil, Notifikasi bell, Avatar user + dropdown */}
      <div className="flex items-center gap-4">
        {/* Search bar kecil */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="pl-9 pr-4 py-1.5 w-44 lg:w-56 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
          />
        </div>

        {/* Notifikasi Bell dengan badge */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-all relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-1.5 border-b border-gray-100 font-semibold text-sm text-gray-800">
                Notifikasi
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 text-xs border-b border-gray-50 text-gray-600">
                  <p className="font-medium text-gray-800">Pengembalian Terlambat</p>
                  <p className="mt-0.5 text-gray-500">Buku "The Great Gatsby" melewati batas waktu.</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 text-xs text-gray-600">
                  <p className="font-medium text-gray-800">Anggota Baru</p>
                  <p className="mt-0.5 text-gray-500">Andi Susanto mendaftar hari ini.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}