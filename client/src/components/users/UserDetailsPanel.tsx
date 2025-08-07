import React, { useState } from 'react';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  avatar?: string | null;
  phone?: string;
  extension?: string;
  location?: string;
  manager?: string | null;
  permissions?: string[];
  ticketsAssigned?: number;
  ticketsResolved?: number;
  averageResolutionTime?: string;
  satisfactionRating?: number;
}

interface Department {
  id: string;
  name: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserDetailsPanelProps {
  userId: string;
  onClose: () => void;
  user?: User;
  departments: Department[];
  roles: Role[];
}

export default function UserDetailsPanel({
  userId,
  onClose,
  user,
  departments,
  roles
}: UserDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    extension: user?.extension || '',
    role: user?.role || '',
    department: user?.department || '',
    status: user?.status || 'active',
    location: user?.location || '',
    manager: user?.manager || ''
  });

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Usuário não encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              O usuário selecionado não pôde ser carregado.
            </p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    console.log('Saving user data:', formData);
    setIsEditing(false);
    // Implementar salvamento aqui
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      extension: user?.extension || '',
      role: user?.role || '',
      department: user?.department || '',
      status: user?.status || 'active',
      location: user?.location || '',
      manager: user?.manager || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-slate-600';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock activity data
  const recentActivity = [
    { 
      id: '1', 
      type: 'ticket_resolved', 
      description: 'Resolveu o ticket #1234 - Problema de rede', 
      timestamp: '2024-01-15T14:30:00Z' 
    },
    { 
      id: '2', 
      type: 'login', 
      description: 'Fez login no sistema', 
      timestamp: '2024-01-15T09:00:00Z' 
    },
    { 
      id: '3', 
      type: 'ticket_assigned', 
      description: 'Recebeu o ticket #1235 - Solicitação de acesso', 
      timestamp: '2024-01-14T16:45:00Z' 
    },
    { 
      id: '4', 
      type: 'profile_updated', 
      description: 'Atualizou informações do perfil', 
      timestamp: '2024-01-14T11:20:00Z' 
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_resolved': return 'CheckCircle';
      case 'ticket_assigned': return 'UserPlus';
      case 'login': return 'LogIn';
      case 'profile_updated': return 'Edit';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ticket_resolved': return 'text-green-600';
      case 'ticket_assigned': return 'text-blue-600';
      case 'login': return 'text-slate-600';
      case 'profile_updated': return 'text-orange-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white dark:border-slate-800 ${
                user.status === 'active' ? 'bg-green-500' : 
                user.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {user.name}
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-slate-600 dark:text-slate-400">
                  {getRoleName(user.role)} • {user.department}
                </span>
                <span className={`text-sm ${getStatusColor(user.status)}`}>
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                iconName="Edit"
                iconPosition="left"
              >
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  iconName="X"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  iconName="Save"
                  iconPosition="left"
                >
                  Salvar
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Informações Pessoais
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Nome Completo
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Telefone
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{user.phone || 'Não informado'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                          Ramal
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.extension}
                            onChange={(e) => setFormData({...formData, extension: e.target.value})}
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{user.extension || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Informações Profissionais
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Função
                      </label>
                      {isEditing ? (
                        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">{getRoleName(user.role)}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Departamento
                      </label>
                      {isEditing ? (
                        <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">{user.department}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Local
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">{user.location || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100 block mb-2">
                        Gerente
                      </label>
                      <p className="text-slate-600 dark:text-slate-400">{user.manager || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              {isEditing && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Status da Conta
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) => setFormData({...formData, status: checked ? 'active' : 'inactive'})}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Conta ativa
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Informações do Sistema
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Criado em:</span>
                    <p className="text-slate-900 dark:text-slate-100">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Último login:</span>
                    <p className="text-slate-900 dark:text-slate-100">{formatDate(user.lastLogin)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Permissões do Usuário
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.permissions?.map((permission, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon name="Shield" size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {permission.replace('.', ' - ').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <Icon name="CheckCircle" size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Atividade Recente
                </h3>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Icon 
                        name={getActivityIcon(activity.type) as any} 
                        size={20} 
                        className={getActivityColor(activity.type)} 
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              {user.role === 'operator' ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Métricas de Performance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.ticketsAssigned || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Tickets Ativos
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.ticketsResolved || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Tickets Resolvidos
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.averageResolutionTime || '-'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Tempo Médio
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.satisfactionRating?.toFixed(1) || '-'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Satisfação
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="BarChart3" size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Métricas não disponíveis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    As métricas de performance estão disponíveis apenas para operadores.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}