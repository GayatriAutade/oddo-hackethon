import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useListTrips, getGetMeQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Mail, Camera, Terminal, Shield, Activity, MapPin } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: trips } = useListTrips();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", avatarUrl: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", avatarUrl: user.avatarUrl ?? "" });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        data: { name: form.name, avatarUrl: form.avatarUrl || null },
      });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setEditing(false);
      toast({ title: "[SYS]", description: "Identity parameters updated." });
    } catch {
      toast({ title: "[ERR]", description: "Modification rejected.", variant: "destructive" });
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "OP";

  return (
    <AppLayout>
      <motion.div 
        className="p-6 lg:p-12 max-w-4xl mx-auto space-y-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-5xl font-serif font-bold tracking-tight text-foreground uppercase">
              Operative <span className="text-primary">Profile</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-secondary" /> Clearance Level: MAXIMUM
            </p>
          </div>
          <div className="font-mono text-[10px] text-primary uppercase tracking-widest border border-primary/30 bg-primary/10 px-4 py-2 flex items-center gap-2">
            <Terminal className="h-3 w-3" /> Identity Confirmed
          </div>
        </motion.div>

        {/* ID Card */}
        <motion.div variants={item}>
          <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden group border-l-4 border-l-primary">
            <div className="absolute top-0 right-0 w-64 h-full bg-[linear-gradient(90deg,transparent,rgba(0,212,232,0.05))] pointer-events-none" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-none border-2 border-primary shadow-[0_0_20px_rgba(0,212,232,0.3)]">
                  <AvatarImage src={user?.avatarUrl ?? ""} alt={user?.name ?? ""} className="object-cover mix-blend-luminosity" />
                  <AvatarFallback className="text-4xl font-mono bg-background text-primary rounded-none border border-primary/50">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 shadow-sm">
                  ACTIVE
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left w-full">
                <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2 border-b border-white/10 pb-2 inline-block md:block">
                  Designation / ID
                </div>
                <h2 className="text-4xl font-serif font-bold uppercase tracking-tight mb-2">{user?.name || "UNNAMED OPERATIVE"}</h2>
                <p className="font-mono text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Mail className="h-4 w-4 text-secondary" /> {user?.email}
                </p>
                
                {user?.createdAt && (
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 inline-block">
                    Inducted: {format(new Date(user.createdAt), "MM.dd.yyyy")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Telemetry */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="h-16 w-16 text-primary" /></div>
            <CardContent className="p-6 text-center md:text-left relative z-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Total Missions</p>
              <p className="text-5xl font-serif font-bold text-primary">{trips?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><MapPin className="h-16 w-16 text-secondary" /></div>
            <CardContent className="p-6 text-center md:text-left relative z-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Zones Breached</p>
              <p className="text-5xl font-serif font-bold text-secondary">
                {trips?.reduce((sum, t) => sum + (t.destinationCount ?? 0), 0) ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Globe className="h-16 w-16 text-white" /></div>
            <CardContent className="p-6 text-center md:text-left relative z-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Declassified Records</p>
              <p className="text-5xl font-serif font-bold text-foreground">
                {trips?.filter((t) => t.isPublic).length ?? 0}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="glass-panel border-white/10 rounded-none h-full">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="font-mono text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Identity Modification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Designation</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="ENTER DESIGNATION"
                        required
                        className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="avatarUrl" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 text-primary" /> Visual Asset (URL)
                      </Label>
                      <Input
                        id="avatarUrl"
                        type="url"
                        value={form.avatarUrl}
                        onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                        placeholder="HTTPS://..."
                        className="bg-background/50 border-white/10 rounded-none h-12 font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                      />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <Button type="submit" disabled={updateProfile.isPending} className="flex-1 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] h-12">
                        {updateProfile.isPending ? "PROCESSING..." : "Apply Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(false)} className="w-1/3 rounded-none font-mono uppercase tracking-widest border-white/20 hover:bg-white/10 h-12">
                        Abort
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-white/5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 md:mb-0">Current Designation</span>
                        <span className="font-serif text-xl font-bold uppercase">{user?.name}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-white/5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 md:mb-0">Registered Identity</span>
                        <span className="font-mono text-sm uppercase">{user?.email}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(true)} 
                      className="w-full rounded-none font-mono uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/10 hover:text-primary h-12"
                    >
                      Initialize Modification Protocol
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Control */}
          <motion.div variants={item}>
            <Card className="glass-panel border-destructive/30 rounded-none h-full relative overflow-hidden bg-destructive/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
              <CardHeader className="border-b border-destructive/20 pb-4">
                <CardTitle className="font-mono text-sm uppercase tracking-widest text-destructive flex items-center gap-2">
                  <Terminal className="h-4 w-4" /> System Control
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <LogOut className="h-12 w-12 text-destructive/40 mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
                  Terminate current session and clear local authorization tokens.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={logout} 
                  className="w-full rounded-none font-mono uppercase tracking-widest h-12 gap-3 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sever Connection
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
