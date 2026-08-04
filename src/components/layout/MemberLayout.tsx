import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, User, LogOut, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

// Daftar penulis dari sample
const ALL_AUTHORS = [
  'F. Scott Fitzgerald',
  'Harper Lee',
  'George Orwell',
  'Jane Austen',
  'J.D. Salinger',
  'Herman Melville',
  'Leo Tolstoy',
  'William Shakespeare',
  'Homer',
  'Fyodor Dostoevsky',
];

const CATEGORIES = [
  'Fiction',
  'Dystopian',
  'Romance',
  'Adventure',
  'Historical',
  'Drama',
  'Epic',
  'Psychological',
];

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State lokal untuk search dan filter
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [showDropdown, setShowDropdown] = useState(false);

  // Update URL query string setiap kali nilai berubah
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (author && author !== 'all') params.set('author', author);
    if (category && category !== 'all') params.set('category', category);

    // Navigasi dengan replace agar tidak menumpuk history
    navigate(`/catalog?${params.toString()}`, { replace: true });
  }, [search, author, category, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Horizontal (Background: Putih dengan shadow-sm) */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-4 md:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo (Kiri) */}
          <Link to="/catalog" className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-shrink-0 hover:text-primary-600 transition-colors">
            <span>📚</span> Perpustakaan
          </Link>

          {/* Search & Filter Section (Tengah: Search bar besar) */}
          <div className="flex-1 max-w-2xl mx-4 flex items-center gap-2">
            {/* Input Pencarian Besar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari judul buku..."
                className="pl-9 h-10 w-full bg-gray-50 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Dropdown Penulis (Searchable) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 text-sm font-normal bg-white border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm hidden md:flex">
                  {author === 'all' ? 'Penulis' : author}
                  <ChevronsUpDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari penulis..." />
                  <CommandList>
                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setAuthor('all')}
                        className={author === 'all' ? 'bg-blue-50' : ''}
                      >
                        Semua Penulis
                      </CommandItem>
                      {ALL_AUTHORS.map((a) => (
                        <CommandItem
                          key={a}
                          onSelect={() => setAuthor(a)}
                          className={author === a ? 'bg-blue-50' : ''}
                        >
                          {a}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Dropdown Kategori */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 text-sm font-normal bg-white border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm hidden md:flex">
                  {category === 'all' ? 'Kategori' : category}
                  <ChevronsUpDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setCategory('all')}
                        className={category === 'all' ? 'bg-blue-50' : ''}
                      >
                        Semua Kategori
                      </CommandItem>
                      {CATEGORIES.map((cat) => (
                        <CommandItem
                          key={cat}
                          onSelect={() => setCategory(cat)}
                          className={category === cat ? 'bg-blue-50' : ''}
                        >
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* User Info & Dropdown (Kanan) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © 2026 Library Management System. All rights reserved.
      </footer>
    </div>
  );
}