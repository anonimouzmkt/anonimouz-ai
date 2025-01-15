import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Users, Bot, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DispatchResult {
  id: string;
  success_count: number;
  error_count: number;
  total_contacts: number;
  created_at: string;
  is_ai_dispatch: boolean;
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

const fetchLatestDispatch = async () => {
  console.log("Fetching latest dispatch...");
  const { data, error } = await supabase
    .from('dispatch_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching latest dispatch:", error);
    throw error;
  }

  console.log("Latest dispatch data:", data);
  return data as DispatchResult;
};

const fetchLastFiveDispatches = async () => {
  console.log("Fetching last 5 dispatches...");
  const { data, error } = await supabase
    .from('dispatch_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching dispatches:", error);
    throw error;
  }

  console.log("Last 5 dispatches data:", data);
  return data as DispatchResult[];
};

export default function DispatchDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { 
    data: latestDispatch,
    refetch: refetchLatest,
    isLoading: isLoadingLatest
  } = useQuery({
    queryKey: ['latestDispatch'],
    queryFn: fetchLatestDispatch,
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const {
    data: lastFiveDispatches,
    refetch: refetchChart,
    isLoading: isLoadingChart
  } = useQuery({
    queryKey: ['lastFiveDispatches'],
    queryFn: fetchLastFiveDispatches,
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

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('dispatch-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_results'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          refetchLatest();
          refetchChart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchLatest, refetchChart]);

  const handleRefresh = () => {
    refetchLatest();
    refetchChart();
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestDispatch?.total_contacts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestDispatch?.success_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestDispatch?.error_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestDispatch?.total_contacts
                ? Math.round((latestDispatch.success_count / latestDispatch.total_contacts) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estatísticas de Disparos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Com I.A.</CardTitle>
                    <Bot className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aiDispatches}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Normais</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{normalDispatches}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resultados dos Últimos 5 Disparos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 30, bottom: 20, left: 10 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    opacity={0.2} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    fontSize={12}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    fontSize={12}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        labelKey="date"
                        nameKey="dataKey"
                      />
                    )}
                  />
                  <Bar 
                    dataKey="success" 
                    name="Sucesso" 
                    fill="var(--color-success)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={35}
                  />
                  <Bar 
                    dataKey="failed" 
                    name="Falha" 
                    fill="var(--color-failed)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={35}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
