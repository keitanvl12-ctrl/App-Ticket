import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Icon from './AppIcon';
import Button from './Button';

interface HeaderProps {
  onSidebarToggle: () => void;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, isSidebarCollapsed = false }) => {
  const [location, setLocation] = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const navigate = (path: string) => setLocation(path);

  const primaryNavItems = [
    { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
    { label: 'Criar Ticket', path: '/create', icon: 'Plus' },
    { label: 'SLA Monitor', path: '/sla', icon: 'Clock' },
  ];

  const secondaryNavItems = [
    { label: 'Gerenciar Usuários', path: '/users', icon: 'Users' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-enterprise">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="Ticket" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">TicketFlow Pro</h1>
            </div>
          </div>
        </div>

        {/* Center Section - Primary Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={16}
              className="transition-enterprise"
            >
              {item?.label}
            </Button>
          ))}
        </nav>

        {/* Right Section - More Menu and User Actions */}
        <div className="flex items-center space-x-2">
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              iconName="MoreHorizontal"
              iconSize={16}
              className="transition-enterprise"
            >
              Mais
            </Button>
            
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-enterprise-lg z-50">
                <div className="py-2">
                  {secondaryNavItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-enterprise hover:bg-muted ${
                        isActivePath(item?.path) ? 'bg-muted text-primary' : 'text-foreground'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-border my-2"></div>
                  <button 
                    onClick={() => handleNavigation('/settings')}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-enterprise"
                  >
                    <Icon name="Settings" size={16} />
                    <span>Configurações</span>
                  </button>
                  <button 
                    onClick={() => {
                      window.open('https://docs.ticketflow.com', '_blank');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-enterprise"
                  >
                    <Icon name="HelpCircle" size={16} />
                    <span>Ajuda</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation('/profile')}
            iconName="User"
            iconSize={16}
            className="transition-enterprise"
          >
            Perfil
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative transition-enterprise"
          >
            <Icon name="Bell" size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className="lg:hidden border-t border-border bg-card">
        <nav className="flex overflow-x-auto px-4 py-2 space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={14}
              className="whitespace-nowrap transition-enterprise"
            >
              {item?.label}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Overlay for More Menu */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;