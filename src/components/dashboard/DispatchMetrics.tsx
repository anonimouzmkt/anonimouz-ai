import { Users, CheckCircle2, XCircle, Send } from "lucide-react";
import { MetricCard } from "./MetricCard";

interface DispatchMetricsProps {
  totalContacts: number;
  successCount: number;
  errorCount: number;
}

export function DispatchMetrics({ totalContacts, successCount, errorCount }: DispatchMetricsProps) {
  const successRate = totalContacts
    ? Math.round((successCount / totalContacts) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total de Contatos"
        value={totalContacts}
        icon={Users}
        iconClassName="text-muted-foreground"
      />
      <MetricCard
        title="Sucesso"
        value={successCount}
        icon={CheckCircle2}
        iconClassName="text-primary"
      />
      <MetricCard
        title="Falhas"
        value={errorCount}
        icon={XCircle}
        iconClassName="text-destructive"
      />
      <MetricCard
        title="Taxa de Sucesso"
        value={`${successRate}%`}
        icon={Send}
        iconClassName="text-muted-foreground"
      />
    </div>
  );
}