import { db } from "./db";
import { users, tickets, comments, attachments } from "@shared/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";
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

      const [user1] = await db.insert(users).values({
        username: "maria.santos",
        password: "senha123",
        name: "Maria Santos",
        email: "maria.santos@empresa.com",
        role: "user",
      }).returning();

      const [user2] = await db.insert(users).values({
        username: "carlos.oliveira",
        password: "senha123",
        name: "Carlos Oliveira",
        email: "carlos.oliveira@empresa.com",
        role: "user",
      }).returning();

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
          assignedTo: user1.id,
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
          createdBy: user2.id,
          assignedTo: user1.id,
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
          createdBy: user2.id,
          assignedTo: user1.id,
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
          createdBy: user1.id,
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
          assignedTo: user2.id,
          createdAt: subDays(now, 1),
          updatedAt: subDays(now, 1),
        },
      ];

      await db.insert(tickets).values(demoTickets);
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

  async getDashboardStats(): Promise<DashboardStats> {
    const totalTicketsResult = await db.select({ count: count() }).from(tickets);
    const totalTickets = totalTicketsResult[0]?.count || 0;

    const openTicketsResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, 'open'));
    const openTickets = openTicketsResult[0]?.count || 0;

    const today = startOfDay(new Date());
    const resolvedTodayResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'resolved'),
          gte(tickets.resolvedAt, today)
        )
      );
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

  async getPriorityStats(): Promise<PriorityStats> {
    const totalTicketsResult = await db.select({ count: count() }).from(tickets);
    const total = totalTicketsResult[0]?.count || 1;

    const criticalResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.priority, 'critical'));
    const critical = criticalResult[0]?.count || 0;

    const highResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.priority, 'high'));
    const high = highResult[0]?.count || 0;

    const mediumResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.priority, 'medium'));
    const medium = mediumResult[0]?.count || 0;

    const lowResult = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.priority, 'low'));
    const low = lowResult[0]?.count || 0;

    return {
      critical: { count: critical, percentage: Math.round((critical / total) * 100) },
      high: { count: high, percentage: Math.round((high / total) * 100) },
      medium: { count: medium, percentage: Math.round((medium / total) * 100) },
      low: { count: low, percentage: Math.round((low / total) * 100) },
    };
  }

  async getTrendData(days: number): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const startDate = startOfDay(date);
      const endDate = endOfDay(date);

      const createdResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            gte(tickets.createdAt, startDate),
            gte(endDate, tickets.createdAt)
          )
        );
      const created = createdResult[0]?.count || 0;

      const resolvedResult = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, 'resolved'),
            gte(tickets.resolvedAt, startDate),
            gte(endDate, tickets.resolvedAt)
          )
        );
      const resolved = resolvedResult[0]?.count || 0;

      trends.push({
        date: format(date, "dd/MM"),
        created,
        resolved,
      });
    }

    return trends;
  }
}

export const storage = new DatabaseStorage();