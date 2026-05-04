import { NavLink } from 'react-router-dom';
import { Map, Fish, BookOpen, Users, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Map, label: 'Kort', exact: true },
  { to: '/fiskeguide', icon: Fish, label: 'Fiskeguide' },
  { to: '/fangstlog', icon: BookOpen, label: 'Fangstlog' },
  { to: '/faellesskab', icon: Users, label: 'Fællesskab' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function Navigation() {
  return (
    <nav className="bg-white border-t border-slate-200 safe-area-bottom shrink-0">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                isActive
                  ? 'text-ocean-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-ocean-100' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-ocean-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
