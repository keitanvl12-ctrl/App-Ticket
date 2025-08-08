import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  UserCheck,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface ExpandableSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function ExpandableSidebar({ currentPath, onNavigate }: ExpandableSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <Ticket className="w-5 h-5" />, label: 'Tickets', href: '/tickets', badge: 12 },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Aprovações', href: '/approvals', badge: 3 },
    { icon: <Users className="w-5 h-5" />, label: 'Usuários', href: '/users' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Departamentos', href: '/departments' },
    { icon: <FileText className="w-5 h-5" />, label: 'Categorias', href: '/categories' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Relatórios', href: '/reports' },
    { icon: <UserCheck className="w-5 h-5" />, label: 'Perfil', href: '/profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">TicketFlow Pro</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            onClick={() => onNavigate(item.href)}
            className={`w-full justify-start ${!isExpanded && 'px-2'} ${
              isActive(item.href) 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                {item.icon}
                {isExpanded && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
              {isExpanded && item.badge && item.badge > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    isActive(item.href) 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Versão 2.1.0</p>
            <p className="mt-1">© 2024 TicketFlow Pro</p>
          </div>
        </div>
      )}
    </div>
  );
}