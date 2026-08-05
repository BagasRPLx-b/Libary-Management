import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RoleRoute from '@/features/auth/components/RoleRoute';
import CatalogPage from '@/features/books/pages/CatalogPage';
import BookDetailPage from '@/features/books/pages/BookDetailPage';
import CirculationPage from '@/features/loans/pages/CirculationPage';
import MembersPage from '@/features/members/pages/MembersPage';
import ProfilePage from '@/features/members/pages/ProfilePage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import MemberLoansPage from '@/features/members/pages/MemberLoansPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />, // 👈 Ini akan pilih layout berdasarkan role
        children: [
          { path: '/catalog', element: <CatalogPage /> },
          { path: '/books/:id', element: <BookDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/my-loans', element: <MemberLoansPage /> },
          { 
            element: <RoleRoute allowedRoles={['Admin', 'Staff']} />,
            children: [
              { path: '/circulation', element: <CirculationPage /> },
              { path: '/members', element: <MembersPage /> },
              { path: '/reports', element: <ReportsPage /> },
            ],
          },
          { index: true, element: <Navigate to="/catalog" replace /> },
        ],
      },
    ],
  },
]);