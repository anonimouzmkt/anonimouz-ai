import { ReactNode } from "react";

interface SettingsContainerProps {
  children: ReactNode;
}

export const SettingsContainer = ({ children }: SettingsContainerProps) => {
  return (
    <div className="flex-1 p-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        {children}
      </div>
    </div>
  );
};