import { Home, MessageSquare, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

export const SidebarNavigation = () => {
  return (
    <nav className="space-y-2">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="hidden md:inline">Dashboard</span>
      </NavLink>
      <NavLink
        to="/whatsapp"
        className={({ isActive }) =>
          `flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`
        }
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden md:inline">WhatsApp</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span className="hidden md:inline">Settings</span>
      </NavLink>
    </nav>
  );
};