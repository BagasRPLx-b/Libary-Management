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

        {/* Avatar user + dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-700 leading-none mb-0.5">{user?.name}</p>
              <p className="text-[10px] text-gray-500 capitalize leading-none">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-50 sm:hidden">
                <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="h-4 w-4 text-gray-400" />
                <span>Profil saya</span>
              </Link>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}