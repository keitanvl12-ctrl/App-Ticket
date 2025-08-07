import React from 'react';
import Icon from '../AppIcon';
import Button from '../Button';

interface EscalationItem {
  id: string;
  ticketId: string;
  title: string;
  priority: 'high' | 'critical';
  currentAssignee: string;
  escalationTime: Date;
  nextLevel: string;
  reason: string;
}

export default function EscalationQueue() {
  const escalationQueue: EscalationItem[] = [
    {
      id: '1',
      ticketId: 'TK-1001',
      title: 'Sistema de pagamento instável',
      priority: 'critical',
      currentAssignee: 'João Silva',
      escalationTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min futuro
      nextLevel: 'Gerência TI',
      reason: 'SLA crítico violado'
    },
    {
      id: '2',
      ticketId: 'TK-999',
      title: 'Falha no backup automático',
      priority: 'high',
      currentAssignee: 'Maria Santos',
      escalationTime: new Date(Date.now() + 90 * 60 * 1000), // 90 min futuro
      nextLevel: 'Coordenação',
      reason: 'Sem resposta por 6h'
    }
  ];

  const priorityColors = {
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  const priorityLabels = {
    high: 'Alta',
    critical: 'Crítica'
  };

  const formatTimeUntilEscalation = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Pronto para escalar';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isReadyToEscalate = (date: Date) => {
    return date.getTime() <= Date.now();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="ArrowUp" size={18} className="text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Fila de Escalação
          </h3>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
          {escalationQueue.length} tickets
        </span>
      </div>

      <div className="space-y-3">
        {escalationQueue.map((item) => {
          const readyToEscalate = isReadyToEscalate(item.escalationTime);
          
          return (
            <div 
              key={item.id}
              className={`border rounded-lg p-3 transition-all ${
                readyToEscalate 
                  ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.ticketId}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[item.priority]}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    {item.title}
                  </p>
                </div>
              </div>

              {/* Escalation Info */}
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Icon name="User" size={12} className="mr-1" />
                    Atual: {item.currentAssignee}
                  </span>
                  <span className="flex items-center">
                    <Icon name="ArrowRight" size={12} className="mr-1" />
                    Próximo: {item.nextLevel}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Icon name="AlertCircle" size={12} className="mr-1" />
                    {item.reason}
                  </span>
                  <span className={`flex items-center font-medium ${
                    readyToEscalate 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    <Icon name="Clock" size={12} className="mr-1" />
                    {formatTimeUntilEscalation(item.escalationTime)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center space-x-2">
                {readyToEscalate ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      iconName="ArrowUp"
                      iconPosition="left"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Escalar Agora
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Clock"
                      iconPosition="left"
                    >
                      Adiar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                      className="flex-1"
                    >
                      Ver Ticket
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="ArrowUp"
                      iconPosition="left"
                    >
                      Escalar
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {escalationQueue.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-green-500 dark:text-green-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
            Fila Vazia
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhum ticket aguardando escalação
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Settings"
            iconPosition="left"
            className="text-xs"
          >
            Config. Escalação
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Bell"
            iconPosition="left"
            className="text-xs"
          >
            Notificações
          </Button>
        </div>
      </div>
    </div>
  );
}