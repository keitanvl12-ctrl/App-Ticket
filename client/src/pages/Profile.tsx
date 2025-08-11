import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Edit, 
  Save, 
  Camera,
  Clock,
  Activity,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '(11) 99999-9999',
    department: 'Tecnologia da Informação',
    role: '',
    joinDate: '15/03/2023',
    extension: '1234'
  });

  // Load current user data
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        setUserData(prev => ({
          ...prev,
          name: user.name || 'Usuário',
          email: user.email || '',
          role: user.role === 'admin' ? 'Administrador' : 
                user.role === 'supervisor' ? 'Supervisor' : 
                'Colaborador'
        }));
      } catch (error) {
        console.error('Error parsing current user:', error);
      }
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Implementar salvamento real
    console.log('Salvando dados do perfil...');
  };

  const stats = {
    ticketsCreated: 124,
    ticketsResolved: 98,
    avgResolutionTime: '2.5h',
    satisfaction: 4.8
  };

  const recentActivity = [
    { id: 1, action: 'Resolveu ticket #TK-2045', time: '2h atrás', type: 'resolved' },
    { id: 2, action: 'Comentou no ticket #TK-2041', time: '4h atrás', type: 'comment' },
    { id: 3, action: 'Criou ticket #TK-2046', time: '1 dia atrás', type: 'created' },
    { id: 4, action: 'Atribuiu ticket #TK-2044', time: '2 dias atrás', type: 'assigned' }
  ];

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{userData.name}</h1>
              <p className="text-muted-foreground">{userData.role} • {userData.department}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Ativo
                </Badge>
                <span className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Desde {userData.joinDate}
                </span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(!isEditing)}
            className="bg-primary hover:bg-primary-hover"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Informações</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Estatísticas</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Atividade</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Conquistas</span>
          </TabsTrigger>
        </TabsList>

        {/* Informações Pessoais */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Dados Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={userData.name.split(' ')[0]}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={userData.name.split(' ').slice(1).join(' ')}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userData.email}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      value={userData.phone}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="extension">Ramal</Label>
                    <Input 
                      id="extension" 
                      value={userData.extension}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Informações Profissionais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Departamento</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {userData.department}
                  </div>
                </div>
                <div>
                  <Label>Cargo</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {userData.role}
                  </div>
                </div>
                <div>
                  <Label>Data de Admissão</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {userData.joinDate}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Permissões</Label>
                  <div className="space-y-2">
                    <Badge variant="secondary">Gerenciar Usuários</Badge>
                    <Badge variant="secondary">Visualizar Relatórios</Badge>
                    <Badge variant="secondary">Configurar Sistema</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Estatísticas */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tickets Criados</p>
                    <p className="text-2xl font-bold">{stats.ticketsCreated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tickets Resolvidos</p>
                    <p className="text-2xl font-bold">{stats.ticketsResolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Satisfação</p>
                    <p className="text-2xl font-bold">{stats.satisfaction}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de performance será exibido aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atividade Recente */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Atividades Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'resolved' ? 'bg-green-500' :
                      activity.type === 'comment' ? 'bg-blue-500' :
                      activity.type === 'created' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className={`p-1 rounded ${
                      activity.type === 'resolved' ? 'bg-green-100 text-green-700' :
                      activity.type === 'comment' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'created' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type === 'resolved' && <CheckCircle className="w-4 h-4" />}
                      {activity.type === 'comment' && <Mail className="w-4 h-4" />}
                      {activity.type === 'created' && <AlertCircle className="w-4 h-4" />}
                      {activity.type === 'assigned' && <Users className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conquistas */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Solucionador Rápido</h3>
                    <p className="text-sm text-muted-foreground">Resolveu 50+ tickets em menos de 1h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Colaborador Ativo</h3>
                    <p className="text-sm text-muted-foreground">Participou de 100+ discussões</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Satisfação Alta</h3>
                    <p className="text-sm text-muted-foreground">Manteve rating 4.5+ por 3 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}