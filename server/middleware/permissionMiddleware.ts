import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Definir hierarquia de roles
const ROLE_HIERARCHY = {
  colaborador: 0,
  supervisor: 1,
  administrador: 2
} as const;

// Definir permissões por role
const ROLE_PERMISSIONS = {
  colaborador: {
    canManageUsers: false,
    canViewAllTickets: false,
    canViewDepartmentTickets: false,
    canManageTickets: false,
    canViewReports: false,
    canManageSystem: false,
    canManageCategories: false,
    canManageDepartments: false,
  },
  supervisor: {
    canManageUsers: true, // Só do seu departamento
    canViewAllTickets: false,
    canViewDepartmentTickets: true, // Todos do departamento - FUNCIONAL
    canManageTickets: true,
    canViewReports: true,
    canManageSystem: false,
    canManageCategories: true, // Só do departamento
    canManageDepartments: false,
  },
  administrador: {
    canManageUsers: true, // Todos os usuários
    canViewAllTickets: true, // Todos os tickets
    canViewDepartmentTickets: true,
    canManageTickets: true,
    canViewReports: true, // Todos os relatórios
    canManageSystem: true, // Configurações do sistema
    canManageCategories: true,
    canManageDepartments: true,
  }
} as const;

type UserRole = keyof typeof ROLE_HIERARCHY;
type PermissionKey = keyof typeof ROLE_PERMISSIONS.colaborador;

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
    departmentId?: string;
  };
}

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userRole = authReq.user.role;
      
      // Buscar permissões do banco de dados
      const userPermissions = await storage.getPermissionByRole(userRole);
      const hasPermission = userPermissions?.[permission] || false;

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Acesso negado. Permissão insuficiente.',
          required: permission,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de permissão:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
}

export function requireRole(minRole: UserRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const userRole = authReq.user.role;
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({ 
          message: 'Acesso negado. Nível hierárquico insuficiente.',
          required: minRole,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de role:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
}

// Middleware para filtrar tickets baseado na hierarquia
export async function filterTicketsByHierarchy(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userRole = authReq.user.role;
    const userId = authReq.user.id;
    const userDepartmentId = authReq.user.departmentId;

    // Adicionar parâmetros de filtro baseado na hierarquia
    switch (userRole) {
      case 'colaborador':
        // Colaboradores só veem seus próprios tickets
        req.query.createdBy = userId;
        break;
      
      case 'supervisor':
        // Supervisores veem todos do departamento
        if (userDepartmentId) {
          req.query.departmentId = userDepartmentId;
        }
        break;
      
      case 'administrador':
        // Administradores veem tudo (sem filtro adicional)
        break;
      
      default:
        // Fallback para colaborador
        req.query.createdBy = userId;
        break;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de filtro de tickets:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Middleware para autenticação simulada (será substituído pelo sistema real de auth)
export async function mockAuth(req: Request, res: Response, next: NextFunction) {
  // Simulação temporária - usa usuários reais do banco de dados
  try {
    const { storage } = await import('../storage');
    const authReq = req as AuthenticatedRequest;
    
    // Buscar usuário administrador real do banco
    const allUsers = await storage.getAllUsers();
    const adminUser = allUsers.find(user => user.role === 'administrador');
    
    if (adminUser) {
      authReq.user = {
        id: adminUser.id,
        role: adminUser.role as UserRole,
        departmentId: adminUser.departmentId || undefined
      };
    } else {
      // Fallback para primeiro usuário disponível
      const firstUser = allUsers[0];
      if (firstUser) {
        authReq.user = {
          id: firstUser.id,
          role: firstUser.role as UserRole,
          departmentId: firstUser.departmentId || undefined
        };
      } else {
        // Último fallback para usuário mock
        authReq.user = {
          id: 'user-1',
          role: 'administrador',
          departmentId: 'dept-1'
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in mockAuth:', error);
    // Fallback em caso de erro
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: 'user-1',
      role: 'administrador',
      departmentId: 'dept-1'
    };
    next();
  }
}

export { AuthenticatedRequest };