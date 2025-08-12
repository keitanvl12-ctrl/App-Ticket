import React, { useState, useEffect } from 'react';
import ServiceOrderModal from './ServiceOrderModal';

interface TicketFinalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalizationData: FinalizationData) => void;
  ticket: {
    id: string;
    subject: string;
    createdAt?: string;
  };
}

interface FinalizationData {
  comment: string;
  hoursSpent: string;
  equipmentRemoved: string;
  materialsUsed: string;
  extraCharge: boolean;
  chargeType: string;
}

export default function TicketFinalizationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  ticket 
}: TicketFinalizationModalProps) {
  const [formData, setFormData] = useState<FinalizationData>({
    comment: '',
    hoursSpent: '04:30',
    equipmentRemoved: '',
    materialsUsed: '',
    extraCharge: false,
    chargeType: 'Selecione'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServiceOrder, setShowServiceOrder] = useState(false);
  const [finalizedTicket, setFinalizedTicket] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
      
      // Store finalization data and show service order modal
      setFinalizedTicket({ ...ticket, finalizationData: formData });
      setShowServiceOrder(true);
      onClose();
    } catch (error) {
      console.error('Erro ao finalizar ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormField = (field: keyof FinalizationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-5">
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-red-600 mb-1">
                Finalizar Ticket {ticket.id}
              </h2>
              <p className="text-sm text-gray-600">{ticket.subject}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Comentário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário de Finalização *
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => updateFormField('comment', e.target.value)}
                placeholder="Descreva como o problema foi resolvido..."
                required
                className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Horas - Travado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apontamento de Horas (Calculado automaticamente)
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="text"
                  value={formData.hoursSpent}
                  readOnly
                  className="bg-transparent border-none text-gray-600 font-semibold cursor-not-allowed flex-1"
                />
              </div>
            </div>

            {/* Equipamentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipamentos Retirados
              </label>
              <textarea
                value={formData.equipmentRemoved}
                onChange={(e) => updateFormField('equipmentRemoved', e.target.value)}
                placeholder="Liste os equipamentos retirados, se houver..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Materiais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materiais Utilizados
              </label>
              <textarea
                value={formData.materialsUsed}
                onChange={(e) => updateFormField('materialsUsed', e.target.value)}
                placeholder="Liste os materiais utilizados..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cobrança Avulsa */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.extraCharge}
                  onChange={(e) => updateFormField('extraCharge', e.target.checked)}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                Cobrança Avulsa
              </label>
              
              {formData.extraCharge && (
                <div className="mt-3">
                  <select
                    value={formData.chargeType}
                    onChange={(e) => updateFormField('chargeType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Selecione">Selecione o tipo de cobrança</option>
                    <option value="Serviço Extra">Serviço Extra</option>
                    <option value="Hora Extra">Hora Extra</option>
                    <option value="Material Adicional">Material Adicional</option>
                    <option value="Deslocamento">Deslocamento</option>
                  </select>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.comment.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting || !formData.comment.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Ticket'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Service Order Modal */}
      {finalizedTicket && (
        <ServiceOrderModal
          ticket={finalizedTicket}
          isOpen={showServiceOrder}
          onClose={() => setShowServiceOrder(false)}
          finalizationData={finalizedTicket.finalizationData}
        />
      )}
    </div>
  );
}