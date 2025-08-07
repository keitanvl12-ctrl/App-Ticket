import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit2, Trash2, Clock, Target, Users } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  response_time: string;
  resolution_time: string;
  status: 'Ativo' | 'Inativo';
  priority: 'Baixa' | 'Média' | 'Alta' | 'Planejado' | 'Não Pausar';
  department: string;
  subcategories?: Category[];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Custos',
      response_time: '60:00',
      resolution_time: '60:00',
      status: 'Ativo',
      priority: 'Média',
      department: 'Custos'
    },
    {
      id: '2',
      name: 'Contão Clara',
      response_time: '60:00',
      resolution_time: '60:00',
      status: 'Ativo',
      priority: 'Média',
      department: 'Custos',
      subcategories: [
        {
          id: '2-1',
          name: 'Solicitar Saldo',
          response_time: '60:00',
          resolution_time: '60:00',
          status: 'Ativo',
          priority: 'Baixa',
          department: 'Custos'
        },
        {
          id: '2-2',
          name: 'Solicitar Cartão',
          response_time: '60:00',
          resolution_time: '60:00',
          status: 'Ativo',
          priority: 'Planejado',
          department: 'Custos'
        }
      ]
    },
    {
      id: '3',
      name: 'Reembolso Protheus',
      response_time: '60:00',
      resolution_time: '60:00',
      status: 'Ativo',
      priority: 'Baixa',
      department: 'Custos',
      subcategories: [
        {
          id: '3-1',
          name: 'Solicitar Aprovação',
          response_time: '60:00',
          resolution_time: '60:00',
          status: 'Ativo',
          priority: 'Baixa',
          department: 'Custos'
        }
      ]
    },
    {
      id: '4',
      name: 'Departamento Pessoal',
      response_time: '02:00',
      resolution_time: '09:00',
      status: 'Ativo',
      priority: 'Não Pausar',
      department: 'Tecnologia'
    },
    {
      id: '5',
      name: 'Outras Solicitações',
      response_time: '05:00',
      resolution_time: '27:00',
      status: 'Ativo',
      priority: 'Não Pausar',
      department: 'Tecnologia',
      subcategories: [
        {
          id: '5-1',
          name: 'Alteração cadastral',
          response_time: '05:00',
          resolution_time: '27:00',
          status: 'Ativo',
          priority: 'Não Pausar',
          department: 'Tecnologia'
        },
        {
          id: '5-2',
          name: 'Relatórios diversos',
          response_time: '02:00',
          resolution_time: '09:00',
          status: 'Ativo',
          priority: 'Não Pausar',
          department: 'Tecnologia'
        }
      ]
    },
    {
      id: '6',
      name: 'Ponto',
      response_time: '05:00',
      resolution_time: '18:00',
      status: 'Ativo',
      priority: 'Não Pausar',
      department: 'Tecnologia'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Planejado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Não Pausar': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasSubcategories && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span className={`font-medium ${level > 0 ? 'text-sm' : ''}`}>
                {category.name}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 text-center">
            <span className="font-mono text-sm">{category.response_time}</span>
          </td>
          <td className="px-4 py-3 text-center">
            <span className="font-mono text-sm">{category.resolution_time}</span>
          </td>
          <td className="px-4 py-3 text-center">
            <Badge className={getStatusColor(category.status)}>
              {category.status}
            </Badge>
          </td>
          <td className="px-4 py-3 text-center">
            <Badge className={getPriorityColor(category.priority)}>
              {category.priority}
            </Badge>
          </td>
          <td className="px-4 py-3 text-center text-sm text-gray-600">
            {category.department}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="w-8 h-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
              >
                <Target className="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>
        {hasSubcategories && isExpanded && 
          category.subcategories!.map(subcat => renderCategoryRow(subcat, level + 1))
        }
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie categorias e subcategorias com SLA definido</p>
        </div>
        <Button 
          onClick={() => setIsCreateMode(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova categoria
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label>Categoria</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="custos">Custos</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Status</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Prioridade</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Categoria</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Resposta</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Solução</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Prioridade</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Mesa</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => renderCategoryRow(category))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Edit Modal */}
      {(selectedCategory || isCreateMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isCreateMode ? 'Nova Categoria' : 'Editar Categoria'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(null);
                  setIsCreateMode(false);
                }}
              >
                ×
              </Button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    defaultValue={selectedCategory?.name || ''}
                    placeholder="Nome da categoria"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Select defaultValue={selectedCategory?.department || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custos">Custos</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="response_time">Tempo de Resposta (hh:mm)</Label>
                  <Input
                    id="response_time"
                    defaultValue={selectedCategory?.response_time || ''}
                    placeholder="60:00"
                  />
                </div>
                <div>
                  <Label htmlFor="resolution_time">Tempo de Solução (hh:mm)</Label>
                  <Input
                    id="resolution_time"
                    defaultValue={selectedCategory?.resolution_time || ''}
                    placeholder="60:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select defaultValue={selectedCategory?.priority || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Planejado">Planejado</SelectItem>
                      <SelectItem value="Não Pausar">Não Pausar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="status"
                    defaultChecked={selectedCategory?.status === 'Ativo'}
                  />
                  <Label htmlFor="status">Categoria Ativa</Label>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCreateMode(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isCreateMode ? 'Criar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}