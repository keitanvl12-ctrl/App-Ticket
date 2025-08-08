import { db } from "./db";
import { users, tickets, comments, attachments, departments, categories } from "@shared/schema";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";
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
  type Department,
  type InsertDepartment,
  type DashboardStats,
  type PriorityStats,
  type TrendData,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { format, subDays, startOfDay, endOfDay, differenceInHours } from "date-fns";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

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

  // Departments
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Analytics
  getDashboardStats(filters?: any): Promise<DashboardStats>;
  getPriorityStats(filters?: any): Promise<PriorityStats>;
  getTrendData(days: number, filters?: any): Promise<TrendData[]>;

  // Advanced Reports
  getFilteredTickets(filters: any): Promise<TicketWithDetails[]>;
  getDepartmentPerformance(startDate: string, endDate: string): Promise<any[]>;
  getUserPerformance(startDate: string, endDate: string, departmentId?: string): Promise<any[]>;
  getResolutionTimeAnalysis(startDate: string, endDate: string, departmentId?: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with some demo data for development
    this.initializeDemoData();
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

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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
        departmentId: tickets.departmentId,
        createdBy: tickets.createdBy,
        assignedTo: tickets.assignedTo,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
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

    return {
      ...ticket,
      assignedToUser,
      comments: ticketComments,
      attachments: ticketAttachments,
    } as TicketWithDetails;
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

  async getAllTickets(): Promise<TicketWithDetails[]> {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));

    const detailedTickets = await Promise.all(
      allTickets.map(ticket => this.getTicket(ticket.id))
    );

    return detailedTickets.filter(ticket => ticket !== undefined) as TicketWithDetails[];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const ticketNumber = `TICK-${nanoid(6)}`;
    const [newTicket] = await db.insert(tickets).values({
      ...ticket,
      ticketNumber,
    }).returning();
    return newTicket;
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

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(tickets).where(eq(tickets.id, id));
    return result.rowCount > 0;
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

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Departments methods
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
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
      totalTicketsQuery = totalTicketsQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
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
      openTicketsQuery = openTicketsQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
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
      resolvedTodayQuery = resolvedTodayQuery.leftJoin(users, eq(tickets.assigneeId, users.id));
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
      conditions.push(eq(tickets.departmentId, filters.departmentId));
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
            eq(tickets.departmentId, dept.id),
            gte(tickets.createdAt, new Date(startDate)),
            lte(tickets.createdAt, new Date(endDate))
          )
        );

      const resolvedTicketsResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.departmentId, dept.id),
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
}

export const storage = new DatabaseStorage();