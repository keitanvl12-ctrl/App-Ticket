import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Settings,
  Users,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isSystem: boolean;
  userCount: number;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Usuários
  { id: 'users.read', name: 'Visualizar Usuários', description: 'Ver lista de usuários', category: 'Usuários' },
  { id: 'users.write', name: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários', category: 'Usuários' },
  { id: 'users.security', name: 'Segurança de Usuários', description: 'Alterar senhas e bloquear usuários', category: 'Usuários' },
  
  // Tickets
  { id: 'tickets.read', name: 'Visualizar Tickets', description: 'Ver todos os tickets', category: 'Tickets' },
  { id: 'tickets.write', name: 'Gerenciar Tickets', description: 'Criar, editar e excluir tickets', category: 'Tickets' },
  { id: 'tickets.assign', name: 'Atribuir Tickets', description: 'Atribuir tickets para outros usuários', category: 'Tickets' },
  { id: 'tickets.finalize', name: 'Finalizar Tickets', description: 'Finalizar e resolver tickets', category: 'Tickets' },
  
  // Departamentos
  { id: 'departments.read', name: 'Visualizar Departamentos', description: 'Ver departamentos', category: 'Departamentos' },
  { id: 'departments.write', name: 'Gerenciar Departamentos', description: 'Criar, editar e excluir departamentos', category: 'Departamentos' },
  
  // Relatórios
  { id: 'reports.read', name: 'Visualizar Relatórios', description: 'Acessar relatórios do sistema', category: 'Relatórios' },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Exportar dados dos relatórios', category: 'Relatórios' },
  
  // Configurações
  { id: 'settings.read', name: 'Visualizar Configurações', description: 'Ver configurações do sistema', category: 'Configurações' },
  { id: 'settings.write', name: 'Gerenciar Configurações', description: 'Alterar configurações do sistema', category: 'Configurações' },
  { id: 'settings.roles', name: 'Gerenciar Funções', description: 'Criar e editar funções e permissões', category: 'Configurações' },
  
  // SLA
  { id: 'sla.read', name: 'Visualizar SLA', description: 'Ver configurações de SLA', category: 'SLA' },
  { id: 'sla.write', name: 'Gerenciar SLA', description: 'Configurar regras de SLA', category: 'SLA' },
];

function RoleEditModal({ 
  role, 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  role: Role | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || '#3b82f6',
    permissions: role?.permissions || []
  });
  const { toast } = useToast();

  const saveRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (role) {
        return apiRequest(`/api/roles/${role.id}`, "PUT", data);
      } else {
        return apiRequest("/api/roles", "POST", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Função salva",
        description: `A função foi ${role ? 'atualizada' : 'criada'} com sucesso.`,
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar função",
        variant: "destructive",
      });
    },
  });

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da função é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    saveRoleMutation.mutate(formData);
  };

  // Group permissions by category
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {role ? `Editar Função - ${role.name}` : 'Nova Função'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Função</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Supervisor de TI"
                disabled={role?.isSystem}
              />
            </div>
            
            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva as responsabilidades desta função..."
              rows={3}
            />
          </div>

          <div>
            <Label className="text-lg font-semibold">Permissões</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione as permissões que esta função deve ter:
            </p>
            
            <div className="space-y-4">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={saveRoleMutation.isPending}
          >
            {saveRoleMutation.isPending ? 'Salvando...' : (role ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return apiRequest(`/api/roles/${roleId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Função removida",
        description: "A função foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover função",
        variant: "destructive",
      });
    },
  });

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setEditModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.userCount > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Esta função possui usuários vinculados. Remova os usuários primeiro.",
        variant: "destructive",
      });
      return;
    }

    deleteRoleMutation.mutate(role.id);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gerenciamento de Funções
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure funções e permissões do sistema
            </p>
          </div>
        </div>
        
        <Button onClick={handleCreateRole} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Função
        </Button>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Funções do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <div className="font-medium">{role.name}</div>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-md">
                      {role.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.permissions.length} permissões
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Edit Modal */}
      <RoleEditModal
        role={selectedRole}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRole(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
        }}
      />
    </div>
  );
}