import { Home, Tv, LineChart, Activity } from "lucide-react";
import Index from "./pages/Index.tsx";
import LiveTV from "./pages/LiveTV.tsx";
import LiveTV2 from "./pages/LiveTV2.tsx";
import HistoricalData from "./pages/HistoricalData.tsx";

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
  {
    title: "Live TV 2",
    to: "/live-tv-2",
    icon: <Activity className="h-4 w-4" />,
    page: <LiveTV2 />,
  },
  {
    title: "Tool",
    to: "/historical-data",
    icon: <LineChart className="h-4 w-4" />,
    page: <HistoricalData />,
  },
];
