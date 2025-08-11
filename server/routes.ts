import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { departmentStorage } from "./departmentStorage";
import { insertDepartmentSchema } from "@shared/schema";
import { insertTicketSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

const updateTicketSchema = insertTicketSchema.partial();

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats with filters
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      const stats = await storage.getDashboardStats(filters);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/priority-stats", async (req, res) => {
    try {
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      const stats = await storage.getPriorityStats(filters);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch priority stats" });
    }
  });

  app.get("/api/dashboard/trends", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const filters = {
        dateFilter: req.query.dateFilter as string,
        priority: req.query.priority as string,
        department: req.query.department as string
      };
      const trends = await storage.getTrendData(days, filters);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Tickets
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const validatedData = updateTicketSchema.parse(req.body);
      const ticket = await storage.updateTicket(req.params.id, validatedData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTicket(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Endpoint específico para finalizar tickets
  app.patch("/api/tickets/:id/finalize", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, finalizationData, progress } = req.body;
      
      // Atualizar o ticket com status resolvido e dados de finalização
      const updateData = {
        status: status || 'Resolvido',
        progress: progress || 100,
        // Salvar dados de finalização nos metadados ou campos específicos
        finalizationComment: finalizationData?.comment,
        hoursSpent: finalizationData?.hoursSpent,
        equipmentRemoved: finalizationData?.equipmentRemoved,
        materialsUsed: finalizationData?.materialsUsed,
        extraCharge: finalizationData?.extraCharge,
        chargeType: finalizationData?.chargeType,
        finalizedAt: new Date().toISOString()
      };
      
      const ticket = await storage.updateTicket(id, updateData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error finalizing ticket:", error);
      res.status(500).json({ message: "Failed to finalize ticket" });
    }
  });

  // Comments
  app.get("/api/tickets/:ticketId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByTicket(req.params.ticketId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/tickets/:ticketId/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        departmentId: user.departmentId
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role || !['admin', 'supervisor', 'colaborador'].includes(role)) {
        return res.status(400).json({ message: "Role inválido" });
      }

      const updatedUser = await storage.updateUser(id, { role });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await departmentStorage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const department = await departmentStorage.getDepartment(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await departmentStorage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(400).json({ message: "Failed to create department" });
    }
  });

  app.patch("/api/departments/:id", async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await departmentStorage.updateDepartment(req.params.id, validatedData);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(400).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const success = await departmentStorage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/department/:departmentId", async (req, res) => {
    try {
      const { departmentId } = req.params;
      const categories = await storage.getCategoriesByDepartment(departmentId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by department:", error);
      res.status(500).json({ message: "Failed to fetch categories by department" });
    }
  });

  // Configuration routes
  app.get("/api/config/status", async (req, res) => {
    try {
      const statusConfigs = await storage.getAllStatusConfigs();
      res.json(statusConfigs);
    } catch (error) {
      console.error("Error fetching status configs:", error);
      res.status(500).json({ message: "Failed to fetch status configurations" });
    }
  });

  app.get("/api/config/priority", async (req, res) => {
    try {
      const priorityConfigs = await storage.getAllPriorityConfigs();
      res.json(priorityConfigs);
    } catch (error) {
      console.error("Error fetching priority configs:", error);
      res.status(500).json({ message: "Failed to fetch priority configurations" });
    }
  });

  // SLA endpoints
  app.get("/api/sla/rules", async (req, res) => {
    try {
      const slaRules = await storage.getSLARules();
      res.json(slaRules);
    } catch (error) {
      console.error("Error fetching SLA rules:", error);
      res.status(500).json({ message: "Failed to fetch SLA rules" });
    }
  });

  app.post("/api/sla/rules", async (req, res) => {
    try {
      const slaRule = await storage.createSLARule(req.body);
      res.json(slaRule);
    } catch (error) {
      console.error("Error creating SLA rule:", error);
      res.status(500).json({ message: "Failed to create SLA rule" });
    }
  });

  app.put("/api/sla/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const slaRule = await storage.updateSLARule(id, req.body);
      res.json(slaRule);
    } catch (error) {
      console.error("Error updating SLA rule:", error);
      res.status(500).json({ message: "Failed to update SLA rule" });
    }
  });

  app.delete("/api/sla/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSLARule(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SLA rule:", error);
      res.status(500).json({ message: "Failed to delete SLA rule" });
    }
  });

  // Advanced Reports API
  app.get("/api/reports/filtered-tickets", async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        departmentId,
        priority,
        status,
        assignedTo,
        createdBy
      } = req.query;

      const tickets = await storage.getFilteredTickets({
        startDate: startDate as string,
        endDate: endDate as string,
        departmentId: departmentId as string,
        priority: priority as string,
        status: status as string,
        assignedTo: assignedTo as string,
        createdBy: createdBy as string,
      });
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching filtered tickets:", error);
      res.status(500).json({ message: "Failed to fetch filtered tickets" });
    }
  });

  app.get("/api/reports/department-performance", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const performance = await storage.getDepartmentPerformance(
        startDate as string,
        endDate as string
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching department performance:", error);
      res.status(500).json({ message: "Failed to fetch department performance" });
    }
  });

  app.get("/api/reports/user-performance", async (req, res) => {
    try {
      const { startDate, endDate, departmentId } = req.query;
      const performance = await storage.getUserPerformance(
        startDate as string,
        endDate as string,
        departmentId as string
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching user performance:", error);
      res.status(500).json({ message: "Failed to fetch user performance" });
    }
  });

  app.get("/api/reports/resolution-time-analysis", async (req, res) => {
    try {
      const { startDate, endDate, departmentId } = req.query;
      const analysis = await storage.getResolutionTimeAnalysis(
        startDate as string,
        endDate as string,
        departmentId as string
      );
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching resolution time analysis:", error);
      res.status(500).json({ message: "Failed to fetch resolution time analysis" });
    }
  });

  // Excluir ticket (apenas para administradores)
  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = req.params.id;
      
      // Verificar se o ticket existe
      const ticket = await storage.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Excluir o ticket
      await storage.deleteTicket(ticketId);
      
      res.json({ message: "Ticket excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Erro ao excluir ticket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
