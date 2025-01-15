import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DeleteDataButton } from "./DeleteDataButton";
import { LatestDispatchList } from "./LatestDispatchList";

interface DispatchStatisticsProps {
  aiDispatches: number;
  normalDispatches: number;
  latestDispatchResults?: {
    contact_name: string;
    contact_phone: string;
    status: string;
  }[];
}

export function DispatchStatistics({ aiDispatches, normalDispatches, latestDispatchResults }: DispatchStatisticsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Estatísticas de Disparos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Com I.A."
              value={aiDispatches}
              icon={Bot}
              iconClassName="text-primary"
            />
            <MetricCard
              title="Normais"
              value={normalDispatches}
              icon={Send}
              iconClassName="text-muted-foreground"
            />
          </div>

          {latestDispatchResults && latestDispatchResults.length > 0 && (
            <LatestDispatchList results={latestDispatchResults} />
          )}

          <div className="flex gap-2 mt-4">
            <DeleteDataButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}