import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 grid grid-cols-1 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-none bg-primary/10 border border-primary/20 mb-8 relative">
            <Compass className="h-12 w-12 text-primary" />
            <div className="absolute inset-0 border border-primary/50 scale-110 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold font-serif text-foreground tracking-tighter uppercase">Traveloop</h1>
          <p className="text-primary font-mono mt-4 uppercase tracking-[0.2em] text-sm">System Ready . Enter Credentials</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="glass-panel p-8 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">ID / Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="OPERATIVE@TRAVELOOP.SYS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all uppercase placeholder:text-muted-foreground/30"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Passcode</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all"
                />
              </div>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border border-destructive/50 bg-destructive/10 text-destructive font-mono text-xs uppercase">
                  [ERR] {error}
                </motion.div>
              )}
              <Button type="submit" className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Initialize Session"}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Unregistered?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors underline decoration-primary/50 underline-offset-4">
                  Request Access
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
