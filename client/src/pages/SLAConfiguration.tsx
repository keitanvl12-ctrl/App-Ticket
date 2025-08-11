import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Clock, Target, AlertTriangle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SLARule {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationTimeHours?: number;
  isActive: boolean;
  createdAt: string;
}

export default function SLAConfiguration() {
  const [selectedTab, setSelectedTab] = useState('department');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLARule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    departmentId: 'all',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    timeHours: 24,
    isActive: true
  });

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
  });

  // Buscar regras SLA (mock data por enquanto)
  const { data: slaRules, isLoading } = useQuery<SLARule[]>({
    queryKey: ['/api/sla/rules'],
    queryFn: async () => {
      // Mock data - substituir pela API real
      return [
        {
          id: '1',
          name: 'SLA TI - Alta Prioridade',
          departmentId: 'e9802450-3847-494a-a5fb-0c86a97ac8b7',
          departmentName: 'Tecnologia da Informação',
          category: 'Infraestrutura',
          priority: 'high',
          responseTimeHours: 4,
          resolutionTimeHours: 4,
          isActive: true,
          createdAt: '2025-01-08'
        },
        {
          id: '2',
          name: 'SLA RH - Geral',
          departmentId: '1d97ffe4-ac1f-4a53-a029-e1b464775c33',
          departmentName: 'Recursos Humanos',
          priority: 'medium',
          responseTimeHours: 24,
          resolutionTimeHours: 24,
          isActive: true,
          createdAt: '2025-01-08'
        },
        {
          id: '3',
          name: 'SLA Crítico - Sistema',
          priority: 'critical',
          responseTimeHours: 2,
          resolutionTimeHours: 2,
          isActive: true,
          createdAt: '2025-01-08'
        }
      ] as SLARule[];
    }
  });

  // Mutation para criar/atualizar SLA
  const saveSLAMutation = useMutation({
    mutationFn: async (data: Partial<SLARule>) => {
      const method = editingSLA ? 'PUT' : 'POST';
      const url = editingSLA ? `/api/sla/rules/${editingSLA.id}` : '/api/sla/rules';
      return apiRequest(url, method, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sla/rules'] });
      resetForm();
      toast({
        title: 'SLA salvo',
        description: 'Regra SLA foi salva com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar regra SLA.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para excluir SLA
  const deleteSLAMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/sla/rules/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sla/rules'] });
      toast({
        title: 'SLA excluído',
        description: 'Regra SLA foi excluída com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir regra SLA.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      departmentId: 'all',
      category: '',
      priority: 'medium',
      timeHours: 24,
      isActive: true
    });
    setEditingSLA(null);
    setIsCreateModalOpen(false);
  };

  const handleEdit = (sla: SLARule) => {
    setEditingSLA(sla);
    setFormData({
      name: sla.name,
      departmentId: sla.departmentId || 'all',
      category: sla.category || '',
      priority: sla.priority,
      timeHours: sla.resolutionTimeHours || 24,
      isActive: sla.isActive
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSLAMutation.mutate({
      ...formData,
      id: editingSLA?.id
    });
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    };
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${hours * 60}min`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  const filteredSLAs = slaRules?.filter(sla => {
    if (selectedTab === 'department') return !!sla.departmentId;
    if (selectedTab === 'category') return !!sla.category && !sla.departmentId;
    if (selectedTab === 'priority') return !sla.departmentId && !sla.category;
    return true;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de SLAs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure os acordos de nível de serviço por departamento, categoria e prioridade
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra SLA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSLA ? 'Editar Regra SLA' : 'Nova Regra SLA'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Regra</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: SLA TI - Alta Prioridade"
                  required
                />
              </div>

              <div>
                <Label htmlFor="departmentId">Departamento (Opcional)</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({...formData, departmentId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os departamentos</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Categoria (Opcional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Infraestrutura, Software"
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({...formData, priority: value})}
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

              <div>
                <Label htmlFor="timeHours">Tempo SLA (horas)</Label>
                <Input
                  id="timeHours"
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.timeHours}
                  onChange={(e) => setFormData({...formData, timeHours: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveSLAMutation.isPending}>
                  {saveSLAMutation.isPending ? 'Salvando...' : editingSLA ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="department">Por Departamento</TabsTrigger>
          <TabsTrigger value="category">Por Categoria</TabsTrigger>
          <TabsTrigger value="priority">Por Prioridade</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>
                  {selectedTab === 'department' && 'Regras SLA por Departamento'}
                  {selectedTab === 'category' && 'Regras SLA por Categoria'}
                  {selectedTab === 'priority' && 'Regras SLA por Prioridade'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Carregando regras SLA...</p>
                </div>
              ) : filteredSLAs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      {selectedTab === 'department' && <TableHead>Departamento</TableHead>}
                      {selectedTab === 'category' && <TableHead>Categoria</TableHead>}
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Tempo SLA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSLAs.map((sla) => (
                      <TableRow key={sla.id}>
                        <TableCell className="font-medium">{sla.name}</TableCell>
                        {selectedTab === 'department' && (
                          <TableCell>{sla.departmentName}</TableCell>
                        )}
                        {selectedTab === 'category' && (
                          <TableCell>{sla.category}</TableCell>
                        )}
                        <TableCell>{getPriorityBadge(sla.priority)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4 text-green-500" />
                            <span>{formatTime(sla.resolutionTimeHours)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sla.isActive ? 'default' : 'secondary'}>
                            {sla.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handleEdit(sla)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-red-600 hover:text-red-700"
                              onClick={() => deleteSLAMutation.mutate(sla.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Nenhuma regra SLA configurada para {selectedTab === 'department' ? 'departamentos' : 
                    selectedTab === 'category' ? 'categorias' : 'prioridades'}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira regra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}