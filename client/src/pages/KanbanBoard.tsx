import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, MoreHorizontal, Grid3X3, List, Eye, Edit, Trash, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { TicketModal } from '@/components/TicketModal';
import TicketFinalizationModal from '@/components/TicketFinalizationModal';
import { useQuery } from '@tanstack/react-query';

// Enhanced ticket data matching the reference image
const mockTickets = [
  // ATRASADO (Red)
  {
    id: 'SR738',
    number: '#SR738',
    title: 'INSTALAÇÃO DE OFFICE FRISCO (OLDing)',
    description: 'Instalação necessária para departamento',
    status: 'Atrasado',
    priority: 'Alta',
    assignee: {
      name: 'João Silva',
      avatar: '/avatars/joao.jpg',
      initials: 'JS'
    },
    requester: 'Cliente Opus',
    department: 'Tecnologia',
    dueDate: '17/12/2024 16:45',
    tags: ['FRISCO'],
    progress: 30
  },
  {
    id: 'SR740',
    number: '#SR740',
    title: 'ARQUIVO DE PONTO MAXIMO CREDITO 27 a 01/07',
    description: 'Processamento de arquivo de ponto',
    status: 'Atrasado',
    priority: 'Média',
    assignee: {
      name: 'Pedro Costa',
      avatar: '/avatars/pedro.jpg',
      initials: 'PC'
    },
    requester: 'Grupo Opus',
    department: 'RH',
    dueDate: '17/12/2024 14:32',
    tags: ['PONTO'],
    progress: 15
  },
  {
    id: 'SR745',
    number: '#SR745',
    title: 'ARQUIVO PONTO MAXIMO CREDITO 24/07',
    description: 'Processamento mensal de arquivo',
    status: 'Atrasado',
    priority: 'Baixa',
    assignee: {
      name: 'Ana Santos',
      avatar: '/avatars/ana.jpg',
      initials: 'AS'
    },
    requester: 'Grupo Opus',
    department: 'RH',
    dueDate: '17/12/2024 16:33',
    tags: ['ARQUIVO'],
    progress: 10
  },

  // ATENDENDO (Green)
  {
    id: 'SR734',
    number: '#SR734',
    title: 'Testesn Relname dos Files',
    description: 'Desenvolvimento do novo files dos pais',
    status: 'Atendendo',
    priority: 'Alta',
    assignee: {
      name: 'Maria Silva',
      avatar: '/avatars/maria.jpg',
      initials: 'MS'
    },
    requester: 'Grupo Opus',
    department: 'Desenvolvimento',
    dueDate: '17/12/2024 17:32',
    tags: ['DESENVOLVIMENTO'],
    progress: 70
  },
  {
    id: 'SR736',
    number: '#SR736',
    title: 'Grupo Opus',
    description: 'TRANSPORTO PEÇA FARMARIO MECÂNICO VASSOURAS M4',
    status: 'Atendendo',
    priority: 'Média',
    assignee: {
      name: 'Carlos Lima',
      avatar: '/avatars/carlos.jpg',
      initials: 'CL'
    },
    requester: 'Grupo Opus',
    department: 'Manutenção',
    dueDate: '17/12/2024 15:46',
    tags: ['MECÂNICO'],
    progress: 85
  },
  {
    id: 'SR742',
    number: '#SR742',
    title: 'Grupo Opus',
    description: 'ATENDIMENTO TÉRMINO DE CONTRATO WILSON JOSE DE MATOS',
    status: 'Atendendo',
    priority: 'Alta',
    assignee: {
      name: 'Fernanda Costa',
      avatar: '/avatars/fernanda.jpg',
      initials: 'FC'
    },
    requester: 'Grupo Opus',
    department: 'RH',
    dueDate: '17/12/2024 15:24',
    tags: ['CONTRATO'],
    progress: 60
  },

  // PAUSADO (Yellow)
  {
    id: 'SR735',
    number: '#SR735',
    title: 'Grupo Opus',
    description: 'Relatório Reservatórios Chassis dos Serviços',
    status: 'Pausado',
    priority: 'Média',
    assignee: {
      name: 'Roberto Santos',
      avatar: '/avatars/roberto.jpg',
      initials: 'RS'
    },
    requester: 'Grupo Opus',
    department: 'Operações',
    dueDate: '17/12/2024 16:35',
    tags: ['RELATÓRIO'],
    progress: 45
  },
  {
    id: 'SR739',
    number: '#SR739',
    title: 'Grupo Opus',
    description: 'ADMISSÃO - THIAGO RAMOS GRUPO LED',
    status: 'Pausado',
    priority: 'Alta',
    assignee: {
      name: 'Juliana Alves',
      avatar: '/avatars/juliana.jpg',
      initials: 'JA'
    },
    requester: 'Grupo Opus',
    department: 'RH',
    dueDate: '17/12/2024 15:30',
    tags: ['ADMISSÃO'],
    progress: 25
  },
  {
    id: 'SR743',
    number: '#SR743',
    title: 'Grupo Opus',
    description: 'INSTALAÇÃO PRINT DA CHVS',
    status: 'Pausado',
    priority: 'Baixa',
    assignee: {
      name: 'Lucas Ferreira',
      avatar: '/avatars/lucas.jpg',
      initials: 'LF'
    },
    requester: 'Grupo Opus',
    department: 'TI',
    dueDate: '17/12/2024 16:30',
    tags: ['INSTALAÇÃO'],
    progress: 20
  },

  // RESOLVIDO (Gray)
  {
    id: 'SR744',
    number: '#SR744',
    title: 'LANÇAMENTOS WEEGET AVISO DA SILVA',
    description: 'CARTA DE CANALIZAÇÃO WATER AVISO DA SILVA',
    status: 'Resolvido',
    priority: 'Média',
    assignee: {
      name: 'Beatriz Oliveira',
      avatar: '/avatars/beatriz.jpg',
      initials: 'BO'
    },
    requester: 'Grupo Opus',
    department: 'Operações',
    dueDate: '17/12/2024 14:45',
    tags: ['CANALIZAÇÃO'],
    progress: 100
  },
  {
    id: 'SR746',
    number: '#SR746',
    title: 'Grupo Opus',
    description: 'ERP LICENCIAMENTO - NÃO CONSEGUE BAIXAR O VEEAM',
    status: 'Resolvido',
    priority: 'Alta',
    assignee: {
      name: 'Diego Silva',
      avatar: '/avatars/diego.jpg',
      initials: 'DS'
    },
    requester: 'Grupo Opus',
    department: 'TI',
    dueDate: '17/12/2024 13:20',
    tags: ['ERP'],
    progress: 100
  },
  {
    id: 'SR747',
    number: '#SR747',
    title: 'Grupo Opus',
    description: 'Subutando Arquitetos Balanço 042',
    status: 'Resolvido',
    priority: 'Baixa',
    assignee: {
      name: 'Patricia Mendes',
      avatar: '/avatars/patricia.jpg',
      initials: 'PM'
    },
    requester: 'Grupo Opus',
    department: 'Projetos',
    dueDate: '17/12/2024 12:15',
    tags: ['PROJETOS'],
    progress: 100
  }
];

