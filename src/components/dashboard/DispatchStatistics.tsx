import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send } from "lucide-react";
import { MetricCard } from "./MetricCard";

interface DispatchStatisticsProps {
  aiDispatches: number;
  normalDispatches: number;
}

export function DispatchStatistics({ aiDispatches, normalDispatches }: DispatchStatisticsProps) {
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
        </div>
      </CardContent>
    </Card>
  );
}