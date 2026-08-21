import { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LayoutGrid, Activity, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  path: string;
  icon: ElementType;
}

const defaultItems: SidebarItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Workspace", path: "/workspace", icon: LayoutGrid },
  { label: "Activity", path: "/activity", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
  { label: "Profile", path: "/profile", icon: User },
];

export default function Sidebar({ items = defaultItems }: { items?: SidebarItem[] }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                active ? "bg-surfaceAlt text-white" : "text-muted hover:bg-surfaceAlt hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-white w-full rounded-xl hover:bg-surfaceAlt transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}