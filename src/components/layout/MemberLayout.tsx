// src/components/layout/MemberLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, BookOpen, BookCheck, User } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ===== SIDEBAR KIRI ===== */}
      <aside className="w-[72px] md:w-[220px] bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm z-30">
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <Link to="/catalog" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="hidden md:inline text-xl font-bold text-gray-800">Perpustakaan</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">Katalog</span>
          </NavLink>

          <NavLink
            to="/my-loans"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <BookCheck className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">Peminjaman Saya</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">Profil</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== KONTEN UTAMA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 👇 NAVBAR SEDERHANA - Hanya Logo + User */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Logo kecil di navbar (opsional) */}
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span className="text-sm font-semibold text-gray-600 hidden sm:inline">
                Perpustakaan Digital
              </span>
            </div>

            {/* User Info */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.name}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-400">
          © 2026 Perpustakaan Digital. All rights reserved.
        </footer>
      </div>
    </div>
  );
}