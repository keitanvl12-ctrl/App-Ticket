import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Mail, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import logoOpus from '@assets/Logo Grupo OPUS - azul escuro.azul claro1_1754938736660.png';

interface ServiceOrderModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  finalizationData?: any;
}

const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({
  ticket,
  isOpen,
  onClose,
  finalizationData
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateServiceOrderPDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let yPosition = 30;

      // Header with logo and company info
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORDEM DE SERVIÇO', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Grupo OPUS', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // OS Number and Date
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`OS Nº: ${ticket.ticketNumber}`, margin, yPosition);
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 50, yPosition);

      yPosition += 20;

      // Ticket Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES DO CHAMADO', margin, yPosition);
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      
      // Split long text into multiple lines
      const splitText = (text: string, maxWidth: number) => {
        return pdf.splitTextToSize(text, maxWidth);
      };

      const addField = (label: string, value: string) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${label}:`, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        
        const lines = splitText(value, pageWidth - margin * 2 - 40);
        pdf.text(lines, margin + 40, yPosition);
        yPosition += lines.length * 5 + 5;
      };

      addField('Número', ticket.ticketNumber || 'N/A');
      addField('Assunto', ticket.subject || 'N/A');
      addField('Descrição', ticket.description || 'N/A');
      addField('Prioridade', ticket.priority || 'N/A');
      addField('Categoria', ticket.category || 'N/A');
      addField('Solicitante', ticket.createdByUser?.name || ticket.createdBy || 'N/A');
      addField('Responsável', ticket.assignedToUser?.name || ticket.assignedTo || 'N/A');
      addField('Data de Abertura', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('pt-BR') : 'N/A');
      addField('Data de Resolução', ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString('pt-BR') : 'N/A');

      yPosition += 10;

      // Comments/History Section
      if (ticket.comments && ticket.comments.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('HISTÓRICO DE COMENTÁRIOS', margin, yPosition);
        yPosition += 10;

        ticket.comments.forEach((comment: any) => {
          pdf.setFont('helvetica', 'normal');
          const commentDate = new Date(comment.createdAt).toLocaleString('pt-BR');
          const commentUser = comment.user?.name || 'Sistema';
          const commentHeader = `${commentDate} - ${commentUser}:`;
          
          pdf.text(commentHeader, margin, yPosition);
          yPosition += 5;
          
          const commentLines = splitText(comment.content, pageWidth - margin * 2);
          pdf.text(commentLines, margin + 10, yPosition);
          yPosition += commentLines.length * 5 + 10;
        });
      }

      yPosition += 10;

      // Service Details
      if (finalizationData) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('DETALHES DO ATENDIMENTO', margin, yPosition);
        yPosition += 10;

        if (finalizationData.comment) {
          addField('Solução Aplicada', finalizationData.comment);
        }
        if (finalizationData.hoursSpent) {
          addField('Horas Trabalhadas', finalizationData.hoursSpent);
        }
        if (finalizationData.materialsUsed) {
          addField('Materiais Utilizados', finalizationData.materialsUsed);
        }
        if (finalizationData.equipmentRemoved) {
          addField('Equipamento Removido', finalizationData.equipmentRemoved ? 'Sim' : 'Não');
        }
        if (finalizationData.extraCharge && finalizationData.chargeType) {
          addField('Cobrança Extra', `${finalizationData.chargeType}: R$ ${finalizationData.extraCharge}`);
        }
      }

      yPosition += 20;

      // Signatures
      pdf.setFont('helvetica', 'bold');
      pdf.text('ASSINATURAS', margin, yPosition);
      yPosition += 20;

      const signatureWidth = (pageWidth - margin * 2 - 40) / 2;
      
      // Technical signature
      pdf.line(margin, yPosition, margin + signatureWidth, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Técnico Responsável', margin, yPosition + 10);
      pdf.text(`Data: ___/___/______`, margin, yPosition + 20);

      // Client signature
      const clientSignatureX = margin + signatureWidth + 40;
      pdf.line(clientSignatureX, yPosition, clientSignatureX + signatureWidth, yPosition);
      pdf.text('Cliente/Solicitante', clientSignatureX, yPosition + 10);
      pdf.text(`Data: ___/___/______`, clientSignatureX, yPosition + 20);

      yPosition += 40;

      // Footer
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Este documento comprova a execução dos serviços descritos acima.', pageWidth / 2, yPosition, { align: 'center' });

      // Generate and download PDF
      const fileName = `OS_${ticket.ticketNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Ordem de Serviço Gerada",
        description: `PDF salvo como: ${fileName}`,
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a Ordem de Serviço.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendByEmail = async () => {
    // TODO: Implementar envio por email usando SendGrid
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "Envio por email será implementado em breve.",
    });
  };

  const printServiceOrder = async () => {
    // Generate PDF and trigger print
    await generateServiceOrderPDF();
    toast({
      title: "Ordem de Serviço Gerada",
      description: "Use Ctrl+P para imprimir o arquivo baixado.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordem de Serviço
          </DialogTitle>
          <DialogDescription>
            Gerar documento de finalização do chamado {ticket?.ticketNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resumo do Atendimento</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Chamado:</strong> {ticket?.ticketNumber}</p>
              <p><strong>Assunto:</strong> {ticket?.subject}</p>
              <p><strong>Status:</strong> Finalizado</p>
              <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={generateServiceOrderPDF}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </Button>

            <Button 
              variant="outline"
              onClick={printServiceOrder}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>

            <Button 
              variant="outline"
              onClick={sendByEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Enviar por Email
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderModal;