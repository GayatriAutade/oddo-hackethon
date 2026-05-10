import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home, Compass, Map, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Trips", href: "/trips", icon: Map },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "AI", href: "/ai", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-background relative overflow-hidden dark text-foreground">
      <div className="scanline" />
      <div className="noise-overlay" />
      
      {/* Floating Jet-style Bottom/Side Nav for large screens */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 p-4 glass-panel rounded-full shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif italic font-bold text-xl mb-4 shadow-[0_0_15px_rgba(0,255,255,0.5)]">
          T
        </div>
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className="relative group p-3">
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/20 rounded-full border border-primary/50"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  
                  {/* Tooltip */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-background border border-border text-xs font-mono uppercase tracking-wider opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 pt-4 border-t border-border/50">
          <button onClick={() => logout()} className="p-3 text-muted-foreground hover:text-destructive transition-colors relative group">
            <LogOut className="h-5 w-5" />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-background border border-border text-xs font-mono uppercase tracking-wider opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none">
              Logout
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/5 flex items-center justify-around p-4 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className={`p-2 rounded-full ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
              <item.icon className="h-6 w-6" />
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full relative z-10 lg:pl-32 pb-24 lg:pb-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
