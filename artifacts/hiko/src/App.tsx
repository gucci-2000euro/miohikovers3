import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/BottomNav";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Pages
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import RunSession from "@/pages/run";
import RoutesList from "@/pages/routes";
import RouteDetail from "@/pages/route-detail";
import Challenges from "@/pages/challenges";
import Social from "@/pages/social";
import SocialNew from "@/pages/social-new";
import Friends from "@/pages/friends";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user && location !== "/auth") {
      setLocation("/auth");
    }
  }, [user, location, setLocation]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/">
        <AuthGuard><Home /></AuthGuard>
      </Route>
      <Route path="/routes">
        <AuthGuard><RoutesList /></AuthGuard>
      </Route>
      <Route path="/routes/:id">
        <AuthGuard><RouteDetail /></AuthGuard>
      </Route>
      <Route path="/challenges">
        <AuthGuard><Challenges /></AuthGuard>
      </Route>
      <Route path="/social">
        <AuthGuard><Social /></AuthGuard>
      </Route>
      <Route path="/social/new">
        <AuthGuard><SocialNew /></AuthGuard>
      </Route>
      <Route path="/social/friends">
        <AuthGuard><Friends /></AuthGuard>
      </Route>
      <Route path="/profile">
        <AuthGuard><Profile /></AuthGuard>
      </Route>
      <Route path="/run/:routeId">
        <AuthGuard><RunSession /></AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-hiko-deep relative overflow-hidden text-foreground">
            <Router />
            <BottomNav />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
