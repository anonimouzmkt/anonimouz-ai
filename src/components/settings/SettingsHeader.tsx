import { Settings as SettingsIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "@/hooks/useTranslation";

interface SettingsHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
}

export const SettingsHeader = ({ isDarkMode, toggleTheme }: SettingsHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-between pb-6 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <SettingsIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{t("settings")}</h1>
      </div>
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </div>
  );
};