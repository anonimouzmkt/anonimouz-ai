import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DispatchMetrics } from "@/components/dashboard/DispatchMetrics";
import { DispatchStatistics } from "@/components/dashboard/DispatchStatistics";
import { DispatchChart } from "@/components/dashboard/DispatchChart";
import { useSelectedUser } from "@/components/AppSidebar";

interface DispatchResult {
  id: string;
  success_count: number;
  error_count: number;
  total_contacts: number;
  created_at: string;
  is_ai_dispatch: boolean;
}

interface ContactResult {
  contact_name: string;
  contact_phone: string;
  status: string;
}

interface ChartData {
  date: string;
  success: number;
  failed: number;
}

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

  const { 
    data: latestDispatch,
    refetch: refetchLatest,
    isLoading: isLoadingLatest
  } = useQuery({
    queryKey: ['latestDispatch', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest dispatch...");
      const { data: { user } } = await supabase.auth.getUser();
      const userId = selectedUserId || user?.id;
      
      if (!userId) throw new Error("No user ID available");

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching latest dispatch:", error);
        throw error;
      }

      console.log("Latest dispatch data:", data);
      return data as DispatchResult;
    },
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const {
    data: lastFiveDispatches,
    refetch: refetchChart,
    isLoading: isLoadingChart
  } = useQuery({
    queryKey: ['lastFiveDispatches', selectedUserId],
    queryFn: async () => {
      console.log("Fetching last 5 dispatches...");
      const { data: { user } } = await supabase.auth.getUser();
      const userId = selectedUserId || user?.id;
      
      if (!userId) throw new Error("No user ID available");

      const { data, error } = await supabase
        .from('dispatch_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching dispatches:", error);
        throw error;
      }

      console.log("Last 5 dispatches data:", data);
      return data as DispatchResult[];
    },
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const {
    data: latestContactResults,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ['latestContactResults', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest contact results...");
      const { data: { user } } = await supabase.auth.getUser();
      const userId = selectedUserId || user?.id;
      
      if (!userId) throw new Error("No user ID available");

      const { data: latestDispatch } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestDispatch) return [];

      const { data, error } = await supabase
        .from('dispatch_contact_results')
        .select('contact_name, contact_phone, status')
        .eq('dispatch_id', latestDispatch.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching contact results:", error);
        throw error;
      }

      console.log("Latest contact results:", data);
      return data as ContactResult[];
    },
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const chartData: ChartData[] = lastFiveDispatches?.map(dispatch => ({
    date: new Date(dispatch.created_at).toLocaleDateString(),
    success: dispatch.success_count,
    failed: dispatch.error_count
  })) || [];

  // Calculate totals
  const totalDispatches = lastFiveDispatches?.length || 0;
  const aiDispatches = lastFiveDispatches?.filter(d => d.is_ai_dispatch).length || 0;
  const normalDispatches = totalDispatches - aiDispatches;

  const handleRefresh = () => {
    refetchLatest();
    refetchChart();
    refetchContacts();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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

      <DispatchMetrics
        totalContacts={latestDispatch?.total_contacts || 0}
        successCount={latestDispatch?.success_count || 0}
        errorCount={latestDispatch?.error_count || 0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <DispatchStatistics
          aiDispatches={aiDispatches}
          normalDispatches={normalDispatches}
          latestDispatchResults={latestContactResults}
        />
        <DispatchChart
          data={chartData}
          config={chartConfig}
        />
      </div>
    </div>
  );
}