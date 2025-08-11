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

// Configurações de campos dinâmicos por categoria
const DYNAMIC_FIELDS_CONFIG: Record<string, DynamicField[]> = {
  'Suporte Técnico': [
    { id: 'tipo_ticket', label: 'Tipo de Ticket', type: 'select', required: true, 
      options: ['Instalação de Software', 'Problemas de Hardware', 'Problemas de Rede', 'Outros'] },
    { id: 'equipamento', label: 'Equipamento/Sistema', type: 'text', placeholder: 'Ex: Notebook Dell, Sistema XYZ', required: true },
    { id: 'urgencia_negocio', label: 'Urgência do Negócio', type: 'select', required: true,
      options: ['Baixa', 'Média', 'Alta', 'Crítica'] }
  ],
  'Recursos Humanos': [
    { id: 'tipo_ticket', label: 'Tipo de Ticket', type: 'select', required: true,
      options: ['Férias', 'Licença', 'Benefícios', 'Folha de Pagamento', 'Outros'] },
    { id: 'cpf_solicitante', label: 'Qual CPF do solicitante?', type: 'text', placeholder: '000.000.000-00', required: true },
    { id: 'email_solicitante', label: 'Qual e-mail?', type: 'email', placeholder: '(Email) Pressione Enter ou Tab', required: true },
    { id: 'celular_solicitante', label: 'Número do Celular do solicitante', type: 'tel', required: true },
    { id: 'centro_custo', label: 'Qual Centro de Custo do solicitante?', type: 'text', required: true },
    { id: 'superior_direto', label: 'Superior Direto', type: 'text', required: true }
  ],
  'Financeiro': [
    { id: 'tipo_ticket', label: 'Tipo de Ticket', type: 'select', required: true,
      options: ['Contas a Pagar', 'Contas a Receber', 'Reembolso', 'Orçamento', 'Outros'] },
    { id: 'valor_envolvido', label: 'Valor Envolvido', type: 'number', placeholder: 'R$ 0,00', required: true },
    { id: 'centro_custo', label: 'Centro de Custo', type: 'text', required: true },
    { id: 'aprovador', label: 'Aprovador Responsável', type: 'text', required: true }
  ],
  'Jurídico': [
    { id: 'tipo_ticket', label: 'Tipo de Ticket', type: 'select', required: true,
      options: ['Contrato', 'Assessoria Legal', 'Compliance', 'Outros'] },
    { id: 'prazo_resposta', label: 'Prazo para Resposta', type: 'select', required: true,
      options: ['24 horas', '48 horas', '1 semana', '2 semanas', 'Não urgente'] },
    { id: 'area_direito', label: 'Área do Direito', type: 'select', required: true,
      options: ['Trabalhista', 'Tributário', 'Civil', 'Empresarial', 'Outros'] }
  ],
  'Marketing': [
    { id: 'tipo_ticket', label: 'Tipo de Ticket', type: 'select', required: true,
      options: ['Campanha', 'Material Gráfico', 'Evento', 'Mídias Sociais', 'Outros'] },
    { id: 'prazo_entrega', label: 'Prazo de Entrega', type: 'text', placeholder: 'Ex: 15 dias', required: true },
    { id: 'publico_alvo', label: 'Público Alvo', type: 'text', required: true },
    { id: 'orcamento_estimado', label: 'Orçamento Estimado', type: 'number', placeholder: 'R$ 0,00' }
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
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Buscar dados necessários
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });

  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen,
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: isOpen,
  });

  // Usuário atual
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Atualizar subcategorias quando categoria primária muda
  useEffect(() => {
    if (formData.primaryCategory) {
      // Simular subcategorias baseadas na categoria primária
      const mockSubcategories: Record<string, string[]> = {
        'Tecnologia': ['Suporte Técnico', 'Desenvolvimento', 'Infraestrutura'],
        'Custos': ['Cartão Clara', 'Reembolso Protheus'],
        'Departamento Pessoal': ['Folha de Pagamento', 'Benefícios', 'Admissão/Demissão'],
        'Jurídico': ['Contratos', 'Assessoria Legal', 'Compliance'],
        'Marketing': ['Campanhas', 'Material Gráfico', 'Eventos'],
        'Qualidade': ['Auditoria', 'Processos', 'Melhorias']
      };
      
      setSubcategories(mockSubcategories[formData.primaryCategory] || []);
      setFormData(prev => ({ 
        ...prev, 
        secondaryCategory: '',
        dynamicFields: {} // Reset dynamic fields when category changes
      }));
    }
  }, [formData.primaryCategory]);

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

  const primaryCategories = ['Custos', 'Departamento Pessoal', 'Jurídico', 'Marketing', 'Qualidade', 'Tecnologia'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Novo Ticket
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

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
              disabled={!formData.primaryCategory}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={
                  formData.primaryCategory ? "Selecione..." : "Selecione uma categoria primária antes"
                } />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input placeholder="Pesquisar" className="mb-2" />
                </div>
                {subcategories.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {subcat}
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
      </DialogContent>
    </Dialog>
  );
}