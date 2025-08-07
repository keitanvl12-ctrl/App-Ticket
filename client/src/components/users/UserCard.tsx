import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/Button';
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

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onCheck: () => void;
  departments: Department[];
  roles: Role[];
}

export default function UserCard({
  user,
  isSelected,
  onSelect,
  onCheck,
  departments,
  roles
}: UserCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} dia(s) atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'operator': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'user': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border transition-all duration-200 hover:shadow-md ${
      isSelected 
        ? 'border-blue-500 shadow-sm ring-1 ring-blue-500' 
        : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onCheck}
            />
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${getStatusColor(user.status)}`}></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelect}
              iconName="Eye"
            />
            <Button
              size="sm"
              variant="ghost"
              iconName="Edit"
            />
            <Button
              size="sm"
              variant="ghost"
              iconName="MoreHorizontal"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="space-y-3">
          <div>
            <button
              onClick={onSelect}
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left w-full"
            >
              {user.name}
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {user.email}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              {getRoleName(user.role)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {getStatusLabel(user.status)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Icon name="Building" size={14} />
              <span>{user.department}</span>
            </div>
            
            {user.location && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Icon name="MapPin" size={14} />
                <span>{user.location}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Icon name="Clock" size={14} />
              <span>Último acesso: {formatDate(user.lastLogin)}</span>
            </div>
          </div>

          {/* Performance Metrics for Operators */}
          {user.role === 'operator' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {user.ticketsAssigned || 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Ativos
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {user.ticketsResolved || 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Resolvidos
                  </div>
                </div>
              </div>
              
              {user.satisfactionRating && user.satisfactionRating > 0 && (
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <Icon name="Star" size={12} className="text-yellow-500 fill-current" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {user.satisfactionRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center space-x-2">
          {user.phone && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              iconName="Phone"
            >
              Ligar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            iconName="Mail"
          >
            Email
          </Button>
        </div>
      </div>
    </div>
  );
}