import React, { useState } from 'react';
import UserDataGrid from '@/components/users/UserDataGrid';
import UserDetailsPanel from '@/components/users/UserDetailsPanel';
import FilterPanel from '@/components/users/FilterPanel';
import BulkActionsPanel from '@/components/users/BulkActionsPanel';
import ActivityMonitor from '@/components/users/ActivityMonitor';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function UserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    department: '',
    lastLogin: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showActivityMonitor, setShowActivityMonitor] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    extension: '',
    location: '',
    manager: ''
  });

  // Mock data
  const users = [
    {
      id: '1',
      name: 'João Silva Santos',
      email: 'joao.silva@empresa.com',
      role: 'admin',
      status: 'active',
      department: 'Tecnologia da Informação',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2023-06-15T00:00:00Z',
      avatar: null,
      phone: '(11) 99999-9999',
      extension: '1001',
      location: 'São Paulo - SP',
      manager: 'Maria Santos',
      permissions: ['users.read', 'users.write', 'tickets.read', 'tickets.write', 'reports.read'],
      ticketsAssigned: 12,
      ticketsResolved: 145,
      averageResolutionTime: '2.5 horas',
      satisfactionRating: 4.7
    },
    {
      id: '2',
      name: 'Maria Santos Oliveira',
      email: 'maria.santos@empresa.com',
      role: 'operator',
      status: 'active',
      department: 'Suporte ao Cliente',
      lastLogin: '2024-01-15T14:22:00Z',
      createdAt: '2023-03-10T00:00:00Z',
      avatar: null,
      phone: '(11) 88888-8888',
      extension: '1002',
      location: 'São Paulo - SP',
      manager: 'João Silva Santos',
      permissions: ['tickets.read', 'tickets.write', 'knowledge.read'],
      ticketsAssigned: 8,
      ticketsResolved: 98,
      averageResolutionTime: '3.1 horas',
      satisfactionRating: 4.5
    },
    {
      id: '3',
      name: 'Carlos Eduardo Lima',
      email: 'carlos.lima@empresa.com',
      role: 'user',
      status: 'inactive',
      department: 'Recursos Humanos',
      lastLogin: '2024-01-10T16:45:00Z',
      createdAt: '2023-08-20T00:00:00Z',
      avatar: null,
      phone: '(11) 77777-7777',
      extension: '1003',
      location: 'Rio de Janeiro - RJ',
      manager: 'Ana Costa',
      permissions: ['tickets.create', 'profile.read'],
      ticketsAssigned: 0,
      ticketsResolved: 0,
      averageResolutionTime: '-',
      satisfactionRating: 0
    },
    {
      id: '4',
      name: 'Ana Costa Ferreira',
      email: 'ana.costa@empresa.com',
      role: 'manager',
      status: 'active',
      department: 'Recursos Humanos',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2023-01-05T00:00:00Z',
      avatar: null,
      phone: '(11) 66666-6666',
      extension: '1004',
      location: 'Rio de Janeiro - RJ',
      manager: null,
      permissions: ['users.read', 'tickets.read', 'reports.read', 'reports.write'],
      ticketsAssigned: 0,
      ticketsResolved: 0,
      averageResolutionTime: '-',
      satisfactionRating: 0
    }
  ];

  const departments = [
    { id: '1', name: 'Tecnologia da Informação', userCount: 15 },
    { id: '2', name: 'Suporte ao Cliente', userCount: 25 },
    { id: '3', name: 'Recursos Humanos', userCount: 8 },
    { id: '4', name: 'Financeiro', userCount: 12 },
    { id: '5', name: 'Comercial', userCount: 18 }
  ];

  const roles = [
    { id: 'admin', name: 'Administrador', description: 'Acesso completo ao sistema' },
    { id: 'manager', name: 'Gerente', description: 'Gerenciamento de equipe e relatórios' },
    { id: 'operator', name: 'Operador', description: 'Atendimento e resolução de chamados' },
    { id: 'user', name: 'Usuário', description: 'Criação de chamados apenas' }
  ];

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleUserMultiSelect = (userIds: string[]) => {
    setSelectedUsers(userIds);
    setShowBulkActions(userIds.length > 0);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleBulkAction = (action: string, userIds: string[]) => {
    console.log(`Bulk action: ${action} for users:`, userIds);
    // Implementar ações em lote aqui
    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
    setNewUser({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      extension: '',
      location: '',
      manager: ''
    });
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.department) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newUserData = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      department: newUser.department,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      avatar: null,
      phone: newUser.phone,
      extension: newUser.extension,
      location: newUser.location || 'São Paulo - SP',
      manager: newUser.manager || null,
      permissions: getDefaultPermissions(newUser.role),
      ticketsAssigned: 0,
      ticketsResolved: 0,
      averageResolutionTime: '-',
      satisfactionRating: 0
    };

    console.log('Novo usuário criado:', newUserData);
    // Aqui você adicionaria a lógica para salvar no backend
    
    setShowCreateUserModal(false);
    alert('Usuário criado com sucesso!');
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return ['users.read', 'users.write', 'tickets.read', 'tickets.write', 'reports.read', 'reports.write'];
      case 'manager':
        return ['users.read', 'tickets.read', 'tickets.write', 'reports.read', 'reports.write'];
      case 'operator':
        return ['tickets.read', 'tickets.write', 'knowledge.read'];
      case 'user':
        return ['tickets.create', 'profile.read'];
      default:
        return ['profile.read'];
    }
  };

  const handleImportUsers = () => {
    console.log('Import users from file');
    // Implementar importação de usuários
  };

  const filteredUsers = users.filter(user => {
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && user.status !== filters.status) return false;
    if (filters.role && user.role !== filters.role) return false;
    if (filters.department && user.department !== filters.department) return false;
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length,
    operators: users.filter(u => u.role === 'operator').length,
    regularUsers: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Gerenciamento de Usuários
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie contas de usuário, permissões e atividades da equipe
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowActivityMonitor(!showActivityMonitor)}
            iconName="Activity"
            iconPosition="left"
          >
            Monitor
          </Button>
          
          <Button
            variant="outline"
            onClick={handleImportUsers}
            iconName="Upload"
            iconPosition="left"
          >
            Importar
          </Button>
          
          <Button
            onClick={handleCreateUser}
            iconName="Plus"
            iconPosition="left"
          >
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.total}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.active}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Ativos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="XCircle" size={20} className="text-red-600 dark:text-red-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.inactive}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Inativos
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={20} className="text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.admins}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Admins
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="Headphones" size={20} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.operators}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Operadores
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Icon name="User" size={20} className="text-slate-600 dark:text-slate-400" />
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.regularUsers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Usuários
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              iconName="Filter"
              iconPosition="left"
            >
              Filtros
            </Button>
            
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
                iconName="Grid3X3"
              />
              <Button
                variant={viewMode === 'list' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('list')}
                iconName="List"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
            <span>{filteredUsers.length} de {users.length} usuários</span>
            {selectedUsers.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {selectedUsers.length} selecionado(s)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFilterChange}
              departments={departments}
              roles={roles}
              userStats={stats}
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
          {/* Bulk Actions */}
          {showBulkActions && (
            <BulkActionsPanel
              selectedUsers={selectedUsers}
              onBulkAction={handleBulkAction}
              onClear={() => {
                setSelectedUsers([]);
                setShowBulkActions(false);
              }}
            />
          )}

          {/* User Data Grid */}
          <UserDataGrid
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onUserMultiSelect={handleUserMultiSelect}
            viewMode={viewMode}
            departments={departments}
            roles={roles}
          />
        </div>
      </div>

      {/* User Details Panel */}
      {selectedUser && (
        <UserDetailsPanel
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          user={users.find(u => u.id === selectedUser)}
          departments={departments}
          roles={roles}
        />
      )}

      {/* Activity Monitor */}
      {showActivityMonitor && (
        <ActivityMonitor
          onClose={() => setShowActivityMonitor(false)}
          users={users}
        />
      )}

      {/* Create User Modal */}
      <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome *
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
                placeholder="usuario@empresa.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função *
              </Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Departamento *
              </Label>
              <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="col-span-3"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="extension" className="text-right">
                Ramal
              </Label>
              <Input
                id="extension"
                value={newUser.extension}
                onChange={(e) => setNewUser({ ...newUser, extension: e.target.value })}
                className="col-span-3"
                placeholder="1001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Localização
              </Label>
              <Input
                id="location"
                value={newUser.location}
                onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                className="col-span-3"
                placeholder="São Paulo - SP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateUserModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}