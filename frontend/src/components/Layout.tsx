import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [{ label: "Dashboard", path: "/", icon: LayoutDashboard }];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-surface border-r border-border flex flex-col">
        <div className="px-5 py-6">
          <h1 className="text-lg font-semibold tracking-tight">
            Team<span className="text-accent">.App</span>
          </h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                location.pathname === path
                  ? "bg-surfaceAlt text-white"
                  : "text-muted hover:bg-surfaceAlt hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="px-3 py-4 border-t border-border">
            <p className="text-xs text-muted px-3 mb-2 truncate">{user.email}</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white w-full rounded-xl hover:bg-surfaceAlt"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 bg-base p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
