import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";
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

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
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
    resolver: zodResolver(insertTicketSchema.extend({
      subject: insertTicketSchema.shape.subject.min(1, "Assunto é obrigatório").max(100, "Assunto deve ter menos de 100 caracteres"),
      description: insertTicketSchema.shape.description.min(10, "Descrição deve ter pelo menos 10 caracteres"),
    })),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "",
      departmentId: "",
      assignedTo: "",
      createdBy: "", // This would typically come from auth context
    },
  });

  // Reset category when department changes
  useEffect(() => {
    if (selectedDepartment) {
      form.setValue("category", "");
    }
  }, [selectedDepartment, form]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      // In a real app, createdBy would come from authenticated user
      const currentUser = users?.[0]; // Usando primeiro usuário como demo
      if (!currentUser) {
        throw new Error("Usuário não encontrado");
      }

      const ticketData = { ...data, createdBy: currentUser.id };
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Categorização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDepartment(value);
                            form.setValue("category", ""); // Reset category when department changes
                          }} 
                          defaultValue={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-primary focus:border-primary">
                              <SelectValue placeholder="Selecionar departamento" />
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || ""}
                          disabled={!selectedDepartment}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-primary focus:border-primary">
                              <SelectValue 
                                placeholder={
                                  !selectedDepartment 
                                    ? "Selecione um departamento primeiro" 
                                    : "Selecionar categoria"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Atribuição automática" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descrição detalhada do problema, passos para reproduzir, comportamento esperado..."
                      className="h-32 resize-none focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Anexos</label>
              <div className="border-2 border-dashed border-gray-20 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-3xl text-gray-30 mb-3" size={48} />
                <p className="text-sm text-gray-50 mb-2">Arraste e solte arquivos aqui ou clique para navegar</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fileUpload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  Escolher Arquivos
                </Button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-10 p-2 rounded">
                      <span className="text-sm text-gray-70">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-error hover:text-error h-auto p-1"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-20">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                disabled={createTicketMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createTicketMutation.isPending}
                className="bg-primary hover:bg-primary-hover text-white"
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
