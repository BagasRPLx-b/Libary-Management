import { useAuth } from '@/context/AuthContext';
import PrivateLayout from './PrivateLayout'; // untuk Admin/Staff
import MemberLayout from './MemberLayout';   // untuk Member

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) return null; // tidak akan terjadi karena sudah lewat ProtectedRoute

  return user.role === 'Member' ? <MemberLayout /> : <PrivateLayout />;
}