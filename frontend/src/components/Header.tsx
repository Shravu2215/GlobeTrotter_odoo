import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Home, Briefcase, Compass, CalendarDays, Users, User, Bell, Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',      path: '/dashboard',    icon: Home,        matchPaths: ['/dashboard'] },
  { label: 'My Trips',  path: '/my-trips',     icon: Briefcase,   matchPaths: ['/my-trips', '/create-trip', '/itinerary', '/view-itinerary', '/budget'] },
  { label: 'Explore',   path: '/explore',      icon: Compass,     matchPaths: ['/explore'] },
  { label: 'Calendar',  path: '/calendar',     icon: CalendarDays, matchPaths: ['/calendar'] },
  { label: 'Community', path: '/community',    icon: Users,       matchPaths: ['/community'] },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (item: NavItem) => {
    const paths = item.matchPaths ?? [item.path];
    return paths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-roamora-green flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-roamora-green hidden sm:block">
              GlobeTrotter
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-roamora-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-roamora-green hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}
          </nav>

          {/* ── Right: Bell + Profile ── */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button className="relative w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-roamora-green hover:border-roamora-green transition-colors hidden md:flex">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-roamora-green rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-roamora-green text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden lg:block max-w-[100px] truncate">
                  {user?.name ?? 'Profile'}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-roamora-green text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <ShieldCheck size={17} /> Admin
            </Link>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              <User size={17} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut size={17} /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

