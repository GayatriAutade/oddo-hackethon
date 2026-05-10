import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Map, Compass, User as UserIcon, Plus, Sparkles, LogOut } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Trips", href: "/trips", icon: Map },
    { name: "Discover", href: "/explore", icon: Compass },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex h-screen bg-[#eef1f8] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white flex flex-col shadow-sm border-r border-gray-100">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight text-base">Traveloop</div>
              <div className="text-[10px] text-gray-400 leading-tight">Modern Human Traveler</div>
            </div>
          </div>
        </div>

        {/* User Avatar */}
        <div className="px-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate">{user?.name || "Traveler"}</div>
              <div className="text-[11px] text-gray-400 truncate">{user?.email || ""}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* New Trip Button */}
        <div className="px-3 pb-3">
          <Link href="/trips/new">
            <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-2.5 rounded-lg shadow-sm transition-colors">
              <Plus className="h-4 w-4" />
              New Trip
            </button>
          </Link>
        </div>

        {/* Bottom links */}
        <div className="px-3 pb-5 pt-2 border-t border-gray-100 space-y-0.5">
          <Link href="/ai" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
