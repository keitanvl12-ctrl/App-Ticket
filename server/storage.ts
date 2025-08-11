import { db } from "./db";
import { users, tickets, comments, attachments, departments, categories, slaRules, statusConfig, priorityConfig, customFields, permissions } from "@shared/schema";
import { eq, desc, count, sql, and, gte, lte, or } from "drizzle-orm";
import {
  type User,
  type InsertUser,
  type Ticket,
  type InsertTicket,
  type TicketWithDetails,
  type Comment,
  type InsertComment,
  type Attachment,
  type InsertAttachment,
  type Category,
  type InsertCategory,
  type SlaRule,
  type InsertSlaRule,
  type Department,
  type InsertDepartment,
  type StatusConfig,
  type PriorityConfig,
  type InsertStatusConfig,
  type InsertPriorityConfig,
  type DashboardStats,
  type PriorityStats,
  type TrendData,
  type CustomField,
  type InsertCustomField,
  type Permission,
  type InsertPermission,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { format, subDays, startOfDay, endOfDay, differenceInHours } from "date-fns";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Tickets
  getTicket(id: string): Promise<TicketWithDetails | undefined>;
  getTicketsByUser(userId: string): Promise<TicketWithDetails[]>;
  getAllTickets(): Promise<TicketWithDetails[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;

  // Comments
  getCommentsByTicket(ticketId: string): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Attachments
  getAttachmentsByTicket(ticketId: string): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoriesByDepartment(departmentId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Departments
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, updates: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: string): Promise<boolean>;

  // Configuration
  getAllStatusConfigs(): Promise<StatusConfig[]>;
  getAllPriorityConfigs(): Promise<PriorityConfig[]>;
  createStatusConfig(config: InsertStatusConfig): Promise<StatusConfig>;
  createPriorityConfig(config: InsertPriorityConfig): Promise<PriorityConfig>;

  // Analytics
  getDashboardStats(filters?: any): Promise<DashboardStats>;
  getPriorityStats(filters?: any): Promise<PriorityStats>;
  getTrendData(days: number, filters?: any): Promise<TrendData[]>;

  // Advanced Reports
  getFilteredTickets(filters: any): Promise<TicketWithDetails[]>;
  getDepartmentPerformance(startDate: string, endDate: string): Promise<any[]>;
  getUserPerformance(startDate: string, endDate: string, departmentId?: string): Promise<any[]>;
  getResolutionTimeAnalysis(startDate: string, endDate: string, departmentId?: string): Promise<any[]>;
  
  // Migration
  migrateTicketNumbers(): Promise<void>;

  // Custom Fields
  getCustomFields(): Promise<CustomField[]>;
  getCustomFieldsByCategory(categoryId: string): Promise<CustomField[]>;
  getCustomFieldsByCategoryAndDepartment(categoryId: string, departmentId: string): Promise<CustomField[]>;
  createCustomField(field: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: string, updates: Partial<CustomField>): Promise<CustomField | undefined>;
  deleteCustomField(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with some demo data for development
    this.initializeDemoData();
    this.initializeConfigurationData();
  }

  private async initializeDemoData() {
    try {
      // Check if data already exists
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) return;

      // Create demo users
      const [adminUser] = await db.insert(users).values({
        username: "admin",
        password: "admin123",
        name: "Administrador",
        email: "admin@empresa.com",
        role: "admin",
      }).returning();

      const [supervisor] = await db.insert(users).values({
        username: "maria.santos",
        password: "senha123",
        name: "Maria Santos",
        email: "maria.santos@empresa.com",
        role: "supervisor",
      }).returning();

      const [colaborador1] = await db.insert(users).values({
        username: "carlos.oliveira",
        password: "senha123",
        name: "Carlos Oliveira",
        email: "carlos.oliveira@empresa.com",
        role: "colaborador",
      }).returning();

      const [colaborador2] = await db.insert(users).values({
        username: "ana.costa",
        password: "senha123",
        name: "Ana Costa",
        email: "ana.costa@empresa.com",
        role: "colaborador",
      }).returning();

      // Create demo departments
      const [tiDept] = await db.insert(departments).values({
        name: "TI",
        description: "Departamento de Tecnologia da Informação",
      }).returning();

      const [rhDept] = await db.insert(departments).values({
        name: "RH",
        description: "Recursos Humanos",
      }).returning();

      const [finDept] = await db.insert(departments).values({
        name: "Financeiro",
        description: "Departamento Financeiro",
      }).returning();

      // Create demo categories linked to departments
      await db.insert(categories).values([
        {
          name: "Bug de Sistema",
          description: "Problemas técnicos no sistema",
          departmentId: tiDept.id,
          slaHours: 4,
        },
        {
          name: "Nova Funcionalidade",
          description: "Solicitação de nova funcionalidade",
          departmentId: tiDept.id,
          slaHours: 48,
        },
        {
          name: "Suporte Técnico",
          description: "Suporte técnico geral",
          departmentId: tiDept.id,
          slaHours: 8,
        },
        {
          name: "Folha de Pagamento",
          description: "Questões relacionadas à folha de pagamento",
          departmentId: rhDept.id,
          slaHours: 24,
        },
        {
          name: "Benefícios",
          description: "Questões sobre benefícios dos funcionários",
          departmentId: rhDept.id,
          slaHours: 12,
        },
        {
          name: "Contabilidade",
          description: "Questões contábeis e fiscais",
          departmentId: finDept.id,
          slaHours: 24,
        },
        {
          name: "Contas a Pagar",
          description: "Processamento de pagamentos",
          departmentId: finDept.id,
          slaHours: 12,
        },
      ]);

      // Create demo tickets with distributed dates for trending data
      const now = new Date();
      const demoTickets = [
        {
          ticketNumber: `TICK-${nanoid(6)}`,
          subject: "Sistema de backup está falhando",
          description: "Backup automático não está funcionando corretamente desde a última atualização",
          status: "resolved",
          priority: "high",
          category: "bug",
          departmentId: null,
          createdBy: adminUser.id,
          assignedTo: supervisor.id,
          createdAt: subDays(now, 6),
          updatedAt: subDays(now, 6),
          resolvedAt: subDays(now, 5),
        },
        {
          ticketNumber: `TICK-${nanoid(6)}`,
          subject: "Erro na integração com API externa",
          description: "A integração com o sistema de pagamentos está retornando erro 500",
          status: "resolved",
          priority: "critical",
          category: "bug",
          departmentId: null,
          createdBy: colaborador1.id,
          assignedTo: supervisor.id,
          createdAt: subDays(now, 6),
          updatedAt: subDays(now, 6),
          resolvedAt: subDays(now, 4),
        },
        {
          ticketNumber: `TICK-${nanoid(6)}`,
          subject: "Solicitação de nova funcionalidade no dashboard",
          description: "Adicionar filtros avançados no dashboard principal",
          status: "open",
          priority: "medium",
          category: "feature",
          departmentId: null,
          createdBy: colaborador2.id,
          assignedTo: supervisor.id,
          createdAt: subDays(now, 3),
          updatedAt: subDays(now, 3),
        },
        {
          ticketNumber: `TICK-${nanoid(6)}`,
          subject: "Problema de performance na página de relatórios",
          description: "Relatórios estão carregando muito lentamente",
          status: "in_progress",
          priority: "high",
          category: "bug",
          departmentId: null,
          createdBy: supervisor.id,
          assignedTo: adminUser.id,
          createdAt: subDays(now, 2),
          updatedAt: subDays(now, 1),
        },
        {
          ticketNumber: `TICK-${nanoid(6)}`,
          subject: "Atualização de segurança necessária",
          description: "Aplicar patches de segurança no servidor de aplicação",
          status: "open",
          priority: "critical",
          category: "bug",
          departmentId: null,
          createdBy: adminUser.id,
          assignedTo: colaborador1.id,
          createdAt: subDays(now, 1),
          updatedAt: subDays(now, 1),
        },
      ];

      await db.insert(tickets).values(demoTickets);

      // Adicionar tickets mais recentes para o gráfico de tendências
      const recentTickets = [];
      for (let i = 0; i < 7; i++) {
        const ticketDate = subDays(now, i);
        
        // Criar 2-4 tickets por dia nos últimos 7 dias
        const ticketsPerDay = Math.floor(Math.random() * 3) + 2;
        
        for (let j = 0; j < ticketsPerDay; j++) {
          recentTickets.push({
            ticketNumber: `TICK-${nanoid(6)}`,
            subject: `Ticket ${i}-${j} - Problema exemplo`,
            description: `Descrição do ticket criado em ${format(ticketDate, "dd/MM/yyyy")}`,
            status: Math.random() > 0.6 ? "resolved" : "open",
            priority: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
            category: ["bug", "feature", "support"][Math.floor(Math.random() * 3)],
            departmentId: null,
            createdBy: [adminUser.id, supervisor.id, colaborador1.id, colaborador2.id][Math.floor(Math.random() * 4)],
            assignedTo: [adminUser.id, supervisor.id][Math.floor(Math.random() * 2)],
            createdAt: ticketDate,
            updatedAt: ticketDate,
            resolvedAt: Math.random() > 0.6 ? subDays(ticketDate, -Math.floor(Math.random() * 2)) : null,
          });
        }
      }
      
      await db.insert(tickets).values(recentTickets);
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }

  private async initializeConfigurationData() {
    try {
      // Check if status configs already exist
      const existingStatusConfigs = await db.select().from(statusConfig).limit(1);
      if (existingStatusConfigs.length === 0) {
        // Create default status configurations
        await db.insert(statusConfig).values([
          {
            name: "A Fazer",
            value: "open",
            color: "#3b82f6",
            order: 1,
            isActive: true,
            isDefault: true,
          },
          {
            name: "Atendendo",
            value: "in_progress",
            color: "#10b981",
            order: 2,
            isActive: true,
            isDefault: false,
          },
          {
            name: "Pausado",
            value: "on_hold",
            color: "#f59e0b",
            order: 3,
            isActive: true,
            isDefault: false,
          },
          {
            name: "Resolvido",
            value: "resolved",
            color: "#6b7280",
            order: 4,
            isActive: true,
            isDefault: false,
          },
        ]);
      }

      // Check if priority configs already exist
      const existingPriorityConfigs = await db.select().from(priorityConfig).limit(1);
      if (existingPriorityConfigs.length === 0) {
        // Create default priority configurations
        await db.insert(priorityConfig).values([
          {
            name: "Crítica",
            value: "critical",
            color: "#dc2626",
            slaHours: 4,
            order: 1,
            isActive: true,
            isDefault: false,
          },
          {
            name: "Alta",
            value: "high",
            color: "#f59e0b",
            slaHours: 24,
            order: 2,
            isActive: true,
            isDefault: false,
          },
          {
            name: "Média",
            value: "medium",
            color: "#3b82f6",
            slaHours: 72,
            order: 3,
            isActive: true,
            isDefault: true,
          },
          {
            name: "Baixa",
            value: "low",
            color: "#10b981",
            slaHours: 168,
            order: 4,
            isActive: true,
            isDefault: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error initializing configuration data:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  // Permissions methods
  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getPermissionByRole(role: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.role, role));
    return permission || undefined;
  }

  async createPermission(permissionData: InsertPermission): Promise<Permission> {
    const [permission] = await db
      .insert(permissions)
      .values(permissionData)
      .returning();
    return permission;
  }

  async updatePermission(role: string, permissionData: Partial<InsertPermission>): Promise<Permission | undefined> {
    const [permission] = await db
      .update(permissions)
      .set({ ...permissionData, updatedAt: new Date() })
      .where(eq(permissions.role, role))
      .returning();
    return permission || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Clean up empty values that would cause foreign key errors
    const cleanUpdates = { ...updates };
    if (cleanUpdates.departmentId === '') {
      cleanUpdates.departmentId = null;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...cleanUpdates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  // Get user performance metrics
  async getUserPerformance(userId: string): Promise<any> {
    try {
      // Get ALL tickets where user is involved (created by OR assigned to)
      const userTickets = await db
        .select()
        .from(tickets)
        .where(or(
          eq(tickets.createdBy, userId),
          eq(tickets.assignedTo, userId)
        ));

      // Get tickets specifically assigned to user
      const assignedTickets = userTickets.filter(t => t.assignedTo === userId);
      
      // Get tickets created by user
      const createdTickets = userTickets.filter(t => t.createdBy === userId);

      const resolvedTickets = assignedTickets.filter(t => t.status === 'resolvido');
      const openTickets = assignedTickets.filter(t => t.status !== 'resolvido' && t.status !== 'fechado');

      const resolutionRate = assignedTickets.length > 0 
        ? Math.round((resolvedTickets.length / assignedTickets.length) * 100) 
        : 0;

      // Calculate performance trends
      const thisMonth = new Date();
      const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
      const twoMonthsAgo = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 2);

      const currentMonthTickets = assignedTickets.filter(t => 
        new Date(t.createdAt!) >= new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
      ).length;

      const lastMonthTickets = assignedTickets.filter(t => {
        const createdDate = new Date(t.createdAt!);
        return createdDate >= new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1) &&
               createdDate < new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      }).length;

      const twoMonthsAgoTickets = assignedTickets.filter(t => {
        const createdDate = new Date(t.createdAt!);
        return createdDate >= new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1) &&
               createdDate < new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      }).length;

      // Priority distribution (based on all user tickets)
      const priorityCounts = userTickets.reduce((acc, ticket) => {
        const priority = ticket.priority || 'baixa';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Status distribution (based on all user tickets)
      const statusCounts = userTickets.reduce((acc, ticket) => {
        const status = ticket.status || 'aberto';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average resolution time
      const resolvedTicketsWithTime = resolvedTickets.filter(t => t.resolvedAt);
      let avgResolutionDays = 0;
      if (resolvedTicketsWithTime.length > 0) {
        const totalDays = resolvedTicketsWithTime.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt!);
          const resolved = new Date(ticket.resolvedAt!);
          const days = Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        avgResolutionDays = Math.round(totalDays / resolvedTicketsWithTime.length * 10) / 10;
      }

      return {
        assignedTickets: assignedTickets.length,
        createdTickets: createdTickets.length,
        totalTickets: userTickets.length,
        resolvedTickets: resolvedTickets.length,
        openTickets: openTickets.length,
        resolutionRate,
        averageResolutionTime: avgResolutionDays > 0 ? `${avgResolutionDays} dias` : 'N/A',
        satisfactionRating: 4.2,
        monthlyTrend: [
          { month: 'Há 2 meses', tickets: twoMonthsAgoTickets },
          { month: 'Mês passado', tickets: lastMonthTickets },
          { month: 'Este mês', tickets: currentMonthTickets }
        ],
        priorityDistribution: [
          { name: 'Crítica', value: priorityCounts['critica'] || 0, color: '#ef4444' },
          { name: 'Alta', value: priorityCounts['alta'] || 0, color: '#f97316' },
          { name: 'Média', value: priorityCounts['media'] || 0, color: '#eab308' },
          { name: 'Baixa', value: priorityCounts['baixa'] || 0, color: '#22c55e' }
        ],
        statusDistribution: [
          { name: 'Aberto', value: statusCounts['aberto'] || 0, color: '#3b82f6' },
          { name: 'Em andamento', value: statusCounts['em-andamento'] || 0, color: '#f59e0b' },
          { name: 'Aguardando', value: statusCounts['aguardando'] || 0, color: '#8b5cf6' },
          { name: 'Resolvido', value: statusCounts['resolvido'] || 0, color: '#10b981' },
          { name: 'Fechado', value: statusCounts['fechado'] || 0, color: '#6b7280' }
        ]
      };
    } catch (error) {
      console.error('Error getting user performance:', error);
      // Return default data if error
      return {
        assignedTickets: 0,
        resolvedTickets: 0,
        openTickets: 0,
        resolutionRate: 0,
        averageResolutionTime: '0 dias',
        satisfactionRating: 0,
        monthlyTrend: [],
        priorityDistribution: [],
        statusDistribution: []
      };
    }
  }

  // Get user activity logs
  async getUserActivities(userId: string): Promise<any[]> {
    // For now return mock data - in real implementation, you'd have an activity log table
    return [
      {
        action: 'Login no sistema',
        description: 'Usuário fez login no sistema',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        action: 'Ticket atualizado',
        description: 'Atualizou o status do ticket TICK-123 para "Em andamento"',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        action: 'Comentário adicionado',
        description: 'Adicionou comentário ao ticket TICK-456',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Get roles with user counts
  async getRoles(): Promise<any[]> {
    const roles = [
      {
        id: 'administrador',
        name: 'Administrador', 
        description: 'Acesso completo ao sistema com todas as permissões',
        color: 'bg-purple-100 text-purple-800',
        permissions: 16,
        isSystem: true
      },
      {
        id: 'supervisor',
        name: 'Supervisor',
        description: 'Gerencia equipes e tem acesso a relatórios departamentais', 
        color: 'bg-blue-100 text-blue-800',
        permissions: 9,
        isSystem: true
      },
      {
        id: 'colaborador',
        name: 'Colaborador',
        description: 'Acesso básico para criação e atendimento de tickets',
        color: 'bg-green-100 text-green-800', 
        permissions: 3,
        isSystem: true
      }
    ];

    // Count users for each role
    const userCounts = await Promise.all(
      roles.map(async (role) => {
        const [result] = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.role, role.id === 'administrador' ? 'admin' : role.id));
        
        return {
          ...role,
          userCount: result?.count || 0
        };
      })
    );

    return userCounts;
  }

  // Get role permissions
  async getRolePermissions(role: string): Promise<any> {
    const rolePermissions = {
      'admin': {
        'Usuários': {
          'Visualizar Usuários': true,
          'Gerenciar Usuários': true,
          'Segurança de Usuários': true
        },
        'Tickets': {
          'Visualizar Tickets': true,
          'Gerenciar Tickets': true,
          'Atribuir Tickets': true,
          'Finalizar Tickets': true
        },
        'Departamentos': {
          'Visualizar Departamentos': true,
          'Gerenciar Departamentos': true
        },
        'Relatórios': {
          'Visualizar Relatórios': true,
          'Exportar Relatórios': true
        },
        'Configurações': {
          'Visualizar Configurações': true,
          'Gerenciar Configurações': true,
          'Gerenciar Funções': true
        },
        'SLA': {
          'Visualizar SLA': true,
          'Gerenciar SLA': true
        }
      },
      'supervisor': {
        'Usuários': {
          'Visualizar Usuários': true,
          'Gerenciar Usuários': false,
          'Segurança de Usuários': false
        },
        'Tickets': {
          'Visualizar Tickets': true,
          'Gerenciar Tickets': true,
          'Atribuir Tickets': true,
          'Finalizar Tickets': true
        },
        'Departamentos': {
          'Visualizar Departamentos': true,
          'Gerenciar Departamentos': false
        },
        'Relatórios': {
          'Visualizar Relatórios': true,
          'Exportar Relatórios': true
        },
        'Configurações': {
          'Visualizar Configurações': false,
          'Gerenciar Configurações': false,
          'Gerenciar Funções': false
        },
        'SLA': {
          'Visualizar SLA': true,
          'Gerenciar SLA': false
        }
      },
      'colaborador': {
        'Usuários': {
          'Visualizar Usuários': false,
          'Gerenciar Usuários': false,
          'Segurança de Usuários': false
        },
        'Tickets': {
          'Visualizar Tickets': true,
          'Gerenciar Tickets': true,
          'Atribuir Tickets': false,
          'Finalizar Tickets': false
        },
        'Departamentos': {
          'Visualizar Departamentos': false,
          'Gerenciar Departamentos': false
        },
        'Relatórios': {
          'Visualizar Relatórios': false,
          'Exportar Relatórios': false
        },
        'Configurações': {
          'Visualizar Configurações': false,
          'Gerenciar Configurações': false,
          'Gerenciar Funções': false
        },
        'SLA': {
          'Visualizar SLA': false,
          'Gerenciar SLA': false
        }
      }
    };

    return rolePermissions[role] || {};
  }

  async getTicket(id: string): Promise<TicketWithDetails | undefined> {
    const [ticket] = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        category: tickets.category,
        requesterDepartmentId: tickets.requesterDepartmentId,
        responsibleDepartmentId: tickets.responsibleDepartmentId,
        createdBy: tickets.createdBy,
        assignedTo: tickets.assignedTo,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
        department: {
          id: departments.id,
          name: departments.name,
          description: departments.description,
          createdAt: departments.createdAt,
          updatedAt: departments.updatedAt,
        },
        createdByUser: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          role: users.role,
          departmentId: users.departmentId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(tickets)
      .leftJoin(departments, eq(tickets.responsibleDepartmentId, departments.id))
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .where(eq(tickets.id, id));

    if (!ticket) return undefined;

    // Get assigned user
    let assignedToUser = null;
    if (ticket.assignedTo) {
      const [assignedUser] = await db.select().from(users).where(eq(users.id, ticket.assignedTo));
      assignedToUser = assignedUser || null;
    }

    // Get comments
    const ticketComments = await db
      .select({
        id: comments.id,
        ticketId: comments.ticketId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          role: users.role,
          departmentId: users.departmentId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.ticketId, id));

    // Get attachments
    const ticketAttachments = await db.select().from(attachments).where(eq(attachments.ticketId, id));

    const baseTicket = {
      ...ticket,
      assignedToUser,
      comments: ticketComments,
      attachments: ticketAttachments,
    } as TicketWithDetails;

    // Calcular SLA para o ticket individual também
    return await this.calculateTicketSLA(baseTicket);
  }

  async getTicketsByUser(userId: string): Promise<TicketWithDetails[]> {
    const userTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.createdBy, userId));

    const detailedTickets = await Promise.all(
      userTickets.map(ticket => this.getTicket(ticket.id))
    );

    return detailedTickets.filter(ticket => ticket !== undefined) as TicketWithDetails[];
  }

  async getAllTickets(filters?: { createdBy?: string, departmentId?: string, assignedTo?: string }): Promise<TicketWithDetails[]> {
    // Aplicar filtros baseados na hierarquia
    let query = db.select().from(tickets);
    
    const conditions = [];
    if (filters?.createdBy) {
      conditions.push(eq(tickets.createdBy, filters.createdBy));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(tickets.assignedTo, filters.assignedTo));
    }
    if (filters?.departmentId) {
      conditions.push(
        or(
          eq(tickets.departmentId, filters.departmentId),
          eq(tickets.requesterDepartmentId, filters.departmentId),
          eq(tickets.responsibleDepartmentId, filters.departmentId)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allTickets = await query.orderBy(desc(tickets.createdAt));

    const detailedTickets = await Promise.all(
      allTickets.map(ticket => this.getTicket(ticket.id))
    );

    // Calcular SLA para cada ticket
    const ticketsWithSLA = await Promise.all(
      detailedTickets
        .filter(ticket => ticket !== undefined)
        .map(async ticket => await this.calculateTicketSLA(ticket as TicketWithDetails))
    );

    return ticketsWithSLA;
  }

  async calculateTicketSLA(ticket: TicketWithDetails): Promise<TicketWithDetails> {
    try {
      // Se o ticket já foi resolvido, não precisa calcular SLA
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        return { 
          ...ticket, 
          slaStatus: 'met' as const, 
          slaHoursRemaining: 0,
          slaHoursTotal: 0,
          slaSource: 'ticket resolvido'
        };
      }

      let slaHours = 4; // Padrão de 4 horas conforme solicitado
      let slaSource = 'padrão (4h)';

      // 1. Primeiro, buscar regras SLA específicas (maior prioridade)
      const slaRulesData = await db.select().from(slaRules).where(eq(slaRules.isActive, true));
      
      if (slaRulesData && slaRulesData.length > 0) {
        const matchingRule = slaRulesData.find(rule => {
          const matchesDepartment = !rule.departmentId || rule.departmentId === ticket.responsibleDepartmentId;
          const matchesCategory = !rule.category || rule.category === ticket.category; // ticket.category já é o ID
          const matchesPriority = !rule.priority || rule.priority === ticket.priority;
          return matchesDepartment && matchesCategory && matchesPriority;
        });

        if (matchingRule) {
          slaHours = matchingRule.timeHours;
          slaSource = `regra SLA: ${matchingRule.name}`;
        }
      }

      // 2. Se não encontrou regra SLA, buscar configuração de prioridade
      if (slaSource === 'padrão (4h)') {
        const [priorityConfigResult] = await db
          .select()
          .from(priorityConfig)
          .where(eq(priorityConfig.value, ticket.priority));

        if (priorityConfigResult?.slaHours) {
          slaHours = priorityConfigResult.slaHours;
          slaSource = `prioridade: ${priorityConfigResult.name}`;
        }
      }

      // 3. Se não encontrou na prioridade, buscar na categoria
      if (slaSource === 'padrão (4h)' && ticket.category) {
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, ticket.category)); // Usar ID ao invés de name
        
        if (category?.slaHours) {
          slaHours = category.slaHours;
          slaSource = `categoria: ${category.name}`;
        }
      }

      // Calcular tempo decorrido desde a criação
      const now = new Date();
      const createdAt = new Date(ticket.createdAt);
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const hoursRemaining = slaHours - hoursElapsed;

      // Determinar status do SLA
      let slaStatus: 'met' | 'at_risk' | 'violated' = 'met';
      
      if (hoursElapsed > slaHours) {
        slaStatus = 'violated';
      } else if (hoursRemaining <= slaHours * 0.2) { // 20% do tempo restante = em risco
        slaStatus = 'at_risk';
      }

      return {
        ...ticket,
        slaStatus,
        slaHoursRemaining: Math.round(hoursRemaining * 100) / 100,
        slaHoursTotal: slaHours,
        slaSource
      };
    } catch (error) {
      console.error('Erro ao calcular SLA:', error);
      return ticket;
    }
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    try {
      console.log('Creating ticket with data:', ticket);
      
      // Gerar número sequencial do ticket
      const ticketNumber = await this.generateNextTicketNumber();
      console.log('Generated ticket number:', ticketNumber);
      
      const [newTicket] = await db.insert(tickets).values({
        ...ticket,
        ticketNumber,
      }).returning();
      
      console.log('Created ticket:', newTicket);
      return newTicket;
    } catch (error) {
      console.error('Error in createTicket:', error);
      throw error;
    }
  }

  private async generateNextTicketNumber(): Promise<string> {
    try {
      console.log('Generating next ticket number...');
      
      // Buscar todos os tickets que começam com TICK- e extrair o maior número
      const allTickets = await db
        .select({ ticketNumber: tickets.ticketNumber })
        .from(tickets);

      let maxNumber = 0;
      
      // Iterar por todos os tickets para encontrar o maior número
      for (const ticket of allTickets) {
        const match = ticket.ticketNumber.match(/TICK-(\d+)/);
        if (match) {
          const ticketNum = parseInt(match[1], 10);
          if (ticketNum > maxNumber) {
            maxNumber = ticketNum;
          }
        }
      }
      
      const nextNumber = maxNumber + 1;
      const newTicketNumber = `TICK-${nextNumber.toString().padStart(3, '0')}`;
      console.log(`Found max number: ${maxNumber}, next number: ${newTicketNumber}`);
      return newTicketNumber;
      
    } catch (error) {
      console.error('Erro ao gerar número do ticket:', error);
      // Fallback simples
      const fallbackNumber = `TICK-001`;
      console.log('Using fallback number:', fallbackNumber);
      return fallbackNumber;
    }
  }

  async updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        ...updates, 
        updatedAt: new Date(),
        ...(updates.status === 'resolved' ? { resolvedAt: new Date() } : {}),
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
    return ticket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    try {
      // Primeiro, excluir comentários relacionados
      await db.delete(comments).where(eq(comments.ticketId, id));
      
      // Depois, excluir anexos relacionados
      await db.delete(attachments).where(eq(attachments.ticketId, id));
      
      // Finalmente, excluir o ticket
      await db.delete(tickets).where(eq(tickets.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      return false;
    }
  }

  async migrateTicketNumbers(): Promise<void> {
    try {
      // Buscar todos os tickets ordenados por data de criação
      const allTickets = await db
        .select({ id: tickets.id, ticketNumber: tickets.ticketNumber, createdAt: tickets.createdAt })
        .from(tickets)
        .orderBy(tickets.createdAt);

      // Renumerar todos os tickets sequencialmente
      for (let i = 0; i < allTickets.length; i++) {
        const newTicketNumber = `TICK-${(i + 1).toString().padStart(3, '0')}`;
        
        await db
          .update(tickets)
          .set({ ticketNumber: newTicketNumber })
          .where(eq(tickets.id, allTickets[i].id));
      }

      console.log(`Migrated ${allTickets.length} ticket numbers successfully`);
    } catch (error) {
      console.error('Error migrating ticket numbers:', error);
      throw error;
    }
  }

  async getCommentsByTicket(ticketId: string): Promise<(Comment & { user: User })[]> {
    const ticketComments = await db
      .select({
        id: comments.id,
        ticketId: comments.ticketId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          role: users.role,
          departmentId: users.departmentId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.ticketId, ticketId));

    return ticketComments as (Comment & { user: User })[];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getAttachmentsByTicket(ticketId: string): Promise<Attachment[]> {
    return await db.select().from(attachments).where(eq(attachments.ticketId, ticketId));
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  // Categories methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoriesByDepartment(departmentId: string): Promise<Category[]> {
    return await db.select().from(categories)
      .where(and(eq(categories.departmentId, departmentId), eq(categories.isActive, true)));
  }

  // SLA Rules methods
  async getSLARules(): Promise<SLARule[]> {
    return await db.select().from(slaRules).where(eq(slaRules.isActive, true));
  }

  async createSLARule(data: InsertSLARule): Promise<SLARule> {
    // Validação: apenas um tipo de SLA por regra
    const typeCount = [data.departmentId, data.category, data.priority].filter(Boolean).length;
    if (typeCount !== 1) {
      throw new Error('SLA rule must have exactly one defining field: departmentId, category, or priority');
    }

    const [slaRule] = await db.insert(slaRules).values(data).returning();
    return slaRule;
  }

  async updateSLARule(id: string, data: Partial<InsertSLARule>): Promise<SLARule | null> {
    const [slaRule] = await db.update(slaRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(slaRules.id, id))
      .returning();
    return slaRule || null;
  }

  async deleteSLARule(id: string): Promise<boolean> {
    const result = await db.delete(slaRules).where(eq(slaRules.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category> {
    const [result] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Configuration methods
  async getAllStatusConfigs(): Promise<StatusConfig[]> {
    return await db.select().from(statusConfig).where(eq(statusConfig.isActive, true)).orderBy(statusConfig.order);
  }

  async getAllPriorityConfigs(): Promise<PriorityConfig[]> {
    return await db.select().from(priorityConfig).where(eq(priorityConfig.isActive, true)).orderBy(priorityConfig.order);
  }

  async createStatusConfig(config: InsertStatusConfig): Promise<StatusConfig> {
    const [result] = await db.insert(statusConfig).values(config).returning();
    return result;
  }

  async createPriorityConfig(config: InsertPriorityConfig): Promise<PriorityConfig> {
    const [result] = await db.insert(priorityConfig).values(config).returning();
    return result;
  }

  async updateStatusConfig(id: string, updates: Partial<StatusConfig>): Promise<StatusConfig | undefined> {
    // Remove campos de timestamp para evitar conflitos
    const { createdAt, updatedAt, ...updateData } = updates;
    
    const [result] = await db
      .update(statusConfig)
      .set({ ...updateData, updatedAt: sql`NOW()` })
      .where(eq(statusConfig.id, id))
      .returning();
    return result;
  }

  async deleteStatusConfig(id: string): Promise<void> {
    await db.delete(statusConfig).where(eq(statusConfig.id, id));
  }

  async updatePriorityConfig(id: string, updates: Partial<PriorityConfig>): Promise<PriorityConfig | undefined> {
    // Remove campos de timestamp para evitar conflitos
    const { createdAt, updatedAt, ...updateData } = updates;
    
    const [result] = await db
      .update(priorityConfig)
      .set({ ...updateData, updatedAt: sql`NOW()` })
      .where(eq(priorityConfig.id, id))
      .returning();
    return result;
  }

  async deletePriorityConfig(id: string): Promise<void> {
    await db.delete(priorityConfig).where(eq(priorityConfig.id, id));
  }

  // Departments methods
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: string, updates: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return result.rowCount > 0;
  }

  async getDashboardStats(filters?: any): Promise<DashboardStats> {
    // Build filter conditions
    const conditions = [];
    
    if (filters?.priority && filters.priority !== 'all') {
      conditions.push(eq(tickets.priority, filters.priority));
    }
    
    if (filters?.department && filters.department !== 'all') {
      // Join with users to filter by department
      conditions.push(eq(users.departmentId, filters.department));
    }
    
    if (filters?.dateFilter) {
      const filterDate = new Date(filters.dateFilter);
      const startDate = startOfDay(filterDate);
      const endDate = endOfDay(filterDate);
      conditions.push(
        and(
          gte(tickets.createdAt, startDate),
          lte(tickets.createdAt, endDate)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total tickets with filters
    let totalTicketsQuery = db.select({ count: count() }).from(tickets);
    if (filters?.department && filters.department !== 'all') {
      totalTicketsQuery = totalTicketsQuery.leftJoin(users, eq(tickets.assignedTo, users.id));
    }
    if (whereClause) {
      totalTicketsQuery = totalTicketsQuery.where(whereClause);
    }
    const totalTicketsResult = await totalTicketsQuery;
    const totalTickets = totalTicketsResult[0]?.count || 0;

    // Get open tickets with filters
    const openConditions = [...conditions, eq(tickets.status, 'open')];
    let openTicketsQuery = db.select({ count: count() }).from(tickets);
    if (filters?.department && filters.department !== 'all') {
      openTicketsQuery = openTicketsQuery.leftJoin(users, eq(tickets.assignedTo, users.id));
    }
    openTicketsQuery = openTicketsQuery.where(and(...openConditions));
    const openTicketsResult = await openTicketsQuery;
    const openTickets = openTicketsResult[0]?.count || 0;

    // Get resolved today with filters
    const today = startOfDay(new Date());
    const resolvedConditions = [
      ...conditions,
      eq(tickets.status, 'resolved'),
      gte(tickets.resolvedAt, today)
    ];
    let resolvedTodayQuery = db.select({ count: count() }).from(tickets);
    if (filters?.department && filters.department !== 'all') {
      resolvedTodayQuery = resolvedTodayQuery.leftJoin(users, eq(tickets.assignedTo, users.id));
    }
    resolvedTodayQuery = resolvedTodayQuery.where(and(...resolvedConditions));
    const resolvedTodayResult = await resolvedTodayQuery;
    const resolvedToday = resolvedTodayResult[0]?.count || 0;

    return {
      totalTickets,
      openTickets,
      resolvedToday,
      avgResponseTime: "2.5h",
      totalTicketsChange: "+12%",
      openTicketsChange: "-8%",
      resolvedTodayChange: "+25%",
      avgResponseTimeChange: "-15%",
    };
  }

  async getPriorityStats(filters?: any): Promise<PriorityStats> {
    // Build base filter conditions
    const baseConditions = [];
    
    if (filters?.department && filters.department !== 'all') {
      baseConditions.push(eq(users.departmentId, filters.department));
    }
    
    if (filters?.dateFilter) {
      const filterDate = new Date(filters.dateFilter);
      const startDate = startOfDay(filterDate);
      const endDate = endOfDay(filterDate);
      baseConditions.push(
        and(
          gte(tickets.createdAt, startDate),
          lte(tickets.createdAt, endDate)
        )
      );
    }

    // Get total with filters (excluding priority filter)
    let totalQuery = db.select({ count: count() }).from(tickets);
    if (filters?.department && filters.department !== 'all') {
      totalQuery = totalQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
    }
    if (baseConditions.length > 0) {
      totalQuery = totalQuery.where(and(...baseConditions));
    }
    const totalTicketsResult = await totalQuery;
    const total = totalTicketsResult[0]?.count || 1;

    // Function to get priority count
    const getPriorityCount = async (priority: string) => {
      const conditions = [...baseConditions, eq(tickets.priority, priority)];
      let query = db.select({ count: count() }).from(tickets);
      if (filters?.department && filters.department !== 'all') {
        query = query.leftJoin(users, eq(tickets.assigneeId, users.id));
      }
      query = query.where(and(...conditions));
      const result = await query;
      return result[0]?.count || 0;
    };

    const critical = await getPriorityCount('critical');
    const high = await getPriorityCount('high');
    const medium = await getPriorityCount('medium');
    const low = await getPriorityCount('low');

    return {
      critical: { count: critical, percentage: Math.round((critical / total) * 100) },
      high: { count: high, percentage: Math.round((high / total) * 100) },
      medium: { count: medium, percentage: Math.round((medium / total) * 100) },
      low: { count: low, percentage: Math.round((low / total) * 100) },
    };
  }

  async getTrendData(days: number, filters?: any): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const startDate = startOfDay(date);
      const endDate = endOfDay(date);

      // Build filter conditions for created tickets
      const createdConditions = [
        gte(tickets.createdAt, startDate),
        lte(tickets.createdAt, endDate)
      ];
      
      if (filters?.priority && filters.priority !== 'all') {
        createdConditions.push(eq(tickets.priority, filters.priority));
      }
      
      if (filters?.department && filters.department !== 'all') {
        createdConditions.push(eq(users.departmentId, filters.department));
      }

      // Get created tickets count
      let createdQuery = db.select({ count: count() }).from(tickets);
      if (filters?.department && filters.department !== 'all') {
        createdQuery = createdQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
      }
      createdQuery = createdQuery.where(and(...createdConditions));
      const createdResult = await createdQuery;
      const created = createdResult[0]?.count || 0;

      // Build filter conditions for resolved tickets
      const resolvedConditions = [
        eq(tickets.status, 'resolved'),
        gte(tickets.resolvedAt, startDate),
        lte(tickets.resolvedAt, endDate)
      ];
      
      if (filters?.priority && filters.priority !== 'all') {
        resolvedConditions.push(eq(tickets.priority, filters.priority));
      }
      
      if (filters?.department && filters.department !== 'all') {
        resolvedConditions.push(eq(users.departmentId, filters.department));
      }

      // Get resolved tickets count
      let resolvedQuery = db.select({ count: count() }).from(tickets);
      if (filters?.department && filters.department !== 'all') {
        resolvedQuery = resolvedQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
      }
      resolvedQuery = resolvedQuery.where(and(...resolvedConditions));
      const resolvedResult = await resolvedQuery;
      const resolved = resolvedResult[0]?.count || 0;

      trends.push({
        date: format(date, "dd/MM"),
        created,
        resolved,
      });
    }

    return trends;
  }

  async getFilteredTickets(filters: any): Promise<TicketWithDetails[]> {
    let query = db.select().from(tickets);
    
    const conditions: any[] = [];
    
    if (filters.startDate && filters.endDate) {
      conditions.push(
        and(
          gte(tickets.createdAt, new Date(filters.startDate)),
          lte(tickets.createdAt, new Date(filters.endDate))
        )
      );
    }
    
    if (filters.departmentId && filters.departmentId !== 'all') {
      conditions.push(eq(tickets.responsibleDepartmentId, filters.departmentId));
    }
    
    if (filters.priority && filters.priority !== 'all') {
      conditions.push(eq(tickets.priority, filters.priority));
    }
    
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(tickets.status, filters.status));
    }
    
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      conditions.push(eq(tickets.assignedTo, filters.assignedTo));
    }
    
    if (filters.createdBy && filters.createdBy !== 'all') {
      conditions.push(eq(tickets.createdBy, filters.createdBy));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const filteredTickets = await query.orderBy(desc(tickets.createdAt));
    
    const detailedTickets = await Promise.all(
      filteredTickets.map(ticket => this.getTicket(ticket.id))
    );

    return detailedTickets.filter(ticket => ticket !== undefined) as TicketWithDetails[];
  }

  async getDepartmentPerformance(startDate: string, endDate: string): Promise<any[]> {
    const allDepartments = await db.select().from(departments);
    const performance = [];

    for (const dept of allDepartments) {
      const totalTicketsResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.responsibleDepartmentId, dept.id),
            gte(tickets.createdAt, new Date(startDate)),
            lte(tickets.createdAt, new Date(endDate))
          )
        );

      const resolvedTicketsResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.responsibleDepartmentId, dept.id),
            eq(tickets.status, 'resolved'),
            gte(tickets.createdAt, new Date(startDate)),
            lte(tickets.createdAt, new Date(endDate))
          )
        );

      const total = totalTicketsResult[0]?.count || 0;
      const resolved = resolvedTicketsResult[0]?.count || 0;
      const pending = total - resolved;

      performance.push({
        name: dept.name,
        tickets: total,
        resolved,
        pending,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgTime: '2.5h' // Simplified for demo
      });
    }

    return performance;
  }

  async getUserPerformance(startDate: string, endDate: string, departmentId?: string): Promise<any[]> {
    let userQuery = db.select().from(users);
    
    if (departmentId && departmentId !== 'all') {
      userQuery = userQuery.where(eq(users.departmentId, departmentId));
    }

    const allUsers = await userQuery;
    const performance = [];

    for (const user of allUsers) {
      const assignedTicketsResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.assignedTo, user.id),
            gte(tickets.createdAt, new Date(startDate)),
            lte(tickets.createdAt, new Date(endDate))
          )
        );

      const resolvedTicketsResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.assignedTo, user.id),
            eq(tickets.status, 'resolved'),
            gte(tickets.createdAt, new Date(startDate)),
            lte(tickets.createdAt, new Date(endDate))
          )
        );

      const assigned = assignedTicketsResult[0]?.count || 0;
      const resolved = resolvedTicketsResult[0]?.count || 0;

      if (assigned > 0) {
        performance.push({
          name: user.name,
          role: user.role,
          tickets: assigned,
          resolved,
          efficiency: assigned > 0 ? Math.round((resolved / assigned) * 100) : 0,
          satisfaction: 4.5 + Math.random() * 0.5 // Simplified for demo
        });
      }
    }

    return performance.sort((a, b) => b.efficiency - a.efficiency);
  }

  async getResolutionTimeAnalysis(startDate: string, endDate: string, departmentId?: string): Promise<any[]> {
    let conditions = [
      eq(tickets.status, 'resolved'),
      gte(tickets.createdAt, new Date(startDate)),
      lte(tickets.createdAt, new Date(endDate))
    ];

    if (departmentId && departmentId !== 'all') {
      conditions.push(eq(tickets.departmentId, departmentId));
    }

    const resolvedTickets = await db
      .select()
      .from(tickets)
      .where(and(...conditions));

    const timeCategories = {
      '< 1 hora': 0,
      '1-4 horas': 0,
      '4-8 horas': 0,
      '8-24 horas': 0,
      '> 24 horas': 0
    };

    resolvedTickets.forEach(ticket => {
      if (ticket.resolvedAt && ticket.createdAt) {
        const hours = differenceInHours(new Date(ticket.resolvedAt), new Date(ticket.createdAt));
        
        if (hours < 1) timeCategories['< 1 hora']++;
        else if (hours < 4) timeCategories['1-4 horas']++;
        else if (hours < 8) timeCategories['4-8 horas']++;
        else if (hours < 24) timeCategories['8-24 horas']++;
        else timeCategories['> 24 horas']++;
      }
    });

    const total = resolvedTickets.length;
    return Object.entries(timeCategories).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }

  // Custom Fields methods
  async getCustomFields(): Promise<CustomField[]> {
    return await db.select().from(customFields).orderBy(customFields.order, customFields.name);
  }

  async getCustomFieldsByCategory(categoryId: string): Promise<CustomField[]> {
    return await db
      .select()
      .from(customFields)
      .where(and(eq(customFields.categoryId, categoryId), eq(customFields.isActive, true)))
      .orderBy(customFields.order, customFields.name);
  }

  async getCustomFieldsByCategoryAndDepartment(categoryId: string, departmentId: string): Promise<CustomField[]> {
    return await db
      .select()
      .from(customFields)
      .where(and(
        eq(customFields.categoryId, categoryId), 
        eq(customFields.departmentId, departmentId),
        eq(customFields.isActive, true)
      ))
      .orderBy(customFields.order, customFields.name);
  }

  async createCustomField(field: InsertCustomField): Promise<CustomField> {
    const [newField] = await db.insert(customFields).values(field).returning();
    return newField;
  }

  async updateCustomField(id: string, updates: Partial<CustomField>): Promise<CustomField | undefined> {
    const [updatedField] = await db
      .update(customFields)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customFields.id, id))
      .returning();
    return updatedField || undefined;
  }

  async deleteCustomField(id: string): Promise<boolean> {
    const result = await db.delete(customFields).where(eq(customFields.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Security functions for user management
  async changeUserPassword(id: string, newPassword: string): Promise<boolean> {
    try {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [user] = await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date() 
        })
        .where(eq(users.id, id))
        .returning();
      
      return !!user;
    } catch (error) {
      console.error('Error changing user password:', error);
      return false;
    }
  }

  async blockUser(id: string, block: boolean): Promise<boolean> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          isBlocked: block,
          updatedAt: new Date() 
        })
        .where(eq(users.id, id))
        .returning();
      
      return !!user;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // First, delete related records (tickets, comments, etc.)
      await db.delete(tickets).where(eq(tickets.assignedTo, id));
      await db.delete(tickets).where(eq(tickets.requesterId, id));
      await db.delete(comments).where(eq(comments.authorId, id));
      
      // Then delete the user
      await db.delete(users).where(eq(users.id, id));
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();