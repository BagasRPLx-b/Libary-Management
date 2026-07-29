import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, User, LogOut, ChevronsUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';

// Daftar penulis dari sample (nanti bisa dari API)
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
      {/* Navbar Horizontal */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Logo */}
          <Link to="/catalog" className="text-xl font-bold text-gray-800 flex-shrink-0">
            📚 LMS
          </Link>

          {/* Search & Filter Section */}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap order-last md:order-none w-full md:w-auto mt-2 md:mt-0">
            {/* Input Pencarian */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari judul buku..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Dropdown Penulis (Searchable) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 text-sm font-normal">
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
                <Button variant="outline" className="h-10 gap-2 text-sm font-normal">
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

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
              <User className="h-4 w-4" />
              <span>{user?.name ?? 'Member'}</span>
              <span className="text-xs text-gray-500 capitalize">({user?.role})</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-sm text-gray-500">
        © 2025 Library Management System. All rights reserved.
      </footer>
    </div>
  );
}