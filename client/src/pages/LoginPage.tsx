import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ticket, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar token/sessão no localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${data.user.name}!`,
        });

        // Redirecionar para dashboard
        window.location.href = '/';
      } else {
        setError(data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType: 'admin' | 'supervisor' | 'colaborador') => {
    const demoUsers = {
      admin: {
        email: 'admin@opus.com.br',
        password: 'admin123',
        name: 'Administrador Sistema',
        role: 'administrador'
      },
      supervisor: {
        email: 'supervisor@opus.com.br', 
        password: 'super123',
        name: 'João Supervisor',
        role: 'supervisor'
      },
      colaborador: {
        email: 'colaborador@opus.com.br',
        password: 'colab123', 
        name: 'Maria Colaboradora',
        role: 'colaborador'
      }
    };

    const user = demoUsers[userType];
    
    // Simular login
    localStorage.setItem('authToken', `demo-${userType}-token`);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    toast({
      title: "Login demo realizado",
      description: `Logado como ${user.name} (${user.role})`,
    });

    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#2c4257] rounded-xl flex items-center justify-center">
              <Ticket className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TicketFlow Pro</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Tickets - Grupo OPUS</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <LogIn size={20} />
              Fazer Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu.email@opus.com.br"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Sua senha"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#2c4257] hover:bg-[#6b8fb0]" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 text-center mb-4">Contas de demonstração:</p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => handleDemoLogin('admin')}
                >
                  <div>
                    <div className="font-medium">👨‍💼 Administrador</div>
                    <div className="text-xs text-gray-500">Acesso completo ao sistema</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => handleDemoLogin('supervisor')}
                >
                  <div>
                    <div className="font-medium">👨‍💻 Supervisor</div>
                    <div className="text-xs text-gray-500">Gerencia departamento e equipe</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => handleDemoLogin('colaborador')}
                >
                  <div>
                    <div className="font-medium">👤 Colaborador</div>
                    <div className="text-xs text-gray-500">Cria e acompanha tickets</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-500">
          © 2025 Grupo OPUS - Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}