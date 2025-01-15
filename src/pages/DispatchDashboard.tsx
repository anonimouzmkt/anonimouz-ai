import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DispatchMetrics } from "@/components/dashboard/DispatchMetrics";
import { DispatchStatistics } from "@/components/dashboard/DispatchStatistics";
import { DispatchChart } from "@/components/dashboard/DispatchChart";
import { useSelectedUser } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";

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

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        throw authError;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      return { user, isAdmin: profile?.role === 'admin_user' };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const { 
    data: latestDispatch,
    refetch: refetchLatest,
    isLoading: isLoadingLatest,
    error: latestError
  } = useQuery({
    queryKey: ['latestDispatch', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest dispatch...");
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      // Only allow admin users to view other users' data
      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

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
    isLoading: isLoadingChart,
    error: chartError
  } = useQuery({
    queryKey: ['lastFiveDispatches', selectedUserId],
    queryFn: async () => {
      console.log("Fetching last 5 dispatches...");
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      // Only allow admin users to view other users' data
      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

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
    error: contactsError
  } = useQuery({
    queryKey: ['latestContactResults', selectedUserId],
    queryFn: async () => {
      console.log("Fetching latest contact results...");
      const { user, isAdmin } = await fetchUserData();
      const userId = selectedUserId || user?.id;
      
      if (!userId) {
        console.error("No user ID available");
        throw new Error("No user ID available");
      }

      // Only allow admin users to view other users' data
      if (selectedUserId && !isAdmin) {
        throw new Error("Unauthorized");
      }

      const { data: latestDispatch, error: dispatchError } = await supabase
        .from('dispatch_results')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dispatchError) {
        console.error("Error fetching latest dispatch:", dispatchError);
        return [];
      }

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

  const handleRefresh = () => {
    refetchLatest();
    refetchChart();
    refetchContacts();
  };

  if (latestError || chartError || contactsError) {
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um erro ao carregar os dados. Por favor, tente novamente.",
      variant: "destructive",
    });
  }

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