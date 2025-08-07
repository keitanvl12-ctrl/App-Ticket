import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendData } from "@shared/schema";

interface TicketTrendsChartProps {
  days: number;
}

export default function TicketTrendsChart({ days }: TicketTrendsChartProps) {
  const { data: trendData, isLoading } = useQuery<TrendData[]>({
    queryKey: ["/api/dashboard/trends", { days }],
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-50">Loading chart...</div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-50">No data available</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--gray-20))" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--gray-50))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--gray-50))", fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--gray-20))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            name="Created"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="hsl(var(--success))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
