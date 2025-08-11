import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Paperclip, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

// Configurações de campos dinâmicos por categoria (baseado nas categorias reais do banco)
const DYNAMIC_FIELDS_CONFIG: Record<string, DynamicField[]> = {
  'Suporte Técnico': [
    { id: 'tipo_problema', label: 'Tipo de Problema', type: 'select', required: true, 
      options: ['Instalação de Software', 'Problemas de Hardware', 'Problemas de Rede', 'Acesso ao Sistema', 'Outros'] },
    { id: 'equipamento', label: 'Equipamento/Sistema Afetado', type: 'text', placeholder: 'Ex: Notebook Dell, Sistema XYZ', required: true },
    { id: 'urgencia_negocio', label: 'Impacto no Negócio', type: 'select', required: true,
      options: ['Baixo - Não impacta operação', 'Médio - Impacta algumas funções', 'Alto - Impacta operação crítica', 'Crítico - Para toda operação'] }
  ],
  'Problemas de Hardware': [
    { id: 'equipamento_problema', label: 'Equipamento com Problema', type: 'text', placeholder: 'Ex: Notebook HP, Impressora Xerox', required: true },
    { id: 'numero_patrimonio', label: 'Número do Patrimônio', type: 'text', placeholder: 'Se disponível' },
    { id: 'descricao_problema', label: 'Descrição Detalhada do Problema', type: 'textarea', required: true },
    { id: 'local_equipamento', label: 'Localização do Equipamento', type: 'text', required: true }
  ],
  'Folha de Pagamento': [
    { id: 'cpf_funcionario', label: 'CPF do Funcionário', type: 'text', placeholder: '000.000.000-00', required: true },
    { id: 'tipo_solicitacao', label: 'Tipo de Solicitação', type: 'select', required: true,
      options: ['Correção de Dados', 'Inclusão de Benefício', 'Exclusão de Benefício', 'Férias', 'Licença', 'Outros'] },
    { id: 'periodo_referencia', label: 'Período de Referência', type: 'text', placeholder: 'Ex: Janeiro/2025', required: true },
    { id: 'centro_custo', label: 'Centro de Custo', type: 'text', required: true }
  ],
  'Contas a Pagar': [
    { id: 'fornecedor', label: 'Nome do Fornecedor', type: 'text', required: true },
    { id: 'numero_nota_fiscal', label: 'Número da Nota Fiscal', type: 'text', required: true },
    { id: 'valor_pagamento', label: 'Valor do Pagamento (R$)', type: 'number', required: true },
    { id: 'data_vencimento', label: 'Data de Vencimento', type: 'text', placeholder: 'DD/MM/AAAA', required: true }
  ]
};

interface CreateTicketPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketPopup({ isOpen, onClose }: CreateTicketPopupProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requesterDepartment: '',
    primaryCategory: '',
    secondaryCategory: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dynamicFields: {} as Record<string, string>
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  // Buscar dados necessários
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });

  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen,
  });

  const { data: allCategories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  // Usuário atual
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Atualizar categorias disponíveis quando departamento primário muda
  useEffect(() => {
    if (formData.primaryCategory && allCategories) {
      const selectedDept = departments?.find(d => d.name === formData.primaryCategory);
      if (selectedDept) {
        const deptCategories = allCategories.filter(cat => cat.departmentId === selectedDept.id);
        setAvailableCategories(deptCategories);
      } else {
        setAvailableCategories([]);
      }
      
      setFormData(prev => ({ 
        ...prev, 
        secondaryCategory: '',
        dynamicFields: {}
      }));
    }
  }, [formData.primaryCategory, allCategories, departments]);

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      return apiRequest('/api/tickets', 'POST', ticketData);
    },
    onSuccess: () => {
      toast({
        title: 'Ticket criado com sucesso!',
        description: 'O ticket foi criado e será processado em breve.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      onClose();
      // Reset form
      setFormData({
        subject: '',
        description: '',
        requesterDepartment: '',
        primaryCategory: '',
        secondaryCategory: '',
        assignedTo: '',
        priority: 'medium',
        dynamicFields: {}
      });
      setSelectedFiles([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar ticket',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDept = departments?.find(d => d.name === formData.primaryCategory);
    const selectedCategory = availableCategories.find(c => c.name === formData.secondaryCategory);
    
    const ticketData = {
      title: formData.subject,
      description: formData.description,
      departmentId: selectedDept?.id,
      categoryId: selectedCategory?.id,
      priority: formData.priority,
      requesterId: currentUser?.id,
      assignedToId: formData.assignedTo || null,
      requesterDepartment: formData.requesterDepartment,
      customFields: formData.dynamicFields,
      status: 'open'
    };

    createTicketMutation.mutate(ticketData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDynamicFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldId]: value
      }
    }));
  };

  const primaryCategories = departments?.map(d => d.name) || [];
  const dynamicFields = DYNAMIC_FIELDS_CONFIG[formData.secondaryCategory] || [];

  // Se não estiver aberto, não renderizar nada
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Novo Ticket</h2>
            <p className="text-sm text-gray-600 mt-1">Preencha os campos abaixo para criar seu ticket</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Setor do Solicitante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor do Solicitante <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.requesterDepartment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, requesterDepartment: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor..." />
                </SelectTrigger>
                <SelectContent>
                  {primaryCategories.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departamento Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento Responsável <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.primaryCategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, primaryCategory: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento..." />
                </SelectTrigger>
                <SelectContent>
                  {primaryCategories.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.secondaryCategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, secondaryCategory: value }))}
                disabled={!formData.primaryCategory || availableCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.primaryCategory ? "Selecione um departamento primeiro" :
                    availableCategories.length === 0 ? "Nenhuma categoria disponível" : "Selecione..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos Dinâmicos */}
            {dynamicFields.length > 0 && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Informações Específicas</h3>
                {dynamicFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <Select
                        value={formData.dynamicFields[field.id] || ''}
                        onValueChange={(value) => handleDynamicFieldChange(field.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData.dynamicFields[field.id] || ''}
                        onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData.dynamicFields[field.id] || ''}
                        onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Atribuído a */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atribuído a
              </label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.filter(u => u.canHandleTickets).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Arquivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Paperclip className="h-5 w-5" />
                  <span>Clique para anexar arquivos</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 10MB por arquivo
                </p>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {createTicketMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Criando...</span>
                  </>
                ) : (
                  <span>Criar Ticket</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}