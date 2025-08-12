import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle, Clock, FileText, AlertTriangle, XCircle, AlertCircle
} from 'lucide-react';

interface TicketFinalizationModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  comments?: any[];
  users?: any[];
}

export function TicketFinalizationModal({ 
  ticket, 
  isOpen, 
  onClose, 
  comments = [], 
  users = [] 
}: TicketFinalizationModalProps) {
  const [finalizationData, setFinalizationData] = useState({
    resolutionComment: '',
    equipmentRetired: '',
    materialsUsed: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para calcular horas trabalhadas (tempo ativo - tempo pausado)
  const calculateWorkedHours = () => {
    if (!ticket.createdAt) return '0:00';
    
    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    
    // Calcular tempo total em milissegundos
    let totalActiveTime = now.getTime() - createdAt.getTime();
    
    // Se há comentários, verificar tempos de pausa
    if (comments && comments.length > 0) {
      let pausedTime = 0;
      let pauseStart = null;
      
      // Ordenar comentários por data
      const sortedComments = [...comments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      for (const comment of sortedComments) {
        const commentTime = new Date(comment.createdAt).getTime();
        
        // Detectar início de pausa
        if (comment.content.includes('PAUSADO') || comment.content.includes('PAUSA')) {
          pauseStart = commentTime;
        }
        
        // Detectar fim de pausa
        if ((comment.content.includes('RETOMADO') || comment.content.includes('REABERTO')) && pauseStart) {
          pausedTime += commentTime - pauseStart;
          pauseStart = null;
        }
      }
      
      // Se ainda está pausado
      if (ticket.status === 'on_hold' && pauseStart) {
        pausedTime += now.getTime() - pauseStart;
      }
      
      totalActiveTime -= pausedTime;
    }
    
    // Converter para horas e minutos
    const hours = Math.floor(totalActiveTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalActiveTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleFinalize = async () => {
    if (!finalizationData.resolutionComment.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O comentário de resolução é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar comentário detalhado de finalização
      const workedHours = calculateWorkedHours();
      const finalizationComment = `🔧 FINALIZAÇÃO DO TICKET

**Resolução:** ${finalizationData.resolutionComment}

**Tempo Trabalhado:** ${workedHours} (tempo efetivo, excluindo pausas)

${finalizationData.equipmentRetired ? `**Equipamentos Retirados:**
${finalizationData.equipmentRetired}

` : ''}${finalizationData.materialsUsed ? `**Materiais Utilizados:**
${finalizationData.materialsUsed}

` : ''}**Data de Finalização:** ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
**Técnico:** ${users?.find(u => u.id === ticket.assignedTo)?.name || 'Sistema'}`;

      // Adicionar comentário de finalização
      await apiRequest(`/api/tickets/${ticket.id}/comments`, 'POST', {
        content: finalizationComment
      });

      // Atualizar status para resolvido
      await apiRequest(`/api/tickets/${ticket.id}`, 'PATCH', {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });

      toast({
        title: "✅ Ticket finalizado!",
        description: "O ticket foi finalizado com sucesso.",
      });

      // Atualizar caches e interface
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticket.id, 'comments'] });

      // Limpar dados e fechar modal
      setFinalizationData({
        resolutionComment: '',
        equipmentRetired: '',
        materialsUsed: ''
      });

      onClose();
      
      // Recarregar página para atualizar dados
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      console.error('Erro ao finalizar ticket:', error);
      toast({
        title: "❌ Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o ticket. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-6">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Finalizar Ticket {ticket.ticketNumber}</h2>
                <p className="text-sm text-gray-600 mt-1">{ticket.title}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalização
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Resumo do Ticket */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">Resumo do Ticket</h4>
            <p className="text-gray-700 mb-4">{ticket.title}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="font-medium">Criado: {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
              <span className="font-medium">Prioridade: <span className="capitalize">{ticket.priority}</span></span>
            </div>
          </div>

          {/* Comentário de Resolução */}
          <div className="space-y-4">
            <Label className="text-lg font-bold text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Comentário de Resolução *
            </Label>
            <Textarea
              value={finalizationData.resolutionComment}
              onChange={(e) => setFinalizationData({
                ...finalizationData,
                resolutionComment: e.target.value
              })}
              placeholder="Descreva detalhadamente como o problema foi resolvido:

• Qual foi a causa raiz identificada?
• Quais passos foram executados para resolver?
• Como a solução foi testada e validada?
• Há recomendações para prevenir reincidência?"
              className="min-h-[160px] resize-none border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base p-4"
              required
            />
            <p className="text-sm text-gray-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Campo obrigatório - seja específico na descrição da resolução
            </p>
          </div>

          {/* Apontamento de Horas - Destaque Principal */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-8 shadow-lg">
            <Label className="text-xl font-black text-amber-800 flex items-center mb-6">
              <Clock className="w-7 h-7 mr-3" />
              Apontamento de Horas Trabalhadas
            </Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-white rounded-xl px-8 py-6 border-3 border-amber-500 shadow-md">
                  <span className="text-4xl font-mono font-black text-amber-700">
                    {calculateWorkedHours()}
                  </span>
                </div>
                <div className="text-amber-700">
                  <p className="font-bold text-xl">Tempo efetivo de trabalho</p>
                  <p className="text-base">Calculado automaticamente, excluindo pausas</p>
                </div>
              </div>
              <div className="text-right text-amber-700">
                <p className="text-base font-semibold">Início: {format(new Date(ticket.createdAt), 'dd/MM HH:mm', { locale: ptBR })}</p>
                <p className="text-base font-semibold">Finalização: {format(new Date(), 'dd/MM HH:mm', { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          {/* Grid para Equipamentos e Materiais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Equipamentos Retirados */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
              <Label className="text-lg font-bold text-orange-800 flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 mr-3" />
                Equipamentos Retirados
              </Label>
              <Textarea
                value={finalizationData.equipmentRetired}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  equipmentRetired: e.target.value
                })}
                placeholder="Liste os equipamentos que foram retirados:

• Desktop Dell OptiPlex 3070
• Modelo: ABC123
• Patrimônio: 001234
• Monitor Samsung 24 polegadas - Patrimônio: 005678"
                className="min-h-[140px] resize-none border-orange-300 focus:border-orange-500 focus:ring-orange-200 bg-white text-base p-4"
              />
            </div>

            {/* Materiais Utilizados */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <Label className="text-lg font-bold text-blue-800 flex items-center mb-4">
                <FileText className="w-6 h-6 mr-3" />
                Materiais Utilizados
              </Label>
              <Textarea
                value={finalizationData.materialsUsed}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  materialsUsed: e.target.value
                })}
                placeholder="Liste os materiais que foram utilizados:

• Cabo de rede CAT6 - 2 metros
• Conector RJ45 - 2 unidades  
• Abraçadeira plástica - 5 unidades
• Parafuso M4 - 4 unidades"
                className="min-h-[140px] resize-none border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-white text-base p-4"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
            <div className="text-base text-gray-600">
              <p className="font-bold">Tempo total de trabalho: <span className="text-amber-600 font-mono text-lg">{calculateWorkedHours()}</span></p>
              <p>Este ticket será marcado como <span className="font-bold text-green-600">Resolvido</span></p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  setFinalizationData({
                    resolutionComment: '',
                    equipmentRetired: '',
                    materialsUsed: ''
                  });
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 text-base"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleFinalize}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-semibold"
                disabled={!finalizationData.resolutionComment.trim()}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Finalizar Ticket
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TicketFinalizationModal;