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
    <aside className="w-[64px] md:w-[240px] bg-gradient-to-b from-primary-900 to-primary-800 text-white min-h-screen flex flex-col sticky top-0 transition-all duration-300 border-r border-primary-950/20 shadow-lg">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-center md:justify-start">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white tracking-wide">
          <span>📚</span> <span className="hidden md:inline">LMS</span>
        </h1>
      </div>

      {/* Menu items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleMenu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm font-semibold' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              } justify-center md:justify-start`
            }
            title={item.label}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="hidden md:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-white/10">
        <Button 
          variant="ghost" 
          className="w-full justify-center md:justify-start text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={logout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 md:mr-2" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </aside>
  );
}