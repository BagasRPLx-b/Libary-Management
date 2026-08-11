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
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0055FF] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-white h-5 w-5" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-lg font-bold text-[#0055FF] leading-tight tracking-tight">LibConnect</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold leading-none mt-0.5">Management System</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 text-[#0055FF] border-l-4 border-[#0055FF]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
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
                  ? 'bg-blue-50 text-[#0055FF] border-l-4 border-[#0055FF]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
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
                  ? 'bg-blue-50 text-[#0055FF] border-l-4 border-[#0055FF]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
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
        {/* Note: Header with Search and Profile is moved to individual pages based on the design */}
        {/* We just keep an empty invisible spacer or remove it, but let's keep a tiny top padding instead */}

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