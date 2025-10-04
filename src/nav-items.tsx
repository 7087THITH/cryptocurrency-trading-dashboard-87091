import { Home, Tv, LineChart, Activity, TrendingUp, LogIn, Database } from "lucide-react";
import Index from "./pages/Index.tsx";
import LiveTV from "./pages/LiveTV.tsx";
import LiveTV2 from "./pages/LiveTV2.tsx";
import LiveTV3 from "./pages/LiveTV3.tsx";
import HistoricalData from "./pages/HistoricalData.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import SQLEditor from "./pages/SQLEditor.tsx";

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
    title: "Live TV 3",
    to: "/live-tv-3",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <LiveTV3 />,
  },
  {
    title: "Tool",
    to: "/historical-data",
    icon: <LineChart className="h-4 w-4" />,
    page: <HistoricalData />,
  },
  {
    title: "SQL Editor",
    to: "/sql-editor",
    icon: <Database className="h-4 w-4" />,
    page: <SQLEditor />,
  },
  {
    title: "Login",
    to: "/auth",
    icon: <LogIn className="h-4 w-4" />,
    page: <Auth />,
  },
  {
    title: "Reset Password",
    to: "/reset-password",
    icon: <LogIn className="h-4 w-4" />,
    page: <ResetPassword />,
  },
];
