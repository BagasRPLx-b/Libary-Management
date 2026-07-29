import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Repeat, 
  Users, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { to: '/catalog',      label: 'Catalog',      icon: BookOpen,  roles: ['Admin', 'Staff', 'Member'] },
  { to: '/circulation',  label: 'Circulation',  icon: Repeat,    roles: ['Admin', 'Staff'] },
  { to: '/members',      label: 'Members',      icon: Users,     roles: ['Admin', 'Staff'] },
  { to: '/reports',      label: 'Reports',      icon: BarChart3, roles: ['Admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const visibleMenu = menuItems.filter(item => 
    item.roles.includes(user?.role ?? '')
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">📚 LMS</h2>
        {user && (
          <p className="text-xs text-gray-500 mt-1">
            {user.name} ({user.role})
          </p>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleMenu.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:text-red-600"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}