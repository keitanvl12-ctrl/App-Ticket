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

  // Define columns with dynamic counts
  const columns = [
    { 
      id: 'open', 
      title: 'ABERTO', 
      color: 'bg-red-500', 
      headerColor: 'bg-red-500',
      count: tickets.filter(t => t.status === 'open').length 
    },
    { 
      id: 'in_progress', 
      title: 'EM PROGRESSO', 
      color: 'bg-green-500', 
      headerColor: 'bg-green-500',
      count: tickets.filter(t => t.status === 'in_progress').length 
    },
    { 
      id: 'on_hold', 
      title: 'PAUSADO', 
      color: 'bg-yellow-500', 
      headerColor: 'bg-yellow-500',
      count: tickets.filter(t => t.status === 'on_hold').length 
    },
    { 
      id: 'resolved', 
      title: 'RESOLVIDO', 
      color: 'bg-gray-500', 
      headerColor: 'bg-gray-500',
      count: tickets.filter(t => t.status === 'resolved').length 
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'Resolvido') return 'bg-green-500';
    if (status === 'Atrasado') return 'bg-red-500';
    if (status === 'Pausado') return 'bg-yellow-500';
    return 'bg-blue-500';
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
  const uniqueDepartments = Array.from(new Set(tickets.map(t => t.department?.name).filter(Boolean)));
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
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
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
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Departamento</Label>
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
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Filtros Rápidos</Label>
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtros Especiais" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="alta">Alta Prioridade</SelectItem>
                      <SelectItem value="atrasado">Atrasados</SelectItem>
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
                className="space-y-3 min-h-[600px] p-2 rounded-lg"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {filteredTickets
                  .filter(ticket => ticket.status === column.id)
                  .map((ticket) => (
                    <TicketModal key={ticket.id} ticket={ticket} onUpdate={(updatedTicket) => {
                      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                    }}>
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket)}
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

                          {/* Priority Badge */}
                          <div className="flex items-center justify-between">
                            <Badge className={`${getPriorityColor(ticket.priority)} text-xs px-2 py-1`}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">{ticket.department?.name || 'Sem departamento'}</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(ticket.progress, ticket.status)}`}
                                style={{ width: `${ticket.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progresso</span>
                              <span>{ticket.progress}%</span>
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
                    {ticket.number}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{ticket.title}</p>
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex gap-1">
                          {ticket.tags.slice(0, 2).map((tag, index) => (
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
                      className={`text-xs ${
                        ticket.status === 'Atrasado' ? 'border-red-200 text-red-800 bg-red-50' :
                        ticket.status === 'Atendendo' ? 'border-green-200 text-green-800 bg-green-50' :
                        ticket.status === 'Pausado' ? 'border-yellow-200 text-yellow-800 bg-yellow-50' :
                        'border-gray-200 text-gray-800 bg-gray-50'
                      }`}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {ticket.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ticket.assignee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.requester}</TableCell>
                  <TableCell className="text-sm">{ticket.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(ticket.progress, ticket.status)}`}
                          style={{ width: `${ticket.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{ticket.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TicketModal ticket={ticket} onUpdate={(updatedTicket) => {
                        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                      }}>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TicketModal>
                      {/* Botão Finalizar (apenas para tickets não resolvidos) */}
                      {ticket.status !== 'Resolvido' && (
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
