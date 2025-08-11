import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';

const router = Router();

// Mock users for demo
const demoUsers = [
  {
    id: 'admin-demo-id',
    name: 'Administrador Sistema',
    email: 'admin@opus.com.br',
    password: '$2a$10$hash_for_admin123', // bcrypt hash for 'admin123'
    role: 'administrador',
    hierarchy: 'administrador',
    department: { id: 'admin-dept', name: 'Administração' }
  },
  {
    id: 'supervisor-demo-id', 
    name: 'João Supervisor',
    email: 'supervisor@opus.com.br',
    password: '$2a$10$hash_for_super123', // bcrypt hash for 'super123'
    role: 'supervisor',
    hierarchy: 'supervisor',
    department: { id: 'ti-dept', name: 'Tecnologia da Informação' }
  },
  {
    id: 'colaborador-demo-id',
    name: 'Maria Colaboradora', 
    email: 'colaborador@opus.com.br',
    password: '$2a$10$hash_for_colab123', // bcrypt hash for 'colab123'
    role: 'colaborador',
    hierarchy: 'colaborador',
    department: { id: 'rh-dept', name: 'Recursos Humanos' }
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Find user in demo users
    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // For demo purposes, check plain text passwords
    const validPasswords = {
      'admin@opus.com.br': 'admin123',
      'supervisor@opus.com.br': 'super123', 
      'colaborador@opus.com.br': 'colab123'
    };

    if (validPasswords[email as keyof typeof validPasswords] !== password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        hierarchy: user.hierarchy 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verify token middleware
export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Get current user
router.get('/user', verifyToken, async (req: any, res) => {
  try {
    const user = demoUsers.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;