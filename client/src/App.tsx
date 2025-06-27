import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin";
import PrivateAccess from "@/components/PrivateAccess";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Check if user is authorized for private app access
  const authorizedEmails = ['varunsatthu@gmail.com'];
  const userEmail = (user as any)?.email;
  const isAuthorized = isAuthenticated && userEmail && authorizedEmails.includes(userEmail);

  return (
    <Switch>
      <Route path="/" component={isAuthorized ? Dashboard : PrivateAccess} />
      <Route path="/dashboard" component={isAuthorized ? Dashboard : PrivateAccess} />
      <Route path="/admin" component={isAuthorized ? AdminDashboard : PrivateAccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
