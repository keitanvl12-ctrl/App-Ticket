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
  type DashboardStats,
  type PriorityStats,
  type TrendData,
} from "@shared/schema";
import { randomUUID } from "crypto";
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

  // Analytics
  getDashboardStats(): Promise<DashboardStats>;
  getPriorityStats(): Promise<PriorityStats>;
  getTrendData(days: number): Promise<TrendData[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private comments: Map<string, Comment>;
  private attachments: Map<string, Attachment>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.comments = new Map();
    this.attachments = new Map();

    // Initialize with some demo data for development
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo users
    const adminUser = await this.createUser({
      username: "admin",
      password: "password",
      name: "João Silva",
      email: "joao.silva@empresa.com",
      role: "admin",
    });

    const user1 = await this.createUser({
      username: "maria.santos",
      password: "password",
      name: "Maria Santos",
      email: "maria.santos@empresa.com",
      role: "user",
    });

    const user2 = await this.createUser({
      username: "carlos.oliveira",
      password: "password",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@empresa.com",
      role: "user",
    });

    const user3 = await this.createUser({
      username: "ana.costa",
      password: "password",
      name: "Ana Costa",
      email: "ana.costa@empresa.com",
      role: "user",
    });

    // Create demo tickets with distributed dates for trending data
    const now = new Date();
    const tickets = [
      // Tickets from 6 days ago
      {
        subject: "Sistema de backup está falhando",
        description: "Backup automático não está funcionando corretamente desde a última atualização",
        status: "resolved",
        priority: "high",
        category: "bug",
        createdBy: adminUser.id,
        assignedTo: user1.id,
        createdAt: subDays(now, 6),
        updatedAt: subDays(now, 6),
        resolvedAt: subDays(now, 5),
      },
      {
        subject: "Erro na integração com API externa",
        description: "A integração com o sistema de pagamentos está retornando erro 500",
        status: "resolved",
        priority: "critical",
        category: "bug",
        createdBy: user2.id,
        assignedTo: user3.id,
        createdAt: subDays(now, 6),
        updatedAt: subDays(now, 6),
        resolvedAt: subDays(now, 5),
      },
      // Tickets from 5 days ago
      {
        subject: "Interface de usuário precisa de melhorias",
        description: "Feedback dos usuários sobre dificuldades na navegação",
        status: "resolved",
        priority: "medium",
        category: "improvement",
        createdBy: user1.id,
        assignedTo: user2.id,
        createdAt: subDays(now, 5),
        updatedAt: subDays(now, 4),
        resolvedAt: subDays(now, 4),
      },
      // Tickets from 4 days ago
      {
        subject: "Atualização de segurança necessária",
        description: "Aplicar patches de segurança mais recentes",
        status: "resolved",
        priority: "high",
        category: "security",
        createdBy: adminUser.id,
        assignedTo: user1.id,
        createdAt: subDays(now, 4),
        updatedAt: subDays(now, 3),
        resolvedAt: subDays(now, 3),
      },
      {
        subject: "Performance lenta no carregamento de relatórios",
        description: "Relatórios estão demorando mais de 30 segundos para carregar",
        status: "resolved",
        priority: "medium",
        category: "performance",
        createdBy: user3.id,
        assignedTo: user2.id,
        createdAt: subDays(now, 4),
        updatedAt: subDays(now, 3),
        resolvedAt: subDays(now, 3),
      },
      // Tickets from 3 days ago
      {
        subject: "Configuração de SSL para novos domínios",
        description: "Implementar certificados SSL para os novos subdomínios",
        status: "resolved",
        priority: "medium",
        category: "security",
        createdBy: user1.id,
        assignedTo: user3.id,
        createdAt: subDays(now, 3),
        updatedAt: subDays(now, 2),
        resolvedAt: subDays(now, 2),
      },
      // Tickets from 2 days ago
      {
        subject: "Problemas de conectividade com banco de dados",
        description: "Timeouts frequentes nas consultas ao banco de dados principal",
        status: "resolved",
        priority: "high",
        category: "bug",
        createdBy: adminUser.id,
        assignedTo: user1.id,
        createdAt: subDays(now, 2),
        updatedAt: subDays(now, 1),
        resolvedAt: subDays(now, 1),
      },
      {
        subject: "Otimização de cache do Redis",
        description: "Melhorar performance do sistema de cache",
        status: "resolved",
        priority: "medium",
        category: "performance",
        createdBy: user2.id,
        assignedTo: user3.id,
        createdAt: subDays(now, 2),
        updatedAt: subDays(now, 1),
        resolvedAt: subDays(now, 1),
      },
      // Tickets from yesterday
      {
        subject: "Atualização do sistema de logs",
        description: "Implementar novo sistema de logging estruturado",
        status: "resolved",
        priority: "low",
        category: "improvement",
        createdBy: user3.id,
        assignedTo: user2.id,
        createdAt: subDays(now, 1),
        updatedAt: now,
        resolvedAt: now,
      },
      // Current tickets (today)
      {
        subject: "Problemas de autenticação no aplicativo móvel",
        description: "Usuários estão enfrentando falhas de login no aplicativo móvel. O problema parece estar relacionado à integração OAuth.",
        status: "in_progress",
        priority: "high",
        category: "bug",
        createdBy: adminUser.id,
        assignedTo: user1.id,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        subject: "Otimização de performance do banco de dados necessária",
        description: "A performance das consultas degradou significativamente para grandes volumes de dados. É necessário otimizar a indexação e estrutura das consultas.",
        status: "open",
        priority: "medium",
        category: "improvement",
        createdBy: adminUser.id,
        assignedTo: user2.id,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        subject: "Configuração de monitoramento avançado",
        description: "Implementar sistema de alertas proativo para identificar problemas antes que afetem os usuários",
        status: "open",
        priority: "low",
        category: "improvement",
        createdBy: user3.id,
        assignedTo: user2.id,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
    ];

    for (const ticketData of tickets) {
      const ticket: Ticket = {
        id: nanoid(),
        subject: ticketData.subject,
        description: ticketData.description,
        status: ticketData.status as "open" | "in_progress" | "resolved" | "closed",
        priority: ticketData.priority as "low" | "medium" | "high" | "critical",
        category: ticketData.category,
        createdBy: ticketData.createdBy,
        assignedTo: ticketData.assignedTo,
        createdAt: ticketData.createdAt,
        updatedAt: ticketData.updatedAt,
        resolvedAt: ticketData.resolvedAt,
      };
      this.tickets.set(ticket.id, ticket);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Ticket methods
  async getTicket(id: string): Promise<TicketWithDetails | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const createdByUser = await this.getUser(ticket.createdBy);
    const assignedToUser = ticket.assignedTo ? (await this.getUser(ticket.assignedTo)) || null : null;
    const comments = await this.getCommentsByTicket(id);
    const attachments = await this.getAttachmentsByTicket(id);

    if (!createdByUser) return undefined;

    return {
      ...ticket,
      createdByUser,
      assignedToUser,
      comments,
      attachments,
    };
  }

  async getTicketsByUser(userId: string): Promise<TicketWithDetails[]> {
    const userTickets = Array.from(this.tickets.values()).filter(
      ticket => ticket.createdBy === userId || ticket.assignedTo === userId
    );

    const ticketDetails = await Promise.all(
      userTickets.map(ticket => this.getTicket(ticket.id))
    );

    return ticketDetails.filter(Boolean) as TicketWithDetails[];
  }

  async getAllTickets(): Promise<TicketWithDetails[]> {
    const allTickets = Array.from(this.tickets.values());
    const ticketDetails = await Promise.all(
      allTickets.map(ticket => this.getTicket(ticket.id))
    );

    return ticketDetails.filter(Boolean) as TicketWithDetails[];
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticketNumber = `TF-${Math.floor(Math.random() * 10000) + 1000}`;
    const now = new Date();

    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketNumber,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      category: insertTicket.category || null,
      assignedTo: insertTicket.assignedTo || null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket: Ticket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
      resolvedAt: updates.status === "resolved" ? new Date() : ticket.resolvedAt,
    };

    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }

  // Comment methods
  async getCommentsByTicket(ticketId: string): Promise<(Comment & { user: User })[]> {
    const ticketComments = Array.from(this.comments.values()).filter(
      comment => comment.ticketId === ticketId
    );

    const commentsWithUsers = await Promise.all(
      ticketComments.map(async comment => {
        const user = await this.getUser(comment.userId);
        return user ? { ...comment, user } : null;
      })
    );

    return commentsWithUsers.filter(Boolean) as (Comment & { user: User })[];
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };

    this.comments.set(id, comment);
    return comment;
  }

  // Attachment methods
  async getAttachmentsByTicket(ticketId: string): Promise<Attachment[]> {
    return Array.from(this.attachments.values()).filter(
      attachment => attachment.ticketId === ticketId
    );
  }

  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const attachment: Attachment = {
      ...insertAttachment,
      id,
      createdAt: new Date(),
    };

    this.attachments.set(id, attachment);
    return attachment;
  }

  // Analytics methods
  async getDashboardStats(): Promise<DashboardStats> {
    const allTickets = Array.from(this.tickets.values());
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
    const resolvedToday = allTickets.filter(t => 
      t.resolvedAt && t.resolvedAt >= todayStart && t.resolvedAt <= todayEnd
    ).length;

    // Calculate average response time (mock calculation)
    const resolvedTickets = allTickets.filter(t => t.resolvedAt);
    const avgHours = resolvedTickets.length > 0 
      ? resolvedTickets.reduce((sum, t) => 
          sum + differenceInHours(t.resolvedAt!, t.createdAt), 0
        ) / resolvedTickets.length
      : 0;
    
    const avgResponseTime = `${Math.round(avgHours * 10) / 10}h`;

    return {
      totalTickets,
      openTickets,
      resolvedToday,
      avgResponseTime,
      totalTicketsChange: "+12%",
      openTicketsChange: "+5%",
      resolvedTodayChange: "+18%",
      avgResponseTimeChange: "-8%",
    };
  }

  async getPriorityStats(): Promise<PriorityStats> {
    const allTickets = Array.from(this.tickets.values());
    const total = allTickets.length;

    const counts = {
      critical: allTickets.filter(t => t.priority === "critical").length,
      high: allTickets.filter(t => t.priority === "high").length,
      medium: allTickets.filter(t => t.priority === "medium").length,
      low: allTickets.filter(t => t.priority === "low").length,
    };

    return {
      critical: { 
        count: counts.critical, 
        percentage: total > 0 ? Math.round((counts.critical / total) * 100) : 0 
      },
      high: { 
        count: counts.high, 
        percentage: total > 0 ? Math.round((counts.high / total) * 100) : 0 
      },
      medium: { 
        count: counts.medium, 
        percentage: total > 0 ? Math.round((counts.medium / total) * 100) : 0 
      },
      low: { 
        count: counts.low, 
        percentage: total > 0 ? Math.round((counts.low / total) * 100) : 0 
      },
    };
  }

  async getTrendData(days: number): Promise<TrendData[]> {
    const allTickets = Array.from(this.tickets.values());
    const trendData: TrendData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const created = allTickets.filter(t => {
        const ticketDate = new Date(t.createdAt);
        return ticketDate >= dayStart && ticketDate <= dayEnd;
      }).length;

      const resolved = allTickets.filter(t => {
        if (!t.resolvedAt) return false;
        const resolvedDate = new Date(t.resolvedAt);
        return resolvedDate >= dayStart && resolvedDate <= dayEnd;
      }).length;

      trendData.push({
        date: format(date, 'dd/MM'),
        created,
        resolved,
      });
    }

    return trendData;
  }
}

export const storage = new MemStorage();
