// src/components/layout/AppLayout.tsx
import { useAuth } from '@/context/AuthContext';
import PrivateLayout from './PrivateLayout';
import MemberLayout from './MemberLayout';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const { user } = useAuth();

  // Jika user adalah Member, pakai MemberLayout (dengan sidebar)
  if (user?.role === 'Member') {
    return <MemberLayout />;
  }

  // Jika Admin/Staff, pakai PrivateLayout (dengan sidebar)
  return <PrivateLayout />;
}