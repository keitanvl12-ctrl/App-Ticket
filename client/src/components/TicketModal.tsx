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
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar comentário',
        variant: 'destructive',
      });
    },
  });

  const [attachments, setAttachments] = useState([
    { id: 1, name: 'screenshot.png', type: 'image', size: '2.4 MB', uploadedAt: new Date(), uploadedBy: 'João Silva' },
    { id: 2, name: 'log_error.txt', type: 'text', size: '156 KB', uploadedAt: new Date(), uploadedBy: 'Ana Santos' }
  ]);

  // Mutation para salvar ticket
  const saveTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      return apiRequest(`/api/tickets/${ticket.id}`, 'PATCH', ticketData);
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      onUpdate?.(updatedTicket);
      setIsEditing(false);
      toast({
        title: 'Ticket atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro ao salvar as alterações',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveTicketMutation.mutate(editedTicket);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
    setNewTag(''); // Limpar tag input
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  const handleDownloadAttachment = (attachment: any) => {
    // Simular download do anexo
    const link = document.createElement('a');
    link.href = attachment.url || '#';
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Toast de confirmação
    toast({
      title: 'Download iniciado',
      description: `Fazendo download de ${attachment.name}`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Atrasado': return 'border-red-200 text-red-800 bg-red-50';
      case 'Atendendo': return 'border-green-200 text-green-800 bg-green-50';
      case 'Pausado': return 'border-yellow-200 text-yellow-800 bg-yellow-50';
      case 'Resolvido': return 'border-gray-200 text-gray-800 bg-gray-50';
      default: return 'border-gray-200 text-gray-800 bg-gray-50';
    }
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
            <span className="text-xl font-bold">Ticket {ticket.number}</span>
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
                        value={editedTicket.title}
                        onChange={(e) => setEditedTicket({...editedTicket, title: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{editedTicket.title}</p>
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
                        <Select 
                          value={editedTicket.status} 
                          onValueChange={(value) => setEditedTicket({...editedTicket, status: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Atrasado">Atrasado</SelectItem>
                            <SelectItem value="Atendendo">Atendendo</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                            <SelectItem value="Resolvido">Resolvido</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`mt-1 ${getStatusColor(editedTicket.status)}`}>
                          {editedTicket.status}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Prioridade</Label>
                      {isEditing ? (
                        <Select 
                          value={editedTicket.priority} 
                          onValueChange={(value) => setEditedTicket({...editedTicket, priority: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Média">Média</SelectItem>
                            <SelectItem value="Baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`mt-1 ${getPriorityColor(editedTicket.priority)}`}>
                          {editedTicket.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Progresso</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Concluído</span>
                        <span>{editedTicket.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${editedTicket.progress}%` }}
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
                          {editedTicket.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{editedTicket.assignee.name}</p>
                        <p className="text-xs text-gray-500">{editedTicket.department}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Solicitante</Label>
                    <p className="mt-1 text-sm text-gray-700">{editedTicket.requester}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Departamento</Label>
                    <p className="mt-1 text-sm text-gray-700">{editedTicket.department}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Data de Vencimento</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{editedTicket.dueDate}</span>
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
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                                title="Remover tag"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          )) || []}
                        </div>
                        
                        {/* Input para adicionar nova tag */}
                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Adicionar nova tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            className="px-3"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Modo visualização - somente leitura */
                      <div className="mt-1 flex flex-wrap gap-1">
                        {editedTicket.tags?.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || <span className="text-sm text-gray-500">Nenhuma tag</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Adicionar Comentário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Comentário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escreva seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="internal" className="rounded" />
                    <Label htmlFor="internal" className="text-sm">Comentário interno</Label>
                  </div>
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createCommentMutation.isPending ? 'Adicionando...' : 'Adicionar Comentário'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Comentários */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Carregando comentários...</p>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {comment.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{comment.user?.name || 'Usuário'}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Nenhum comentário ainda</p>
                  <p className="text-xs text-gray-400">Seja o primeiro a comentar neste ticket</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            {/* Upload de Anexos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Clique para fazer upload
                      </span>
                      <span className="text-sm text-gray-500"> ou arraste arquivos aqui</span>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF até 10MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Anexos */}
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <Card key={attachment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded">
                          {attachment.type === 'image' ? (
                            <Image className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {attachment.size} • {attachment.uploadedBy} • 
                            {format(attachment.uploadedAt, "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ticket criado</p>
                  <p className="text-xs text-gray-500">Por Cliente Opus • 17/12/2024 10:30</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ticket atribuído para João Silva</p>
                  <p className="text-xs text-gray-500">Por Sistema • 17/12/2024 10:35</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Play className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Status alterado para "Atendendo"</p>
                  <p className="text-xs text-gray-500">Por João Silva • 17/12/2024 11:00</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Paperclip className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Anexo adicionado: screenshot.png</p>
                  <p className="text-xs text-gray-500">Por João Silva • 17/12/2024 14:20</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}