import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import RoleRoute from '@/features/auth/components/RoleRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const CatalogPage = lazy(() => import('@/features/books/pages/CatalogPage'));
const BookDetailPage = lazy(() => import('@/features/books/pages/BookDetailPage'));
const CirculationPage = lazy(() => import('@/features/loans/pages/CirculationPage'));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage'));
const ProfilePage = lazy(() => import('@/features/members/pages/ProfilePage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const MemberLoansPage = lazy(() => import('@/features/members/pages/MemberLoansPage'));
const ActiveLoansPage = lazy(() => import('@/features/loans/pages/ActiveLoansPage'));
const MemberPenaltySummary = lazy(() => import('@/features/reports/pages/MemberPenaltySummary'));

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
        element: <AppLayout />,
        children: [
          { path: '/catalog', element: <CatalogPage /> },
          { path: '/books/:id', element: <BookDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/my-loans', element: <MemberLoansPage /> },
          {
            element: <RoleRoute allowedRoles={['Admin', 'Staff']} />,
            children: [
              { path: '/circulation', element: <CirculationPage /> },
              { path: '/active-loans', element: <ActiveLoansPage /> },
              { path: '/members', element: <MembersPage /> },
              { path: '/reports', element: <ReportsPage /> },
              { path: '/member-penalty-summary', element: <MemberPenaltySummary /> },
            ],
          },
          { index: true, element: <Navigate to="/catalog" replace /> },
          { path: '*', element: <Navigate to="/catalog" replace /> },
        ],
      },
    ],
  },
]);