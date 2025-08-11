import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Paperclip, X, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'tel';
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
  'Bug de Sistema': [
    { id: 'sistema_afetado', label: 'Sistema Afetado', type: 'text', placeholder: 'Ex: Sistema ERP, Portal Web', required: true },
    { id: 'funcionalidade', label: 'Funcionalidade com Problema', type: 'text', required: true },
    { id: 'passos_reproduzir', label: 'Passos para Reproduzir o Bug', type: 'textarea', required: true },
    { id: 'resultado_esperado', label: 'Resultado Esperado', type: 'textarea', required: true }
  ],
  'Nova Funcionalidade': [
    { id: 'sistema_destino', label: 'Sistema de Destino', type: 'text', required: true },
    { id: 'descricao_funcionalidade', label: 'Descrição da Nova Funcionalidade', type: 'textarea', required: true },
    { id: 'justificativa_negocio', label: 'Justificativa de Negócio', type: 'textarea', required: true },
    { id: 'prazo_desejado', label: 'Prazo Desejado', type: 'text', placeholder: 'Ex: 30 dias' }
  ],
  'Desenvolvimento de Software': [
    { id: 'tipo_solicitacao', label: 'Tipo de Solicitação', type: 'select', required: true,
      options: ['Nova Funcionalidade', 'Correção de Bug', 'Melhoria', 'Integração', 'Outros'] },
    { id: 'sistema_envolvido', label: 'Sistema Envolvido', type: 'text', required: true },
    { id: 'especificacao_tecnica', label: 'Especificação Técnica', type: 'textarea', required: true },
    { id: 'prazo_estimado', label: 'Prazo Estimado Desejado', type: 'text', placeholder: 'Ex: 2 semanas' }
  ],
  'Folha de Pagamento': [
    { id: 'cpf_funcionario', label: 'CPF do Funcionário', type: 'text', placeholder: '000.000.000-00', required: true },
    { id: 'tipo_solicitacao', label: 'Tipo de Solicitação', type: 'select', required: true,
      options: ['Correção de Dados', 'Inclusão de Benefício', 'Exclusão de Benefício', 'Férias', 'Licença', 'Outros'] },
    { id: 'periodo_referencia', label: 'Período de Referência', type: 'text', placeholder: 'Ex: Janeiro/2025', required: true },
    { id: 'centro_custo', label: 'Centro de Custo', type: 'text', required: true },
    { id: 'aprovador_rh', label: 'Aprovador RH', type: 'text', required: true }
  ],
  'Benefícios': [
    { id: 'cpf_beneficiario', label: 'CPF do Beneficiário', type: 'text', placeholder: '000.000.000-00', required: true },
    { id: 'tipo_beneficio', label: 'Tipo de Benefício', type: 'select', required: true,
      options: ['Plano de Saúde', 'Vale Transporte', 'Vale Alimentação', 'Vale Refeição', 'Seguro de Vida', 'Outros'] },
    { id: 'acao_solicitada', label: 'Ação Solicitada', type: 'select', required: true,
      options: ['Inclusão', 'Alteração', 'Exclusão', 'Consulta'] },
    { id: 'data_inicio_vigencia', label: 'Data de Início da Vigência', type: 'text', placeholder: 'DD/MM/AAAA' }
  ],
  'Recrutamento': [
    { id: 'cargo_vaga', label: 'Cargo da Vaga', type: 'text', required: true },
    { id: 'departamento_solicitante', label: 'Departamento Solicitante', type: 'text', required: true },
    { id: 'quantidade_vagas', label: 'Quantidade de Vagas', type: 'number', required: true },
    { id: 'requisitos_vaga', label: 'Requisitos da Vaga', type: 'textarea', required: true },
    { id: 'aprovador_gestor', label: 'Gestor Aprovador', type: 'text', required: true }
  ],
  'Contabilidade': [
    { id: 'tipo_solicitacao_contabil', label: 'Tipo de Solicitação', type: 'select', required: true,
      options: ['Lançamento Contábil', 'Conciliação', 'Relatório', 'Consulta Fiscal', 'Outros'] },
    { id: 'periodo_competencia', label: 'Período de Competência', type: 'text', placeholder: 'Ex: Janeiro/2025', required: true },
    { id: 'valor_envolvido', label: 'Valor Envolvido (R$)', type: 'number', placeholder: '0,00' },
    { id: 'centro_custo_contabil', label: 'Centro de Custo', type: 'text', required: true }
  ],
  'Contas a Pagar': [
    { id: 'fornecedor', label: 'Nome do Fornecedor', type: 'text', required: true },
    { id: 'numero_nota_fiscal', label: 'Número da Nota Fiscal', type: 'text', required: true },
    { id: 'valor_pagamento', label: 'Valor do Pagamento (R$)', type: 'number', required: true },
    { id: 'data_vencimento', label: 'Data de Vencimento', type: 'text', placeholder: 'DD/MM/AAAA', required: true },
    { id: 'centro_custo_pagamento', label: 'Centro de Custo', type: 'text', required: true },
    { id: 'aprovador_financeiro', label: 'Aprovador Financeiro', type: 'text', required: true }
  ],
  'Orçamento': [
    { id: 'periodo_orcamento', label: 'Período do Orçamento', type: 'text', placeholder: 'Ex: 2025', required: true },
    { id: 'departamento_orcamento', label: 'Departamento', type: 'text', required: true },
    { id: 'tipo_orcamento', label: 'Tipo de Solicitação', type: 'select', required: true,
      options: ['Elaboração de Orçamento', 'Revisão de Orçamento', 'Análise de Desvios', 'Consulta', 'Outros'] },
    { id: 'valor_orcamento', label: 'Valor Orçado (R$)', type: 'number', placeholder: '0,00' },
    { id: 'justificativa_orcamento', label: 'Justificativa', type: 'textarea', required: true }
  ]
};

