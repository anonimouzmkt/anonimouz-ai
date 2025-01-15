import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Resultados dos Últimos 5 Disparos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={config}>
            <BarChart 
              data={data} 
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
  );
}