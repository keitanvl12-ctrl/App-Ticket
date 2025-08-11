import { Router } from 'express';
import { requireRole, requirePermission, AuthenticatedRequest } from '../middleware/permissionMiddleware';

const router = Router();

// Rota para obter permissões do usuário atual
router.get('/api/auth/permissions', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userRole = authReq.user.role;
    
    // Definir permissões baseadas na hierarquia
    const permissions = {
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
        canManageUsers: true,
        canViewAllTickets: false,
        canViewDepartmentTickets: true,
        canManageTickets: true,
        canViewReports: true,
        canManageSystem: false,
        canManageCategories: true,
        canManageDepartments: false,
      },
      administrador: {
        canManageUsers: true,
        canViewAllTickets: true,
        canViewDepartmentTickets: true,
        canManageTickets: true,
        canViewReports: true,
        canManageSystem: true,
        canManageCategories: true,
        canManageDepartments: true,
      }
    };

    res.json({
      role: userRole,
      permissions: permissions[userRole] || permissions.colaborador,
      user: authReq.user
    });

  } catch (error) {
    console.error('Erro ao obter permissões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota protegida apenas para administradores - gerenciar departamentos
router.get('/api/admin/departments', 
  requireRole('administrador'),
  (req, res) => {
    res.json({ message: 'Acesso liberado para administradores - departamentos' });
  }
);

// Rota protegida para supervisores e acima - gerenciar usuários
router.get('/api/supervisor/users',
  requireRole('supervisor'),
  (req, res) => {
    res.json({ message: 'Acesso liberado para supervisores - usuários' });
  }
);

// Rota protegida por permissão específica - relatórios
router.get('/api/reports/advanced',
  requirePermission('canViewReports'),
  (req, res) => {
    res.json({ message: 'Acesso liberado para visualização de relatórios' });
  }
);

export default router;