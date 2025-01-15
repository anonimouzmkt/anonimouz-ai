import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  handleRefresh: () => void;
}

export function DashboardHeader({ 
  autoRefresh, 
  setAutoRefresh, 
  handleRefresh 
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard de Disparos</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? 'Pausar Atualização' : 'Retomar Atualização'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}