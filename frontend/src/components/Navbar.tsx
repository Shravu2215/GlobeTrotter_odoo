import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import Badge from "@/components/ui/Badge";

export default function Navbar() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold tracking-tight">
        Team<span className="text-accent">.App</span>
      </h1>

      <div className="flex items-center gap-4">
        <Dropdown
          trigger={
            <button className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-surfaceAlt transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium">Notifications</p>
          </div>
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted">You're all caught up 🎉</p>
          </div>
        </Dropdown>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-surfaceAlt transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
                {initials || <User size={14} />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm leading-tight">{user?.name}</p>
                <Badge variant="outline" className="mt-0.5">{user?.role || "Member"}</Badge>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <DropdownItem><User size={14} /> Profile</DropdownItem>
          <DropdownItem><Settings size={14} /> Settings</DropdownItem>
          <DropdownItem onClick={logout} className="text-red-400 hover:text-red-300">
            <LogOut size={14} /> Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}