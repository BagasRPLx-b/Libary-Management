import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RoleRouteProps {
  allowedRoles: string[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to="/catalog" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;