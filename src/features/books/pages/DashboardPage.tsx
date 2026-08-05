import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Repeat } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.name || 'User'}
        </h1>
        <p className="text-gray-500 mt-1">
          Anda login sebagai <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-500 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Buku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-primary-600">-</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-800">-</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-neutral-500 flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Peminjaman Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-800">-</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Katalog Buku</h3>
              <p className="text-sm text-gray-500">Jelajahi koleksi buku</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profil Saya</h3>
              <p className="text-sm text-gray-500">Lihat profil & riwayat</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}