export default function KanbanBoard() {
  const [draggedTicket, setDraggedTicket] = useState<any>(null);
  const [finalizationModal, setFinalizationModal] = useState<{
    isOpen: boolean;
    ticket: any | null;
  }>({ isOpen: false, ticket: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch real tickets from API
  const { data: tickets = [], refetch: refetchTickets } = useQuery<any[]>({
    queryKey: ['/api/tickets'],
  });

  // Fetch current user for role checking
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Buscar configurações de status e prioridade
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
  });

  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
  });

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
  });

  // Buscar regras de SLA
  const { data: slaRules } = useQuery<any[]>({
    queryKey: ['/api/sla/rules'],
  });

  // Buscar categorias 
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Função para converter cor hex para classes Tailwind
  const hexToTailwindBg = (hex: string) => {
    const colorMap: Record<string, string> = {
      '#3b82f6': 'bg-blue-500',    // Azul
      '#f59e0b': 'bg-amber-500',   // Amarelo/Amber  
      '#10b981': 'bg-emerald-500', // Verde
      '#6b7280': 'bg-gray-500',    // Cinza
      '#8b5cf6': 'bg-violet-500',  // Roxo
      '#ef4444': 'bg-red-500',     // Vermelho
      '#dc2626': 'bg-red-600',     // Vermelho mais escuro
      '#f87171': 'bg-red-400',     // Vermelho mais claro
      '#f97316': 'bg-orange-500',  // Laranja
      '#06b6d4': 'bg-cyan-500',    // Ciano
      '#84cc16': 'bg-lime-500',    // Lima
      '#ec4899': 'bg-pink-500',    // Rosa
    };
    return colorMap[hex] || 'bg-gray-500';
  };

  // Define columns with dynamic counts using database configurations
  const columns = statusConfigs?.map(status => ({
    id: status.value,
    title: status.name.toUpperCase(),
    color: hexToTailwindBg(status.color),
    headerColor: hexToTailwindBg(status.color),
    count: tickets.filter(t => t.status === status.value).length
  })) || [
    { id: 'open', title: 'A FAZER', color: 'bg-blue-500', headerColor: 'bg-blue-500', count: 0 },
    { id: 'in_progress', title: 'ATENDENDO', color: 'bg-green-500', headerColor: 'bg-green-500', count: 0 },
    { id: 'on_hold', title: 'PAUSADO', color: 'bg-yellow-500', headerColor: 'bg-yellow-500', count: 0 },
    { id: 'resolved', title: 'RESOLVIDO', color: 'bg-gray-500', headerColor: 'bg-gray-500', count: 0 }
  ];

  // Check for URL parameters on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    
    if (filter) {
      switch (filter) {
        case 'open':
          setStatusFilter('Aberto');
          setShowAdvancedFilters(true);
          break;
        case 'resolved':
          setStatusFilter('Resolvido');
          setShowAdvancedFilters(true);
          break;
        case 'critical':
          setPriorityFilter('Alta');
          setShowAdvancedFilters(true);
          break;
        case 'all':
        default:
          // Keep all filters as 'all'
          break;
      }
    }
  }, []);

  const handleDragStart = (e: any, ticket: any) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
    // Adicionar efeito visual ao elemento arrastado
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'rotate(5deg)';
  };

  const handleDragEnd = (e: any) => {
    // Remover efeitos visuais
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
    setDraggedTicket(null);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: any, status: string) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== status) {
      // Se estiver movendo para "Resolvido", mostrar modal de finalização
      if (status === 'resolved') {
        setFinalizationModal({ isOpen: true, ticket: draggedTicket });
        setDraggedTicket(null);
        return;
      }
      
      // Para outros status, fazer update direto via API
      fetch(`/api/tickets/${draggedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }).then(() => {
        refetchTickets();
      }).catch(error => {
        console.error('Erro ao atualizar status:', error);
      });
      setDraggedTicket(null);
    }
  };

  // Função para converter cor hex para classes de badge
  const hexToBadgeClasses = (hex: string) => {
    const colorMap: Record<string, string> = {
      '#3b82f6': 'bg-blue-100 text-blue-800 border-blue-200',
      '#f59e0b': 'bg-amber-100 text-amber-800 border-amber-200',
      '#10b981': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      '#6b7280': 'bg-gray-100 text-gray-800 border-gray-200',
      '#8b5cf6': 'bg-violet-100 text-violet-800 border-violet-200',
      '#ef4444': 'bg-red-100 text-red-800 border-red-200',
      '#dc2626': 'bg-red-100 text-red-800 border-red-200',
      '#f87171': 'bg-red-100 text-red-800 border-red-200',
      '#f97316': 'bg-orange-100 text-orange-800 border-orange-200',
      '#06b6d4': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      '#84cc16': 'bg-lime-100 text-lime-800 border-lime-200',
      '#ec4899': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colorMap[hex] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority || p.name === priority);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status || s.name === status);
    if (config?.color) {
      return hexToBadgeClasses(config.color);
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProgressColor = (ticket: any) => {
    if (ticket.status === 'resolved') return 'bg-green-500';
    if (ticket.slaStatus === 'violated') return 'bg-red-500';
    if (ticket.slaStatus === 'at_risk') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  // Função para calcular progresso baseado no SLA usando dados do backend
  const calculateSLAProgress = (ticket: any) => {
    if (!ticket.slaHoursTotal || ticket.slaHoursTotal <= 0) return 0;
    if (ticket.status === 'resolved') return 100;
    
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const progressPercentage = Math.min((hoursElapsed / ticket.slaHoursTotal) * 100, 100);
    return Math.max(progressPercentage, 0);
  };

  // Função para traduzir status do banco para português
  const getStatusLabel = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status);
    return config?.name || status;
  };

  // Função para traduzir prioridade do banco para português
  const getPriorityLabel = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority);
    return config?.name || priority;
  };

  // Funções SLA conectadas ao banco de dados com nova hierarquia
  const getSLAStatusColor = (ticket: any) => {
    if (!ticket.slaStatus) return 'bg-gray-500';
    
    switch (ticket.slaStatus) {
      case 'violated': return 'bg-red-500';
      case 'at_risk': return 'bg-orange-500'; 
      case 'met': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSLATimeRemaining = (ticket: any) => {
    if (!ticket.slaHoursRemaining && ticket.slaHoursRemaining !== 0) return '-';
    
    if (ticket.slaHoursRemaining <= 0) return 'Vencido';
    if (ticket.slaHoursRemaining < 1) return `${Math.ceil(ticket.slaHoursRemaining * 60)}min`;
    if (ticket.slaHoursRemaining < 24) return `${Math.ceil(ticket.slaHoursRemaining)}h`;
    return `${Math.ceil(ticket.slaHoursRemaining / 24)}d`;
  };

  const getSLAStatus = (ticket: any) => {
    if (!ticket.slaStatus) return 'N/A';
    
    switch (ticket.slaStatus) {
      case 'violated': return 'Vencido';
      case 'at_risk': return 'Em Risco';
      case 'met': return 'No Prazo';
      default: return 'N/A';
    }
  };

  // Função para exibir fonte do SLA (debug/informativo)
  const getSLASource = (ticket: any) => {
    return ticket.slaSource || 'padrão (4h)';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = (ticket.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.ticketNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.assignedToUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.createdByUser?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || ticket.department?.name === departmentFilter;
    const matchesAssignee = assigneeFilter === 'all' || ticket.assignedToUser?.name === assigneeFilter;
    
    // Legacy filter compatibility
    const matchesLegacyFilter = filterBy === 'all' || 
      (filterBy === 'alta' && ticket.priority === 'Alta') ||
      (filterBy === 'atrasado' && ticket.status === 'Atrasado');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesAssignee && matchesLegacyFilter;
  });

  // Get unique values for filter options
  const uniqueStatuses = Array.from(new Set(tickets.map(t => t.status).filter(Boolean)));
  const uniquePriorities = Array.from(new Set(tickets.map(t => t.priority).filter(Boolean)));
  const uniqueDepartments = departments ? departments.map(dept => dept.name) : [];
  const uniqueAssignees = Array.from(new Set(tickets.map(t => t.assignedToUser?.name).filter(Boolean)));

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setAssigneeFilter('all');
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      console.warn('Apenas administradores podem excluir tickets');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Refetch dos tickets para atualizar lista
          refetchTickets();
          console.log('Ticket excluído com sucesso');
        } else {
          console.error('Erro ao excluir ticket');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
      }
    }
  };

  const handleFinalizeTicket = (ticket: any) => {
    setFinalizationModal({ isOpen: true, ticket });
  };

  const handleFinalizationConfirm = async (finalizationData: any) => {
    if (!finalizationModal.ticket) return;

    try {
      // Fazer chamada à API para finalizar o ticket
      const response = await fetch(`/api/tickets/${finalizationModal.ticket.id}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Resolvido',
          finalizationData: finalizationData,
          progress: 100
        }),
      });

      if (response.ok) {
        // Refetch dos tickets para atualizar com dados reais do banco
        refetchTickets();
        
        console.log('Ticket finalizado com sucesso');
      } else {
        console.error('Erro ao finalizar ticket no servidor');
      }

      setFinalizationModal({ isOpen: false, ticket: null });
    } catch (error) {
      console.error('Erro ao finalizar ticket:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listagem de Tickets</h1>
            <p className="text-gray-600">
              {viewMode === 'kanban' ? 'Gerencie tickets em formato Kanban' : 'Visualize tickets em formato de lista'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtro Avançado
            </Button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar por ticket, título, responsável, solicitante..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {uniquePriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{getPriorityLabel(priority)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>

            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all' || assigneeFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Dept. Responsável</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Departamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Departamentos</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Responsável</Label>
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Responsáveis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Responsáveis</SelectItem>
                      {uniqueAssignees.map(assignee => (
                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Dept. Solicitante</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Solicitantes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Solicitantes</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                    <strong>{filteredTickets.length}</strong> de <strong>{tickets.length}</strong> tickets
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Based on View Mode */}
      {viewMode === 'kanban' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <div className={`${column.headerColor} text-white p-4 rounded-lg flex items-center justify-between shadow-md`}>
                <span className="font-bold text-sm tracking-wide">{column.title}</span>
                <div className="bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {filteredTickets.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>
              
              {/* Drop Zone */}
              <div 
                className={`space-y-3 min-h-[600px] p-2 rounded-lg border-2 border-dashed transition-all duration-300 ${
                  draggedTicket ? 'border-blue-300 bg-blue-50/50' : 'border-transparent'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-100/30', 'border-blue-400');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-100/30', 'border-blue-400');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-100/30', 'border-blue-400');
                  handleDrop(e, column.id);
                }}
              >
                {filteredTickets
                  .filter(ticket => ticket.status === column.id)
                  .map((ticket) => (
                    <TicketModal key={ticket.id} ticket={ticket} onUpdate={(updatedTicket: any) => {
                      // Atualizar lista será feita pela revalidação de query
                    }}>
                      <Card 
                        className="cursor-move hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white transform hover:scale-105 active:scale-95"
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket)}
                        onDragEnd={handleDragEnd}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          willChange: 'transform, box-shadow, opacity'
                        }}
                      >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600">{ticket.ticketNumber}</span>
                            <div className="flex items-center space-x-1">
                              {/* Botão Finalizar (apenas para tickets não resolvidos) */}
                              {ticket.status !== 'resolved' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-6 h-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleFinalizeTicket(ticket);
                                  }}
                                  title="Finalizar Ticket"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                              {ticket.subject}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {ticket.description}
                            </p>
                          </div>

                          {/* Assignee and Date */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                  {ticket.assignedToUser?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600">{ticket.assignedToUser?.name || 'Não atribuído'}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {/* Priority Badge and SLA */}
                          <div className="flex items-center justify-between">
                            <Badge className={`${getPriorityColor(ticket.priority)} text-xs px-2 py-1`}>
                              {getPriorityLabel(ticket.priority)}
                            </Badge>
                            <span className="text-xs text-gray-500">{ticket.department?.name || 'Sem departamento'}</span>
                          </div>

                          {/* SLA Status */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getSLAStatusColor(ticket)}`}></div>
                              <span className="text-xs text-gray-600">SLA: {getSLATimeRemaining(ticket)}</span>
                            </div>
                            <span className="text-xs text-gray-400">{getSLAStatus(ticket)}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(ticket)}`}
                                style={{ width: `${calculateSLAProgress(ticket)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progresso SLA</span>
                              <span>{Math.round(calculateSLAProgress(ticket))}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </TicketModal>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ticket</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">
                    {ticket.ticketNumber}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{ticket.subject}</p>
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex gap-1">
                          {ticket.tags.slice(0, 2).map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {ticket.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{ticket.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(ticket.status)}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(ticket.priority)}`}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {ticket.assignedToUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ticket.assignedToUser?.name || 'Não atribuído'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.createdByUser?.name || 'Desconhecido'}</TableCell>
                  <TableCell className="text-sm">{ticket.department?.name || 'Sem departamento'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(ticket)}`}
                          style={{ width: `${calculateSLAProgress(ticket)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{Math.round(calculateSLAProgress(ticket))}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TicketModal ticket={ticket} onUpdate={(updatedTicket: any) => {
                        // Atualizar lista será feita pela revalidação de query
                      }}>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TicketModal>
                      {/* Botão Finalizar (apenas para tickets não resolvidos) */}
                      {ticket.status !== 'resolved' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-green-600 hover:text-green-700"
                          onClick={() => handleFinalizeTicket(ticket)}
                          title="Finalizar Ticket"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </Button>
                      )}
                      {/* Botão de excluir apenas para administradores */}
                      {currentUser?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Finalização */}
      {finalizationModal.isOpen && finalizationModal.ticket && (
        <TicketFinalizationModal
          isOpen={finalizationModal.isOpen}
          ticket={finalizationModal.ticket}
          onClose={() => setFinalizationModal({ isOpen: false, ticket: null })}
          onConfirm={handleFinalizationConfirm}
        />
      )}
    </div>
  );
}
