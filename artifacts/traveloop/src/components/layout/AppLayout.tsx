import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home, Compass, Map, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Trips", href: "/trips", icon: Map },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "AI Assistant", href: "/ai", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-primary">Traveloop</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full w-full max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
