import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { navItems } from "./nav-items";
import { Button } from "@/components/ui/button";
import { Home, Tv, LineChart, Activity } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background transition-colors">
            {/* Navigation Bar */}
            <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                  <div className="flex items-center gap-2">
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
                    <Link to="/live-tv-2">
                      <Button variant="ghost" size="sm">
                        <Activity className="mr-2 h-4 w-4" />
                        Live TV2
                      </Button>
                    </Link>
                    <Link to="/historical-data">
                      <Button variant="ghost" size="sm">
                        <LineChart className="mr-2 h-4 w-4" />
                        Tooling
                      </Button>
                    </Link>
                  </div>
                  <ThemeToggle />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
