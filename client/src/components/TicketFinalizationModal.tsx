import React, { useState } from 'react';
import { X, Clock, DollarSign } from 'lucide-react';

interface TicketFinalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalizationData: FinalizationData) => void;
  ticket: {
    id: string;
    subject: string;
  };
}

interface FinalizationData {
  comment: string;
  internalHours: string;
  externalHours: string;
  totalHours: string;
  arrivalDate: string;
  departureDate: string;
  equipmentRemoved: string;
  materialsUsed: string;
  displacementValue: string;
  servicesValue: string;
  partsValue: string;
  totalValue: string;
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
    internalHours: '04:24',
    externalHours: '00:00',
    totalHours: '04:24',
    arrivalDate: '',
    departureDate: '',
    equipmentRemoved: '',
    materialsUsed: '',
    displacementValue: 'R$ 0,00',
    servicesValue: 'R$ 0,00',
    partsValue: 'R$ 0,00',
    totalValue: 'R$ 0,00',
    extraCharge: false,
    chargeType: 'Selecione'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onConfirm(formData);
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(to right, #fef3f2, #fdf2f8)'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#dc2626',
              margin: 0
            }}>
              Finalizar ticket {ticket.id}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              {ticket.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Comentário de Finalização */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Comentário de Finalização (Serviços Realizados) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                {/* Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '8px 12px',
                  borderBottom: '1px solid #d1d5db',
                  fontSize: '12px'
                }}>
                  <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>B</button>
                  <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>I</button>
                  <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>U</button>
                  <span style={{ margin: '0 8px', color: '#d1d5db' }}>|</span>
                  <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>TEMPLATES</button>
                </div>
                <textarea
                  value={formData.comment}
                  onChange={(e) => updateFormField('comment', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    outline: 'none',
                    minHeight: '100px',
                    resize: 'vertical',
                    backgroundColor: 'transparent'
                  }}
                  placeholder="Insira/cole seu texto ou imagem aqui..."
                  required
                />
              </div>
            </div>

            {/* Grid com duas colunas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Equipamentos retirados */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Equipamentos retirados
                </label>
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px 12px',
                    borderBottom: '1px solid #d1d5db',
                    fontSize: '12px'
                  }}>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>B</button>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>I</button>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>U</button>
                  </div>
                  <textarea
                    value={formData.equipmentRemoved}
                    onChange={(e) => updateFormField('equipmentRemoved', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      outline: 'none',
                      minHeight: '80px',
                      resize: 'vertical',
                      backgroundColor: 'transparent'
                    }}
                    placeholder="Insira/cole seu texto aqui"
                  />
                </div>
              </div>

              {/* Materiais utilizados */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Materiais utilizados
                </label>
                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px 12px',
                    borderBottom: '1px solid #d1d5db',
                    fontSize: '12px'
                  }}>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>B</button>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>I</button>
                    <button type="button" style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>U</button>
                  </div>
                  <textarea
                    value={formData.materialsUsed}
                    onChange={(e) => updateFormField('materialsUsed', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      outline: 'none',
                      minHeight: '80px',
                      resize: 'vertical',
                      backgroundColor: 'transparent'
                    }}
                    placeholder="Insira/cole seu texto aqui"
                  />
                </div>
              </div>
            </div>

            {/* Apontamento de horas */}
            <div style={{ 
              marginBottom: '24px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Apontamento de horas
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Atendimento
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <option>Interno</option>
                    <option>Externo</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Horário comercial
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <option>Sim</option>
                    <option>Não</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Apontamento
                  </label>
                  <input
                    type="text"
                    value={formData.totalHours}
                    onChange={(e) => updateFormField('totalHours', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px', gap: '8px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Interno</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{formData.internalHours}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Externo</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{formData.externalHours}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{formData.totalHours}</div>
                </div>
                <button type="button" style={{
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '8px',
                  cursor: 'pointer'
                }}>
                  ✓
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Data da chegada
                  </label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => updateFormField('arrivalDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Data de saída
                  </label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => updateFormField('departureDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Valores */}
            <div style={{ 
              marginBottom: '24px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <DollarSign style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>
                  Valores
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Deslocamento
                  </label>
                  <input
                    type="text"
                    value={formData.displacementValue}
                    onChange={(e) => updateFormField('displacementValue', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Serviços
                  </label>
                  <input
                    type="text"
                    value={formData.servicesValue}
                    onChange={(e) => updateFormField('servicesValue', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Peças
                  </label>
                  <input
                    type="text"
                    value={formData.partsValue}
                    onChange={(e) => updateFormField('partsValue', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Total
                  </label>
                  <input
                    type="text"
                    value={formData.totalValue}
                    onChange={(e) => updateFormField('totalValue', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280' }}>
                    Cobrança avulsa
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.extraCharge}
                    onChange={(e) => updateFormField('extraCharge', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                    Tipo de moeda
                  </label>
                  <select
                    value={formData.chargeType}
                    onChange={(e) => updateFormField('chargeType', e.target.value)}
                    style={{
                      width: '150px',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option>Selecione</option>
                    <option>Real (R$)</option>
                    <option>Dólar (US$)</option>
                    <option>Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSubmitting ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}