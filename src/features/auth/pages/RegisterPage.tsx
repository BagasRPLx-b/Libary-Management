import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { useRegister } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: registerUser, isPending } = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    registerUser(data, {
      onSuccess: () => {
        navigate('/login', { replace: true });
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
        } else {
          setError('Terjadi kesalahan saat pendaftaran.');
        }
      },
    });
  };

  return (
    /* h-screen & overflow-hidden kunci utama agar tidak bisa discroll sama sekali */
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      
      {/* ===== KOLOM KIRI - FORM REGISTER ===== */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-6 py-4 bg-neutral-50">
        <div className="w-full max-w-sm space-y-3">
          
          {/* Header Ringkas */}
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mx-auto">
              <span>📚</span> Library Management System
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Buat Akun Baru
            </h1>
            <p className="text-xs text-neutral-500">
              Daftar untuk menjadi anggota perpustakaan
            </p>
          </div>

          {/* Card Form Ringkas */}
          <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-5">
            {error && (
              <Alert variant="destructive" className="mb-3 py-1.5 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
              
              {/* NAMA LENGKAP */}
              <div className="space-y-0.5">
                <label htmlFor="name" className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    {...register('name')}
                    className={`w-full pl-8 pr-3 py-1.5 bg-neutral-50 border rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.name ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[10px]">{errors.name.message}</p>}
              </div>

              {/* EMAIL */}
              <div className="space-y-0.5">
                <label htmlFor="email" className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    {...register('email')}
                    className={`w-full pl-8 pr-3 py-1.5 bg-neutral-50 border rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px]">{errors.email.message}</p>}
              </div>

              {/* NOMOR TELEPON */}
              <div className="space-y-0.5">
                <label htmlFor="phone" className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="081234567890"
                    {...register('phone')}
                    className={`w-full pl-8 pr-3 py-1.5 bg-neutral-50 border rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.phone ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[10px]">{errors.phone.message}</p>}
              </div>

              {/* KATA SANDI */}
              <div className="space-y-0.5">
                <label htmlFor="password" className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    {...register('password')}
                    className={`w-full pl-8 pr-8 py-1.5 bg-neutral-50 border rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.password ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px]">{errors.password.message}</p>}
              </div>

              {/* KONFIRMASI KATA SANDI */}
              <div className="space-y-0.5">
                <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ketik ulang password"
                    {...register('confirmPassword')}
                    className={`w-full pl-8 pr-8 py-1.5 bg-neutral-50 border rounded-md text-xs focus:bg-white focus:outline-none focus:ring-1 transition-all ${
                      errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px]">{errors.confirmPassword.message}</p>}
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full h-9 mt-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md shadow-sm transition-all duration-200 text-xs"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mendaftarkan...
                  </span>
                ) : (
                  'Buat Akun'
                )}
              </Button>

              {/* LINK LOGIN */}
              <p className="text-center text-[11px] text-neutral-500 pt-1">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>

        </div>
      </div>

      {/* ===== KOLOM KANAN - BANNER ===== */}
      <div className="hidden lg:flex lg:w-1/2 h-full items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-white text-center max-w-sm">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold">Bergabunglah dengan Komunitas Pembaca</h2>
          <p className="text-primary-100 mt-2 text-xs leading-relaxed">
            Daftarkan diri Anda sekarang untuk mulai mengakses jutaan koleksi buku dan mengelola sirkulasi peminjaman dengan sangat mudah.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] backdrop-blur-sm">📚 Akses 24/7</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] backdrop-blur-sm">💳 Gratis</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] backdrop-blur-sm">🔄 Mudah</span>
          </div>
        </div>
      </div>

    </div>
  );
}