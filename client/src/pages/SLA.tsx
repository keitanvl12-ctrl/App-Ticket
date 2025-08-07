import React from 'react';
import SLAMetrics from '@/components/sla/SLAMetrics';
import SLATicketCard from '@/components/sla/SLATicketCard';
import SLAFilters from '@/components/sla/SLAFilters';
import ViolationHistory from '@/components/sla/ViolationHistory';
import EscalationQueue from '@/components/sla/EscalationQueue';

export default function SLA() {
  const [filters, setFilters] = React.useState({
    priority: 'all',
    status: 'all',
    department: 'all',
    timeRange: '24h'
  });

  const slaTickets = [
    {
      id: '1',
      title: 'Sistema de pagamento fora do ar',
      priority: 'critical' as const,
      status: 'open' as const,
      department: 'TI',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      slaTarget: 2 * 60 * 60 * 1000, // 2 horas
      timeRemaining: -30 * 60 * 1000, // -30 minutos (violação)
      assignee: 'João Silva',
      escalated: true
    },
    {
      id: '2',
      title: 'Erro no módulo de relatórios',
      priority: 'high' as const,
      status: 'in_progress' as const,
      department: 'TI',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      slaTarget: 8 * 60 * 60 * 1000, // 8 horas
      timeRemaining: 4 * 60 * 60 * 1000, // 4 horas restantes
      assignee: 'Maria Santos',
      escalated: false
    },
    {
      id: '3',
      title: 'Solicitação de acesso urgente',
      priority: 'medium' as const,
      status: 'pending' as const,
      department: 'RH',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      slaTarget: 24 * 60 * 60 * 1000, // 24 horas
      timeRemaining: 18 * 60 * 60 * 1000, // 18 horas restantes
      assignee: 'Carlos Oliveira',
      escalated: false
    }
  ];

  const filteredTickets = slaTickets.filter(ticket => {
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.department !== 'all' && ticket.department !== filters.department) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gestão de SLA
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitore e gerencie acordos de nível de serviço
        </p>
      </div>

      {/* SLA Metrics */}
      <SLAMetrics />

      {/* Filters */}
      <SLAFilters filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Tickets SLA ({filteredTickets.length})
            </h2>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <SLATicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EscalationQueue />
          <ViolationHistory />
        </div>
      </div>
    </div>
  );
}