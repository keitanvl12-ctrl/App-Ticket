import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, User, FileText, Calendar, AlertCircle,
  CheckCircle, Building2, Tag, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketDetailModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  // Buscar dados do ticket
  const { data: tickets = [], isLoading: ticketLoading } = useQuery({
    queryKey: ['/api/tickets'],
    enabled: isOpen && !!ticketId,
  });
  
  const ticket = tickets.find((t: any) => t.id === ticketId);

  // Buscar comentários do ticket
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ['/api/tickets', ticketId, 'comments'],
    enabled: isOpen && !!ticketId,
  });

  // Buscar configurações de status e prioridade
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
    enabled: isOpen,
  });

  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
    enabled: isOpen,
  });

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen,
  });

  if (ticketLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Ticket não encontrado.</p>
            <Button onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Função para obter configuração de status
  const getStatusConfig = (statusValue: string) => {
    return statusConfigs?.find(s => s.value === statusValue) || { 
      name: statusValue === 'open' ? 'Aberto' :
            statusValue === 'in_progress' ? 'Em Andamento' :
            statusValue === 'resolved' ? 'Resolvido' :
            statusValue === 'closed' ? 'Fechado' : statusValue, 
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  // Função para obter configuração de prioridade  
  const getPriorityConfig = (priorityValue: string) => {
    return priorityConfigs?.find(p => p.value === priorityValue) || { 
      name: priorityValue === 'critical' ? 'Crítica' :
            priorityValue === 'high' ? 'Alta' :
            priorityValue === 'medium' ? 'Média' :
            priorityValue === 'low' ? 'Baixa' : priorityValue, 
      color: '#6B7280',
      textColor: '#FFFFFF'
    };
  };

  // Função para obter nome do departamento
  const getDepartmentName = (departmentId: string) => {
    const dept = departments?.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
  };

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <span>Detalhes do Ticket {ticket.ticketNumber}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge 
                style={{ 
                  backgroundColor: statusConfig.color, 
                  color: statusConfig.textColor 
                }}
              >
                {statusConfig.name}
              </Badge>
              <Badge 
                style={{ 
                  backgroundColor: priorityConfig.color, 
                  color: priorityConfig.textColor 
                }}
              >
                {priorityConfig.name}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Criado em {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
          </div>

          {/* Ticket Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white">
                      {ticket.createdByUser?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{ticket.createdByUser?.name || 'Usuário não identificado'}</p>
                    <p className="text-xs text-gray-500">{ticket.createdByUser?.email || 'Email não disponível'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ticket.department?.name || 'Não definido'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ticket.category}</p>
              </CardContent>
            </Card>
          </div>

          {/* Subject and Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Assunto</h3>
              <p className="text-gray-700">{ticket.subject}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {comments && comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comentários ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white">
                            {comment.authorName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{comment.authorName}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket criado</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket atualizado</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'resolved' && ticket.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket resolvido</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* SLA Information */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progresso SLA</span>
                    <span className="text-sm">
                      {ticket.slaHoursRemaining !== undefined ? 
                        (ticket.slaHoursRemaining > 0 ? 
                          `${Math.ceil(ticket.slaHoursRemaining)}h restantes` : 
                          'Vencido'
                        ) : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        ticket.slaStatus === 'violated' ? 'bg-red-500' :
                        ticket.slaStatus === 'at_risk' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${ticket.slaHoursTotal && ticket.slaHoursRemaining !== undefined ? 
                          Math.min(((ticket.slaHoursTotal - ticket.slaHoursRemaining) / ticket.slaHoursTotal) * 100, 100) : 
                          0}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Meta: {ticket.slaHoursTotal || 4}h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" disabled>
                Escalonamento (Em Breve)
              </Button>
              <Button 
                onClick={() => {
                  // Navegar para o Kanban com este ticket
                  window.location.href = '/kanban';
                  onClose();
                }}
              >
                Abrir no Kanban
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}