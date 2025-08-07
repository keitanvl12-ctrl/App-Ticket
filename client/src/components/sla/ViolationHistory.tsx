import React from 'react';
import Icon from '../AppIcon';

interface ViolationRecord {
  id: string;
  ticketId: string;
  title: string;
  violationTime: Date;
  department: string;
  assignee: string;
  impact: 'low' | 'medium' | 'high';
}

export default function ViolationHistory() {
  const violations: ViolationRecord[] = [
    {
      id: '1',
      ticketId: 'TK-1001',
      title: 'Sistema de pagamento instável',
      violationTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      department: 'TI',
      assignee: 'João Silva',
      impact: 'high'
    },
    {
      id: '2',
      ticketId: 'TK-998',
      title: 'Erro no relatório mensal',
      violationTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      department: 'Financeiro',
      assignee: 'Maria Santos',
      impact: 'medium'
    },
    {
      id: '3',
      ticketId: 'TK-995',
      title: 'Acesso negado no sistema',
      violationTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
      department: 'RH',
      assignee: 'Carlos Oliveira',
      impact: 'low'
    }
  ];

  const impactColors = {
    low: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  const impactLabels = {
    low: 'Baixo',
    medium: 'Médio',
    high: 'Alto'
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d atrás`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="AlertTriangle" size={18} className="text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Histórico de Violações
          </h3>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Últimas 24h
        </span>
      </div>

      <div className="space-y-3">
        {violations.map((violation) => (
          <div 
            key={violation.id}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {violation.ticketId}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[violation.impact]}`}>
                    {impactLabels[violation.impact]}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {violation.title}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Icon name="Building2" size={12} className="mr-1" />
                  {violation.department}
                </span>
                <span className="flex items-center">
                  <Icon name="User" size={12} className="mr-1" />
                  {violation.assignee}
                </span>
              </div>
              <span className="flex items-center">
                <Icon name="Clock" size={12} className="mr-1" />
                {formatTimeAgo(violation.violationTime)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
          Ver Histórico Completo
        </button>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-750 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">3</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Hoje</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">12</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Esta Semana</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">45</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Este Mês</p>
          </div>
        </div>
      </div>
    </div>
  );
}