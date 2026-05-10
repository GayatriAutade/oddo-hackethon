import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, useGetMe, useLogin, useSignup, useLogout, UserLoginInput, UserSignupInput, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { initApiClient } from "@/lib/api-client";

// Initialize the API client immediately
initApiClient();

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: UserLoginInput) => Promise<void>;
  signup: (data: UserSignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("traveloop_token"));
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: isUserLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (error) {
      setToken(null);
      localStorage.removeItem("traveloop_token");
    }
  }, [error]);

  const login = async (data: UserLoginInput) => {
    try {
      const res = await loginMutation.mutateAsync({ data });
      localStorage.setItem("traveloop_token", res.token);
      setToken(res.token);
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const signup = async (data: UserSignupInput) => {
    try {
      const res = await signupMutation.mutateAsync({ data });
      localStorage.setItem("traveloop_token", res.token);
      setToken(res.token);
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const logoutAction = async () => {
    try {
      if (token) await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("traveloop_token");
      setToken(null);
      setLocation("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        token,
        isLoading: isUserLoading || loginMutation.isPending || signupMutation.isPending,
        login,
        signup,
        logout: logoutAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
