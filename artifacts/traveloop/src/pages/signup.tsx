import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function Signup() {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Passcode must be at least 6 characters");
      return;
    }
    try {
      await signup({ name, email, password });
    } catch {
      setError("Registration failed. ID may already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      
      {/* Decorative background elements */}
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] pointer-events-none" />

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
          <p className="text-secondary font-mono mt-4 uppercase tracking-[0.2em] text-sm">System Registration</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="glass-panel p-8 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-secondary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-secondary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Operative Name</Label>
                <Input
                  id="name"
                  placeholder="JANE DOE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-secondary focus-visible:border-secondary transition-all uppercase placeholder:text-muted-foreground/30"
                />
              </div>
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
                  className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-secondary focus-visible:border-secondary transition-all uppercase placeholder:text-muted-foreground/30"
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
                  autoComplete="new-password"
                  className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-secondary focus-visible:border-secondary transition-all"
                />
              </div>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border border-destructive/50 bg-destructive/10 text-destructive font-mono text-xs uppercase">
                  [ERR] {error}
                </motion.div>
              )}
              <Button type="submit" className="w-full h-12 rounded-none font-mono uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-secondary shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-all" disabled={isLoading}>
                {isLoading ? "Processing..." : "Create Identity"}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Already registered?{" "}
                <Link href="/login" className="text-secondary hover:text-secondary/80 transition-colors underline decoration-secondary/50 underline-offset-4">
                  Access Portal
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
