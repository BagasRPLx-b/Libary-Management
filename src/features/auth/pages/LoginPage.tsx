import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { useLogin } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { Mail, Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    login(data, {
      onSuccess: () => {
        navigate('/catalog', { replace: true });
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
        } else {
          setError('Terjadi kesalahan saat login.');
        }
      },
    });
  };

  return (
    /* PERBAIKAN 1: Gunakan w-screen & min-h-screen tanpa margin offset */
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-neutral-50">
      
      {/* PERBAIKAN 2: Kolom Kiri dipaksa persis 50% di layar besar (lg:w-1/2) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-neutral-50">
        
        {/* Container Form dibuat Pas di Tengah */}
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mx-auto">
              <span>📚</span> Library Management System
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-sm text-neutral-500">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sm:p-8">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* FIELD: EMAIL */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    {...register('email')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-neutral-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                        : touchedFields.email 
                          ? 'border-green-400 focus:border-green-500 focus:ring-green-50' 
                          : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                  />
                  {touchedFields.email && !errors.email && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* FIELD: PASSWORD */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full pl-9 pr-10 py-2.5 bg-neutral-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
                        : touchedFields.password 
                          ? 'border-green-400 focus:border-green-500 focus:ring-green-50' 
                          : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* REMEMBER ME & FORGOT PASSWORD */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Ingat Saya</span>
                </label>
                <Link to="/forgot-password" className="text-primary-600 hover:underline font-medium">
                  Lupa Password?
                </Link>
              </div>

              {/* BUTTON LOGIN */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>

              {/* LINK REGISTER */}
              <p className="text-center text-sm text-neutral-500 pt-2">
                Belum punya akun?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </form>
          </div>

        </div>
      </div>

      {/* PERBAIKAN 3: Kolom Kanan dipaksa persis 50% (lg:w-1/2) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="text-7xl mb-6">📖</div>
          <h2 className="text-3xl font-bold">Eksplorasi Ilmu Tanpa Batas</h2>
          <p className="text-primary-100 mt-4 text-lg leading-relaxed">
            Kelola data buku, peminjaman, dan anggota perpustakaan secara modern, cepat, dan terintegrasi dalam satu platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm">📚 1.000+ Buku</span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm">👥 500+ Anggota</span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm">🔄 Real-time</span>
          </div>
        </div>
      </div>

    </div>
  );
}