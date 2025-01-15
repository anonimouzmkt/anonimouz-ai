import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SettingsContainerProps {
  children: ReactNode;
}

export const SettingsContainer = ({ children }: SettingsContainerProps) => {
  return (
    <div className="flex-1 p-8 bg-background">
      <Card className="max-w-3xl mx-auto p-6 space-y-8 bg-card/50 backdrop-blur-sm border-border/50">
        {children}
      </Card>
    </div>
  );
};