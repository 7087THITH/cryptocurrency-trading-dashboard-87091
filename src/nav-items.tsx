import { Home, Tv } from "lucide-react";
import Index from "./pages/Index.tsx";
import LiveTV from "./pages/LiveTV.tsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Live TV",
    to: "/live-tv",
    icon: <Tv className="h-4 w-4" />,
    page: <LiveTV />,
  },
];
