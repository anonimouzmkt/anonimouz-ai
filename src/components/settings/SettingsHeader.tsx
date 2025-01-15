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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
      </div>
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </div>
  );
};