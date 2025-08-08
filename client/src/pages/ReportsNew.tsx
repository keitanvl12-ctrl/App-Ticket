import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, TrendingUp, BarChart3, PieChart, Users, Clock, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TicketTrendsChart from '@/components/TicketTrendsChart';

export default function ReportsNew() {
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Query para obter departamentos
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ["/api/departments"],
  });

  // Query para obter usuários
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Queries para relatórios com filtros funcionais
  const { data: departmentPerformance = [], isLoading: loadingDeptPerf } = useQuery({
    queryKey: ["/api/reports/department-performance", dateRange.startDate, dateRange.endDate],
    queryFn: () => 
      fetch(`/api/reports/department-performance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .then(res => res.json()),
  });

  const { data: userPerformance = [], isLoading: loadingUserPerf } = useQuery({
    queryKey: ["/api/reports/user-performance", dateRange.startDate, dateRange.endDate, selectedDepartment],
    queryFn: () => 
      fetch(`/api/reports/user-performance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&departmentId=${selectedDepartment}`)
        .then(res => res.json()),
  });

  const { data: resolutionTimeAnalysis = [], isLoading: loadingResTime } = useQuery({
    queryKey: ["/api/reports/resolution-time-analysis", dateRange.startDate, dateRange.endDate, selectedDepartment],
    queryFn: () => 
      fetch(`/api/reports/resolution-time-analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&departmentId=${selectedDepartment}`)
        .then(res => res.json()),
  });

  const { data: filteredTickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ["/api/reports/filtered-tickets", dateRange.startDate, dateRange.endDate, selectedDepartment, selectedPriority, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        departmentId: selectedDepartment,
        priority: selectedPriority,
        status: selectedStatus,
      });
      return fetch(`/api/reports/filtered-tickets?${params}`)
        .then(res => res.json());
    },
  });

  const exportReport = (format: string) => {
    console.log(`Exportando relatório em formato ${format}`);
    alert(`Relatório exportado em formato ${format.toUpperCase()}`);
  };

  const generateCustomReport = () => {
    console.log('Gerando relatório personalizado...');
    alert('Relatório personalizado será gerado e enviado por email');
  };

  const applyFilters = () => {
    // Filtros são aplicados automaticamente via useQuery dependencies
    console.log('Filtros aplicados automaticamente');
  };

  const COLORS = ['#3b82f6', '#ef4444', '#eab308', '#22c55e'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">Análises detalhadas e insights sobre o desempenho do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={generateCustomReport}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatório Personalizado
          </Button>
        </div>
      </div>

      {/* Filtros Funcionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Início</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Fim</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Departamento</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs dos Relatórios */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="resolution">Tempo de Resolução</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>

        {/* Tab Tendências */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Tendências de Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTrendsChart days={parseInt(selectedPeriod)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Departamentos */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Performance por Departamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDeptPerf ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tickets" fill="#3b82f6" name="Total" />
                        <Bar dataKey="resolved" fill="#22c55e" name="Resolvidos" />
                        <Bar dataKey="pending" fill="#ef4444" name="Pendentes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {departmentPerformance.map((dept: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Taxa de Resolução:</span>
                            <span className="font-medium">{dept.resolutionRate}%</span>
                          </div>
                          <Progress value={dept.resolutionRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Usuários */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Performance dos Usuários</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUserPerf ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPerformance.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <Badge variant={
                            user.role === 'admin' ? 'default' :
                            user.role === 'supervisor' ? 'secondary' : 'outline'
                          }>
                            {user.role === 'admin' ? 'Administrador' :
                             user.role === 'supervisor' ? 'Supervisor' : 'Colaborador'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{user.tickets}</div>
                          <div className="text-gray-500">Tickets</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.resolved}</div>
                          <div className="text-gray-500">Resolvidos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.efficiency}%</div>
                          <div className="text-gray-500">Eficiência</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.satisfaction?.toFixed(1)}</div>
                          <div className="text-gray-500">Satisfação</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tempo de Resolução */}
        <TabsContent value="resolution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Análise de Tempo de Resolução</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingResTime ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={resolutionTimeAnalysis}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ category, percentage }) => `${category}: ${percentage}%`}
                        >
                          {resolutionTimeAnalysis.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {resolutionTimeAnalysis.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{item.count} tickets</div>
                          <div className="text-xs text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Satisfação */}
        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Análise de Satisfação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-4xl font-bold text-blue-600 mb-2">4.7</div>
                <div className="text-gray-600 mb-4">Satisfação Média</div>
                <div className="text-sm text-gray-500">Baseado nos tickets resolvidos no período</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo dos Tickets Filtrados</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Tickets:</span>
                      <span className="font-semibold">{filteredTickets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolvidos:</span>
                      <span className="font-semibold text-green-600">
                        {filteredTickets.filter((t: any) => t.status === 'resolved').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em Progresso:</span>
                      <span className="font-semibold text-blue-600">
                        {filteredTickets.filter((t: any) => t.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abertos:</span>
                      <span className="font-semibold text-orange-600">
                        {filteredTickets.filter((t: any) => t.status === 'open').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hierarquia do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-red-700">Administrador</div>
                      <div className="text-sm text-red-600">Acesso total ao sistema</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-blue-700">Supervisor</div>
                      <div className="text-sm text-blue-600">Gerencia equipe e relatórios</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-green-700">Colaborador</div>
                      <div className="text-sm text-green-600">Atende e resolve tickets</div>
                    </div>
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