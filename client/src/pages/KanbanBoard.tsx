import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

const columns = [
  { 
    id: 'Atrasado', 
    title: 'ATRASADO', 
    color: 'bg-red-500', 
    headerColor: 'bg-red-500',
    count: mockTickets.filter(t => t.status === 'Atrasado').length 
  },
  { 
    id: 'Atendendo', 
    title: 'ATENDENDO', 
    color: 'bg-green-500', 
    headerColor: 'bg-green-500',
    count: mockTickets.filter(t => t.status === 'Atendendo').length 
  },
  { 
    id: 'Pausado', 
    title: 'PAUSADO', 
    color: 'bg-yellow-500', 
    headerColor: 'bg-yellow-500',
    count: mockTickets.filter(t => t.status === 'Pausado').length 
  },
  { 
    id: 'Resolvido', 
    title: 'RESOLVIDO', 
    color: 'bg-gray-500', 
    headerColor: 'bg-gray-500',
    count: mockTickets.filter(t => t.status === 'Resolvido').length 
  }
];

export default function KanbanBoard() {
  const [tickets, setTickets] = useState(mockTickets);
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const handleDragStart = (e, ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== status) {
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === draggedTicket.id 
            ? { ...ticket, status }
            : ticket
        )
      );
      setDraggedTicket(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress, status) => {
    if (status === 'Resolvido') return 'bg-green-500';
    if (status === 'Atrasado') return 'bg-red-500';
    if (status === 'Pausado') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'alta') return matchesSearch && ticket.priority === 'Alta';
    if (filterBy === 'atrasado') return matchesSearch && ticket.status === 'Atrasado';
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listagem de Tickets</h1>
            <p className="text-gray-600">Gerencie tickets em formato Kanban</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtro Avançado
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="alta">Alta Prioridade</SelectItem>
              <SelectItem value="atrasado">Atrasados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Funcionalidade <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            Status <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            Empresa <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            Categoria <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            Módulo <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm">
            Solicitante <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
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
                  <Card 
                    key={ticket.id}
                    className="cursor-move hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">{ticket.number}</span>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                            {ticket.title}
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
                                {ticket.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{ticket.assignee.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {ticket.dueDate}
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className={`${getPriorityColor(ticket.priority)} text-xs px-2 py-1`}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{ticket.department}</span>
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
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
