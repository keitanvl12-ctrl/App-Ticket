import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  Shield,
  Edit,
  Save,
  X,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({ userId, isOpen, onClose }: UserDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacoes');

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && isOpen,
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Fetch user performance data
  const { data: performance } = useQuery({
    queryKey: [`/api/users/${userId}/performance`],
    enabled: !!userId && isOpen,
  });

  // Fetch user activity logs
  const { data: activities = [] } = useQuery({
    queryKey: [`/api/users/${userId}/activities`],
    enabled: !!userId && isOpen,
  });

  // Fetch user permissions
  const { data: userPermissions } = useQuery({
    queryKey: [`/api/users/${userId}/permissions`],
    enabled: !!userId && isOpen,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    role: '',
    departmentId: '',
    location: '',
    extension: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        role: user.role || '',
        departmentId: user.departmentId || '',
        location: user.location || '',
        extension: user.extension || ''
      });
    }
  }, [user]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/users/${userId}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      setIsEditing(false);
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        role: user.role || '',
        departmentId: user.departmentId || '',
        location: user.location || '',
        extension: user.extension || ''
      });
    }
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'colaborador': return 'Colaborador';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'supervisor': return 'default';
      case 'colaborador': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find((d: any) => d.id === departmentId);
    return dept?.name || 'Não definido';
  };

  if (!userId || !isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-gradient-to-br from-[#2c4257] to-[#6b8fb0] text-white text-xl">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{user?.name}</DialogTitle>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge variant={getRoleBadgeVariant(user?.role)}>
                    {getRoleLabel(user?.role)}
                  </Badge>
                  {user?.isBlocked ? (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      <UserX className="w-3 h-3 mr-1" />
                      Bloqueado
                    </Badge>
                  ) : user?.isActive ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600 border-gray-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={updateUserMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateUserMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="informacoes" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="atividade" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Atividade
            </TabsTrigger>
            <TabsTrigger value="permissoes" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          {/* Informações Tab */}
          <TabsContent value="informacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="extension">Ramal</Label>
                    <Input
                      id="extension"
                      value={formData.extension}
                      onChange={(e) => setFormData(prev => ({ ...prev, extension: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="1001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="São Paulo - SP"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Organizacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Criação</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Último Acesso</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(user?.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Atribuídos</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performance?.assignedTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">Total de tickets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Resolvidos</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{performance?.resolvedTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">Tickets finalizados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {performance?.resolutionRate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Eficiência</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo Médio de Resolução</span>
                    <span className="text-sm">{performance?.averageResolutionTime || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avaliação de Satisfação</span>
                    <span className="text-sm">{performance?.satisfactionRating || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tickets em Andamento</span>
                    <span className="text-sm">{performance?.openTickets || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividade Tab */}
          <TabsContent value="atividade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Nenhuma atividade registrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissões Tab */}
          <TabsContent value="permissoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permissões do Sistema</CardTitle>
                <p className="text-sm text-muted-foreground">
                  As permissões são definidas pela função do usuário: <strong>{getRoleLabel(user?.role)}</strong>
                </p>
              </CardHeader>
              <CardContent>
                {userPermissions ? (
                  <div className="space-y-4">
                    {Object.entries(userPermissions).map(([category, permissions]: [string, any]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(permissions).map(([permission, hasPermission]: [string, any]) => (
                              <div key={permission} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="text-sm">{permission}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Carregando permissões...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}