import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Ticket, Hourglass, CheckCircle, Clock } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import TicketTrendsChart from "@/components/TicketTrendsChart";
import PriorityBreakdown from "@/components/PriorityBreakdown";
import RecentTicketsTable from "@/components/RecentTicketsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("7");

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o que está acontecendo com seus tickets hoje.</p>
      </div>
      
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Tickets"
            value={stats?.totalTickets || 0}
            change={stats?.totalTicketsChange || "+0%"}
            changeType="positive"
            icon={Ticket}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="Tickets Abertos"
            value={stats?.openTickets || 0}
            change={stats?.openTicketsChange || "+0%"}
            changeType="positive"
            icon={Hourglass}
            iconColor="text-warning"
            iconBgColor="bg-warning/10"
          />
          <StatsCard
            title="Resolvidos Hoje"
            value={stats?.resolvedToday || 0}
            change={stats?.resolvedTodayChange || "+0%"}
            changeType="positive"
            icon={CheckCircle}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
          <StatsCard
            title="Tempo Médio de Resposta"
            value={stats?.avgResponseTime || "0h"}
            change={stats?.avgResponseTimeChange || "0%"}
            changeType="positive"
            icon={Clock}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Trends Chart */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-enterprise">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Tendências de Tickets</h2>
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-40 text-sm border-border">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TicketTrendsChart days={parseInt(chartPeriod)} />
          </div>

          {/* Priority Breakdown */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-enterprise">
            <h2 className="text-lg font-semibold text-foreground mb-6">Distribuição por Prioridade</h2>
            <PriorityBreakdown />
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-card border border-border rounded-lg shadow-enterprise overflow-hidden">
          <RecentTicketsTable />
        </div>
      </div>
    </div>
  );
}
