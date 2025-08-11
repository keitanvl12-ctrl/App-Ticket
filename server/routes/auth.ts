import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Demo users for authentication
const DEMO_USERS = [
  {
    id: 'admin-001',
    email: 'admin@opus.com.br',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    name: 'Administrador Sistema',
    role: 'administrador',
    hierarchy: 'administrador',
    department: { id: 'dept-1', name: 'Administração' }
  },
  {
    id: 'supervisor-001',
    email: 'supervisor@opus.com.br',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: super123
    name: 'João Supervisor',
    role: 'supervisor',
    hierarchy: 'supervisor',
    department: { id: 'dept-2', name: 'TI' }
  },
  {
    id: 'colaborador-001',
    email: 'colaborador@opus.com.br',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: colab123
    name: 'Maria Colaboradora',
    role: 'colaborador',
    hierarchy: 'colaborador',
    department: { id: 'dept-3', name: 'Suporte' }
  }
];

// Hash passwords (for demo purposes, these are pre-hashed)
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Verify password
const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate JWT token
const generateToken = (user: any): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      hierarchy: user.hierarchy
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    // Find user by email
    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // For demo purposes, we'll accept the hardcoded passwords
    const isValidPassword = 
      (email === 'admin@opus.com.br' && password === 'admin123') ||
      (email === 'supervisor@opus.com.br' && password === 'super123') ||
      (email === 'colaborador@opus.com.br' && password === 'colab123');

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

// Get current user endpoint
router.get('/user', verifyToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuário não encontrado'
      });
    }

    // Find full user data
    const user = DEMO_USERS.find(u => u.id === req.user?.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado no sistema'
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', verifyToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Token inválido'
      });
    }

    // Find user
    const user = DEMO_USERS.find(u => u.id === req.user?.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    // Generate new token
    const token = generateToken(user);
    
    res.json({
      message: 'Token renovado com sucesso',
      token
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

export default router;