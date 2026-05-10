import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Compass, Eye, EyeOff, MapPin } from "lucide-react";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex bg-[#eef1f8]">
      {/* Left - Hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=85"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Traveloop</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              The world is<br />waiting for you.
            </h2>
            <p className="text-white/70 text-base max-w-sm">
              Plan multi-city trips, discover hidden gems, and travel smarter with AI-powered recommendations.
            </p>
            <div className="flex gap-6 mt-8">
              {[
                { number: "10k+", label: "Trips Planned" },
                { number: "150+", label: "Destinations" },
                { number: "4.9", label: "User Rating" },
              ].map(({ number, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{number}</div>
                  <div className="text-white/60 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-[420px] flex-shrink-0 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Traveloop</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm">Enter your credentials to continue planning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>

          {/* Footer note */}
          <div className="mt-12 flex items-center gap-2 text-gray-400 text-xs">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Plan smarter. Travel better. Discover more.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