export default function CreateTicketModalNew({ isOpen, onClose }: CreateTicketModalNewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    requesterDepartment: '',
    primaryCategory: '',
    secondaryCategory: '',
    requesterName: '',
    requesterEmail: '',
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
      // Buscar departamento selecionado
      const selectedDept = departments?.find(d => d.name === formData.primaryCategory);
      if (selectedDept) {
        // Filtrar categorias por departamento
        const deptCategories = allCategories.filter(cat => cat.departmentId === selectedDept.id);
        setAvailableCategories(deptCategories);
      } else {
        setAvailableCategories([]);
      }
      
      setFormData(prev => ({ 
        ...prev, 
        secondaryCategory: '',
        dynamicFields: {} // Reset dynamic fields when category changes
      }));
    }
  }, [formData.primaryCategory, allCategories, departments]);

  // Obter campos dinâmicos baseados na categoria secundária
  const getDynamicFields = (): DynamicField[] => {
    if (!formData.secondaryCategory) return [];
    return DYNAMIC_FIELDS_CONFIG[formData.secondaryCategory] || [];
  };

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      const ticketData = {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.secondaryCategory,
        responsibleDepartmentId: departments?.find(d => d.name === data.primaryCategory)?.id || null,
        requesterDepartmentId: currentUser.departmentId || null,
        createdBy: currentUser.id,
        assignedTo: null,
        customFields: {
          requesterName: data.requesterName,
          requesterEmail: data.requesterEmail,
          ...data.dynamicFields
        }
      };

      return apiRequest('/api/tickets', 'POST', ticketData);
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Ticket criado com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      handleReset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar ticket',
        variant: 'destructive',
      });
    },
  });

  const handleReset = () => {
    setFormData({
      subject: '',
      description: '',
      requesterDepartment: '',
      primaryCategory: '',
      secondaryCategory: '',
      requesterName: '',
      requesterEmail: '',
      priority: 'medium',
      dynamicFields: {}
    });
    setSelectedFiles([]);
    setSubcategories([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.subject.trim()) {
      toast({ title: 'Erro', description: 'Assunto é obrigatório', variant: 'destructive' });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({ title: 'Erro', description: 'Descrição é obrigatória', variant: 'destructive' });
      return;
    }
    
    if (!formData.primaryCategory) {
      toast({ title: 'Erro', description: 'Categoria Primária é obrigatória', variant: 'destructive' });
      return;
    }
    
    if (!formData.secondaryCategory) {
      toast({ title: 'Erro', description: 'Categoria Secundária é obrigatória', variant: 'destructive' });
      return;
    }

    // Validar campos dinâmicos obrigatórios
    const dynamicFields = getDynamicFields();
    for (const field of dynamicFields) {
      if (field.required && !formData.dynamicFields[field.id]) {
        toast({ 
          title: 'Erro', 
          description: `${field.label} é obrigatório`, 
          variant: 'destructive' 
        });
        return;
      }
    }

    createTicketMutation.mutate(formData);
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

  // Usar departamentos reais como categorias primárias
  const primaryCategories = departments?.map(d => d.name) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Novo Ticket</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assunto */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Assunto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="mt-1"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 min-h-[100px]"
              required
            />
          </div>

          {/* Setor do Solicitante */}
          <div>
            <Label htmlFor="requesterDepartment" className="text-sm font-medium">
              Setor do Solicitante <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.requesterDepartment}
              onValueChange={(value) => setFormData(prev => ({ ...prev, requesterDepartment: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria Primária */}
          <div>
            <Label htmlFor="primaryCategory" className="text-sm font-medium">
              Categoria Primária <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.primaryCategory}
              onValueChange={(value) => setFormData(prev => ({ ...prev, primaryCategory: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input placeholder="Pesquisar" className="mb-2" />
                </div>
                {primaryCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria Secundária */}
          <div>
            <Label htmlFor="secondaryCategory" className="text-sm font-medium">
              Categoria Secundária <span className="text-red-500">*</span>
              <span className="text-red-600 text-xs ml-2">
                (Para abertura do ticket, é obrigatório a seleção do último nível das categorias que estão sinalizadas na cor verde)
              </span>
            </Label>
            <Select
              value={formData.secondaryCategory}
              onValueChange={(value) => setFormData(prev => ({ ...prev, secondaryCategory: value }))}
              disabled={!formData.primaryCategory || availableCategories.length === 0}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={
                  !formData.primaryCategory ? "Selecione um departamento primeiro" :
                  availableCategories.length === 0 ? "Nenhuma categoria disponível" : "Selecione..."
                } />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input placeholder="Pesquisar" className="mb-2" />
                </div>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Solicitante */}
          <div>
            <Label htmlFor="requesterName" className="text-sm font-medium">
              Nome do Solicitante (Completo) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
              className="mt-1"
              placeholder="Felipe"
              required
            />
          </div>

          {/* Contato Email */}
          <div>
            <Label htmlFor="requesterEmail" className="text-sm font-medium">
              Contato Email <span className="text-red-500">*</span>
              <span className="text-red-600 text-xs ml-2">
                (Após digitar o e-mail, pressione Enter ou Tab)
              </span>
            </Label>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-900 text-white text-xs px-2 py-1">
                FELIPE.LACERDA@GRUPOOPUS.COM
              </Badge>
              <Input
                id="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                placeholder="(Email) Pressione Enter ou Tab"
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* Campos Dinâmicos */}
          {getDynamicFields().map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === 'select' ? (
                <Select
                  value={formData.dynamicFields[field.id] || ''}
                  onValueChange={(value) => handleDynamicFieldChange(field.id, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma opção" />
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
                <Textarea
                  id={field.id}
                  value={formData.dynamicFields[field.id] || ''}
                  onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData.dynamicFields[field.id] || ''}
                  onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {/* Prioridade */}
          <div>
            <Label htmlFor="priority" className="text-sm font-medium">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anexos */}
          <div>
            <Label className="text-sm font-medium">
              Anexo <Badge variant="outline" className="ml-2">i</Badge>
            </Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Clique aqui para carregar seu arquivo.</p>
              </label>
            </div>
            
            {/* Lista de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? 'Criando...' : 'Criar Ticket'}
            </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}