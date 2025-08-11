import { ReactNode } from 'react';
import { usePermissions, PermissionKey, UserRole } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  // Verificar permissão específica
  permission?: PermissionKey;
  // Verificar nível de role mínimo
  minRole?: UserRole;
  // Fallback quando não tem permissão
  fallback?: ReactNode;
  // Classe CSS adicional para container
  className?: string;
}

export function PermissionGuard({ 
  children, 
  permission, 
  minRole, 
  fallback = null,
  className = ""
}: PermissionGuardProps) {
  const { hasPermission, hasRoleLevel, isLoading } = usePermissions();
  
  // Mostrar loading se ainda carregando
  if (isLoading) {
    return <div className={className}>{fallback}</div>;
  }
  
  // Verificar permissão específica
  if (permission && !hasPermission(permission)) {
    return <div className={className}>{fallback}</div>;
  }
  
  // Verificar nível de role
  if (minRole && !hasRoleLevel(minRole)) {
    return <div className={className}>{fallback}</div>;
  }
  
  // Render children se tem permissão
  return <div className={className}>{children}</div>;
}

// Componente específico para admins
export function AdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard minRole="administrador" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// Componente para supervisores ou superior
export function SupervisorOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard minRole="supervisor" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}