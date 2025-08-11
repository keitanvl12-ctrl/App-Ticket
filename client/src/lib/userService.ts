import { User } from '@shared/schema';

// Simulação de usuário atual para desenvolvimento - será substituído pela autenticação real
const MOCK_CURRENT_USER: User = {
  id: 'user-admin-1',
  username: 'admin',
  password: '', // Não deve ser exposto
  name: 'Administrador Sistema',
  email: 'admin@opus.com.br',
  role: 'administrador', // Altere aqui para testar diferentes hierarquias
  departmentId: 'dept-ti-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function getCurrentUser(): User {
  return MOCK_CURRENT_USER;
}

export function setUserRole(role: 'colaborador' | 'supervisor' | 'administrador') {
  MOCK_CURRENT_USER.role = role;
}

export function setUserDepartment(departmentId: string) {
  MOCK_CURRENT_USER.departmentId = departmentId;
}