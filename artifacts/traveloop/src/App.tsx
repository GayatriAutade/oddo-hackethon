import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Trips from "@/pages/trips/index";
import NewTrip from "@/pages/trips/new";
import TripDetail from "@/pages/trips/detail";
import EditTrip from "@/pages/trips/edit";
import Itinerary from "@/pages/trips/itinerary";
import Budget from "@/pages/trips/budget";
import Packing from "@/pages/trips/packing";
import Notes from "@/pages/trips/notes";
import Explore from "@/pages/explore";
import AI from "@/pages/ai";
import Profile from "@/pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: () => ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/trips/new" component={() => <ProtectedRoute component={NewTrip} />} />
      <Route path="/trips/:id/edit" component={() => <ProtectedRoute component={EditTrip} />} />
      <Route path="/trips/:id/itinerary" component={() => <ProtectedRoute component={Itinerary} />} />
      <Route path="/trips/:id/budget" component={() => <ProtectedRoute component={Budget} />} />
      <Route path="/trips/:id/packing" component={() => <ProtectedRoute component={Packing} />} />
      <Route path="/trips/:id/notes" component={() => <ProtectedRoute component={Notes} />} />
      <Route path="/trips/:id" component={() => <ProtectedRoute component={TripDetail} />} />
      <Route path="/trips" component={() => <ProtectedRoute component={Trips} />} />
      <Route path="/explore" component={() => <ProtectedRoute component={Explore} />} />
      <Route path="/ai" component={() => <ProtectedRoute component={AI} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
