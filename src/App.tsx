import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { navItems } from "./nav-items";
import { Button } from "@/components/ui/button";
import { Home, Tv } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {/* Navigation Bar */}
          <nav className="border-b border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <Link to="/">
                    <Button variant="ghost" size="sm">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/live-tv">
                    <Button variant="ghost" size="sm">
                      <Tv className="mr-2 h-4 w-4" />
                      Live TV
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Routes */}
          <Routes>
            {navItems.map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
