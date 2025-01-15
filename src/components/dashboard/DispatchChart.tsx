import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartData {
  date: string;
  success: number;
  failed: number;
}

interface DispatchChartProps {
  data: ChartData[];
  config: Record<string, any>;
}

export function DispatchChart({ data, config }: DispatchChartProps) {
  console.log("Chart data received:", data);

  // Format dates to be more readable
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  console.log("Formatted chart data:", formattedData);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Resultados dos Últimos 5 Disparos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full pt-4"> {/* Increased height and added padding */}
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formattedData} 
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  opacity={0.2} 
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  dy={20}
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    return value === 'success' ? 'Sucesso' : 'Falha';
                  }}
                />
                <Bar 
                  dataKey="success" 
                  name="Sucesso" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
                <Bar 
                  dataKey="failed" 
                  name="Falha" 
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}