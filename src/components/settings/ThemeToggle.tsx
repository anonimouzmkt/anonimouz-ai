import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle = ({ isDarkMode, toggleTheme }: ThemeToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
    </div>
  );
};