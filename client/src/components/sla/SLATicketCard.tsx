import React from 'react';
import Icon from '../AppIcon';
import Button from '../Button';

interface SLATicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved';
  department: string;
  createdAt: Date;
  slaTarget: number; // em milliseconds
  timeRemaining: number; // em milliseconds (negativo = violação)
  assignee: string;
  escalated: boolean;
}

interface SLATicketCardProps {
  ticket: SLATicket;
}

export default function SLATicketCard({ ticket }: SLATicketCardProps) {
  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  const statusColors = {
    open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    in_progress: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    resolved: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  };

  const statusLabels = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    pending: 'Pendente',
    resolved: 'Resolvido'
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica'
  };

  const formatTimeRemaining = (ms: number) => {
    const isViolation = ms < 0;
    const absMs = Math.abs(ms);
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (isViolation) {
      return `Violação: ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m restantes`;
  };

  const getTimeColor = (ms: number) => {
    if (ms < 0) return 'text-red-600 dark:text-red-400';
    if (ms < 60 * 60 * 1000) return 'text-yellow-600 dark:text-yellow-400'; // < 1 hora
    return 'text-green-600 dark:text-green-400';
  };

  const calculateProgress = () => {
    const elapsed = Date.now() - ticket.createdAt.getTime();
    const progress = Math.min((elapsed / ticket.slaTarget) * 100, 100);
    return Math.max(progress, 0);
  };

  const progress = calculateProgress();
  const isViolation = ticket.timeRemaining < 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border-2 p-4 transition-all hover:shadow-md ${
      isViolation 
        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
        : ticket.escalated
          ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10'
          : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              #{ticket.id}
            </span>
            {ticket.escalated && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                <Icon name="ArrowUp" size={12} className="mr-1" />
                Escalado
              </span>
            )}
            {isViolation && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                <Icon name="AlertTriangle" size={12} className="mr-1" />
                Violação SLA
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
            {ticket.title}
          </h3>
        </div>
      </div>

      {/* Priority & Status Badges */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
          <Icon name="Flag" size={12} className="mr-1" />
          {priorityLabels[ticket.priority]}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
          {statusLabels[ticket.status]}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
          {ticket.department}
        </span>
      </div>

      {/* SLA Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600 dark:text-slate-400">Progresso SLA</span>
          <span className={`font-medium ${getTimeColor(ticket.timeRemaining)}`}>
            {formatTimeRemaining(ticket.timeRemaining)}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isViolation 
                ? 'bg-red-500 dark:bg-red-600' 
                : progress > 80 
                  ? 'bg-yellow-500 dark:bg-yellow-600'
                  : 'bg-green-500 dark:bg-green-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Assignee & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {ticket.assignee.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {ticket.assignee}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
          >
            Ver Detalhes
          </Button>
          {isViolation && (
            <Button
              variant="default"
              size="sm"
              iconName="AlertTriangle"
              iconPosition="left"
            >
              Ação Urgente
            </Button>
          )}
        </div>
      </div>

      {/* Created Time */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Criado em {ticket.createdAt.toLocaleString('pt-BR')}
        </span>
      </div>
    </div>
  );
}