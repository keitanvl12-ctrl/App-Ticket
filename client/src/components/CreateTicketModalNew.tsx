import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Paperclip, Trash2 } from "lucide-react";
import { insertTicketSchema } from "@shared/schema";
import type { InsertTicket, User, Department, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketModalNew({ isOpen, onClose }: CreateTicketModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    enabled: isOpen,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories/department", selectedDepartment],
    enabled: isOpen && !!selectedDepartment,
  });

  const form = useForm<InsertTicket>({
    resolver: zodResolver(insertTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "",
      responsibleDepartmentId: "",
      requesterDepartmentId: "",
      assignedTo: "",
      createdBy: "",
    },
  });

  // Get current user (admin with department)
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      if (!currentUser) {
        throw new Error("Usuário não encontrado");
      }

      const ticketData = { 
        ...data, 
        createdBy: currentUser.id,
        requesterDepartmentId: currentUser.departmentId || null,
      };
      const response = await apiRequest("POST", "/api/tickets", ticketData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Ticket criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      setSelectedFiles([]);
      setSelectedDepartment("");
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar ticket",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTicket) => {
    createTicketMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createTicketMutation.isPending) {
      form.reset();
      setSelectedFiles([]);
      setSelectedDepartment("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Criar Novo Ticket
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={createTicketMutation.isPending}
              className="h-auto p-1"
            >
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Assunto e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descrição breve do problema"
                        className="focus:ring-primary focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Selecionar prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Forneça detalhes sobre o problema..."
                      className="min-h-[120px] focus:ring-primary focus:border-primary"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informações do Solicitante */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Solicitante:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {currentUser?.name} - {currentUser?.departmentId ? 
                    departments?.find(d => d.id === currentUser.departmentId)?.name || 'Departamento não especificado'
                    : 'Departamento não especificado'
                  }
                </span>
              </div>
            </div>

            {/* CATEGORIZAÇÃO */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Categorização
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Classifique o tipo e prioridade do chamado
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo Departamento */}
                <FormField
                  control={form.control}
                  name="responsibleDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDepartment(value);
                          form.setValue("category", ""); // Reset category when department changes
                        }} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo Categoria */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                        disabled={!selectedDepartment}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary focus:border-primary">
                            <SelectValue 
                              placeholder={
                                !selectedDepartment 
                                  ? "Selecione um departamento primeiro" 
                                  : "Selecione a categoria"
                              } 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {selectedDepartment && categories?.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Nenhuma categoria disponível para este departamento
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ATRIBUIÇÃO */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Atribuição
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Defina quem irá atender este chamado
              </p>
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atendente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                      disabled={!selectedDepartment}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue 
                            placeholder={
                              !selectedDepartment 
                                ? "Selecione um departamento primeiro" 
                                : "Selecione o atendente"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.filter(user => 
                          (user.role === 'admin' || user.role === 'supervisor') && 
                          user.departmentId === selectedDepartment
                        ).map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role === 'admin' ? 'Administrador' : 'Supervisor'})
                          </SelectItem>
                        ))}
                        <SelectItem value="">Não atribuído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Apenas administradores e supervisores podem ser atendentes
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createTicketMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}