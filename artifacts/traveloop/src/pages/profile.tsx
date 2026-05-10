import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useListTrips, getGetMeQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Mail, Camera, MapPin, Globe, Award } from "lucide-react";
import { format } from "date-fns";

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
      toast({ title: "Profile updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const stats = [
    { label: "Total Trips", value: trips?.length ?? 0, icon: Globe, color: "text-blue-600 bg-blue-50" },
    { label: "Cities Planned", value: trips?.reduce((sum, t) => sum + (t.destinationCount ?? 0), 0) ?? 0, icon: MapPin, color: "text-green-600 bg-green-50" },
    { label: "Public Trips", value: trips?.filter((t) => t.isPublic).length ?? 0, icon: Award, color: "text-primary bg-primary/10" },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your account and preferences</p>
        </div>

        {/* User card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />{user?.email}
            </p>
            {user?.createdAt && (
              <p className="text-xs text-gray-400 mt-1">
                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors flex-shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Edit profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Edit Profile
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Display Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                  <Camera className="h-3 w-3" /> Avatar URL
                </label>
                <input
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 transition-all"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: "Name", value: user?.name },
                { label: "Email", value: user?.email },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
