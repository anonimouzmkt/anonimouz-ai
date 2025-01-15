import { useState } from "react";
import { useSelectedUser } from "@/components/sidebar/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import { DispatchMetrics } from "@/components/dashboard/DispatchMetrics";
import { DispatchStatistics } from "@/components/dashboard/DispatchStatistics";
import { DispatchChart } from "@/components/dashboard/DispatchChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDispatchData } from "@/hooks/useDispatchData";

const chartConfig = {
  success: {
    label: "Sucesso",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
  failed: {
    label: "Falha",
    theme: {
      light: "hsl(var(--destructive))",
      dark: "hsl(var(--destructive))",
    },
  },
};

export default function DispatchDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { selectedUserId } = useSelectedUser();
  const { toast } = useToast();

  const {
    latestDispatch,
    lastFiveDispatches,
    latestContactResults,
    refetchLatest,
    refetchChart,
    refetchContacts,
    latestError,
    chartError,
    contactsError
  } = useDispatchData(selectedUserId);

  const handleRefresh = () => {
    refetchLatest();
    refetchChart();
    refetchContacts();
  };

  if (latestError || chartError || contactsError) {
    console.error("Dashboard errors:", { latestError, chartError, contactsError });
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um erro ao carregar os dados. Por favor, tente novamente.",
      variant: "destructive",
    });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        handleRefresh={handleRefresh}
      />

      <DispatchMetrics
        totalContacts={latestDispatch?.total_contacts || 0}
        successCount={latestDispatch?.success_count || 0}
        errorCount={latestDispatch?.error_count || 0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DispatchStatistics
          aiDispatches={lastFiveDispatches?.filter(d => d.is_ai_dispatch).length || 0}
          normalDispatches={(lastFiveDispatches?.length || 0) - (lastFiveDispatches?.filter(d => d.is_ai_dispatch).length || 0)}
          latestDispatchResults={latestContactResults}
        />
        <DispatchChart
          data={lastFiveDispatches?.map(dispatch => ({
            date: new Date(dispatch.created_at).toLocaleDateString(),
            success: dispatch.success_count,
            failed: dispatch.error_count
          })) || []}
          config={chartConfig}
        />
      </div>
    </div>
  );
}