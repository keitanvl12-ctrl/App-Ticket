import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, Edit, Save, X, Paperclip, MessageCircle, Clock, User, 
  FileText, Image, Download, Upload, Calendar, AlertCircle,
  CheckCircle, Pause, Play, MoreHorizontal, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';


interface TicketModalProps {
  ticket: any;
  children: React.ReactNode;
  onUpdate?: (ticket: any) => void;
}

export function TicketModal({ ticket, children, onUpdate }: TicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar comentários do ticket
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ['/api/tickets', ticket.id, 'comments'],
    enabled: isOpen && !!ticket.id,
  });

  // Buscar usuários para saber quem está logado
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });

  // Buscar configurações de status e prioridade
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
    enabled: isOpen,
  });

  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
    enabled: isOpen,
  });

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen,
  });

  // Usuário atual (assumindo que é o primeiro admin para demo)
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  // Mutation para criar comentário
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error('Usuário não encontrado');
      
      return apiRequest(`/api/tickets/${ticket.id}/comments`, 'POST', {
        content,
        userId: currentUser.id,
        ticketId: ticket.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticket.id, 'comments'] });
      setNewComment('');
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi adicionado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar comentário. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para salvar ticket
  const saveTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/tickets/${ticket.id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setIsEditing(false);
      if (onUpdate) onUpdate(editedTicket);
      toast({
        title: 'Ticket atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar alterações. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveTicketMutation.mutate(editedTicket);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  const getStatusColor = (status: string) => {
    const config = statusConfigs?.find(s => s.value === status || s.name === status);
    if (config?.color) {
      // Convert hex to Tailwind classes  
      const colorMap: Record<string, string> = {
        '#3b82f6': 'border-blue-200 text-blue-800 bg-blue-50',
        '#f59e0b': 'border-yellow-200 text-yellow-800 bg-yellow-50',
        '#10b981': 'border-green-200 text-green-800 bg-green-50',
        '#6b7280': 'border-gray-200 text-gray-800 bg-gray-50',
      };
      return colorMap[config.color] || 'border-gray-200 text-gray-800 bg-gray-50';
    }
    return 'border-gray-200 text-gray-800 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    const config = priorityConfigs?.find(p => p.value === priority || p.name === priority);
    if (config?.color) {
      // Convert hex to Tailwind classes  
      const colorMap: Record<string, string> = {
        '#3b82f6': 'border-blue-200 text-blue-800 bg-blue-50',
        '#f59e0b': 'border-yellow-200 text-yellow-800 bg-yellow-50',
        '#10b981': 'border-green-200 text-green-800 bg-green-50',
        '#6b7280': 'border-gray-200 text-gray-800 bg-gray-50',
      };
      return colorMap[config.color] || 'border-gray-200 text-gray-800 bg-gray-50';
    }
    return 'border-gray-200 text-gray-800 bg-gray-50';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Aqui você adicionaria a lógica para upload dos arquivos
      console.log('Uploading files:', files);
    }
  };

  // Função para adicionar nova tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = editedTicket.tags || [];
    
    // Verificar se a tag já existe (não case-sensitive)
    if (currentTags.some((tag: string) => tag.toLowerCase() === newTag.toLowerCase())) {
      toast({
        title: 'Tag já existe',
        description: 'Esta tag já foi adicionada ao ticket.',
        variant: 'destructive',
      });
      return;
    }
    
    // Adicionar nova tag
    setEditedTicket({
      ...editedTicket,
      tags: [...currentTags, newTag.trim()]
    });
    
    setNewTag('');
    
    toast({
      title: 'Tag adicionada',
      description: `A tag "${newTag.trim()}" foi adicionada com sucesso.`,
    });
  };

  // Função para remover tag
  const handleRemoveTag = (indexToRemove: number) => {
    const currentTags = editedTicket.tags || [];
    const tagToRemove = currentTags[indexToRemove];
    
    const updatedTags = currentTags.filter((_: string, index: number) => index !== indexToRemove);
    
    setEditedTicket({
      ...editedTicket,
      tags: updatedTags
    });
    
    toast({
      title: 'Tag removida',
      description: `A tag "${tagToRemove}" foi removida com sucesso.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl font-bold">Chamado {ticket.ticketNumber}</span>
            <Badge variant="outline" className={`${getStatusColor(editedTicket.status)}`}>
              {editedTicket.status}
            </Badge>
            <Badge variant="outline" className={`${getPriorityColor(editedTicket.priority)}`}>
              {editedTicket.priority}
            </Badge>
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={saveTicketMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveTicketMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Principais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Título</Label>
                    {isEditing ? (
                      <Input
                        value={editedTicket.subject}
                        onChange={(e) => setEditedTicket({...editedTicket, subject: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{editedTicket.subject}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedTicket.description || ''}
                        onChange={(e) => setEditedTicket({...editedTicket, description: e.target.value})}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-700">{editedTicket.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      {isEditing ? (
                        <Select value={editedTicket.status} onValueChange={(value) => setEditedTicket({...editedTicket, status: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusConfigs?.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{statusConfigs?.find(s => s.value === editedTicket.status)?.name || editedTicket.status}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Prioridade</Label>
                      {isEditing ? (
                        <Select value={editedTicket.priority} onValueChange={(value) => setEditedTicket({...editedTicket, priority: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityConfigs?.map(priority => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">{priorityConfigs?.find(p => p.value === editedTicket.priority)?.name || editedTicket.priority}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Departamento Solicitante</Label>
                      {isEditing ? (
                        <Select value={editedTicket.requesterDepartmentId || ""} onValueChange={(value) => setEditedTicket({...editedTicket, requesterDepartmentId: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">
                          {departments?.find(d => d.id === editedTicket.requesterDepartmentId)?.name || 'Não informado'}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Departamento Responsável</Label>
                      {isEditing ? (
                        <Select value={editedTicket.responsibleDepartmentId || ""} onValueChange={(value) => setEditedTicket({...editedTicket, responsibleDepartmentId: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione um departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map(dept => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700">
                          {departments?.find(d => d.id === editedTicket.responsibleDepartmentId)?.name || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Progresso</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Concluído</span>
                        <span>{editedTicket.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${editedTicket.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atribuições */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Atribuições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Responsável</Label>
                    <div className="mt-2 flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {editedTicket.assignedToUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{editedTicket.assignedToUser?.name || 'Não atribuído'}</p>
                        <p className="text-xs text-gray-500">{editedTicket.department?.name || 'Sem departamento'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Solicitante</Label>
                    <p className="mt-1 text-sm text-gray-700">{editedTicket.createdByUser?.name || 'Desconhecido'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Data de Criação</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{new Date(editedTicket.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        {/* Tags existentes - editáveis */}
                        <div className="flex flex-wrap gap-1">
                          {editedTicket.tags?.map((tag: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs flex items-center gap-1 pr-1"
                            >
                              {tag}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                onClick={() => handleRemoveTag(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Campo para nova tag */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nova tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="text-xs h-8"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleAddTag}
                            className="h-8 text-xs"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {editedTicket.tags?.length > 0 ? (
                          editedTicket.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">Nenhuma tag adicionada</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comentários ({comments?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de comentários */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <p className="text-center text-gray-500">Carregando comentários...</p>
                  ) : comments?.length === 0 ? (
                    <p className="text-center text-gray-500">Nenhum comentário ainda</p>
                  ) : (
                    comments?.map((comment: any) => (
                      <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {comment.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.user?.name}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Adicionar novo comentário */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || createCommentMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Paperclip className="w-5 h-5" />
                  <span>Anexos (0)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivos
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Histórico</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket criado</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(editedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  {editedTicket.updatedAt && editedTicket.updatedAt !== editedTicket.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ticket atualizado</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(editedTicket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}