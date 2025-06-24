import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTaskSchema,
  updateTaskSchema,
  insertNoteSchema,
  insertActivitySchema,
  insertEventSchema,
  insertFocusSessionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const userId = 1; // Demo user ID

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = updateTaskSchema.parse({ ...req.body, id: taskId });
      const task = await storage.updateTask(userId, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(userId, taskId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const { search } = req.query;
      let notes;
      if (search && typeof search === 'string') {
        notes = await storage.searchNotes(userId, search);
      } else {
        notes = await storage.getUserNotes(userId);
      }
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(userId, noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const noteData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(userId, noteId, noteData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const success = await storage.deleteNote(userId, noteId);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const activities = await storage.getUserActivities(userId, start, end);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(userId, activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.get("/api/activities/stats", async (req, res) => {
    try {
      const { date } = req.query;
      const statsDate = date ? new Date(date as string) : new Date();
      const stats = await storage.getActivityStats(userId, statsDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity stats" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const events = await storage.getUserEvents(userId, start, end);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(userId, eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(userId, eventId, eventData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(userId, eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Focus Sessions
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const sessions = await storage.getUserFocusSessions(userId, start, end);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch focus sessions" });
    }
  });

  app.post("/api/focus-sessions", async (req, res) => {
    try {
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(userId, sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid focus session data" });
    }
  });

  app.put("/api/focus-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const sessionData = insertFocusSessionSchema.partial().parse(req.body);
      const session = await storage.updateFocusSession(userId, sessionId, sessionData);
      if (!session) {
        return res.status(404).json({ message: "Focus session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid focus session data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const [tasks, activities, focusSessions] = await Promise.all([
        storage.getUserTasks(userId),
        storage.getUserActivities(userId, startOfDay, endOfDay),
        storage.getUserFocusSessions(userId, startOfDay, endOfDay),
      ]);

      const completedTasks = tasks.filter(task => task.status === 'completed');
      const totalTasks = tasks.length;
      const todayCompletedTasks = completedTasks.filter(task => 
        task.completedAt && 
        task.completedAt >= startOfDay && 
        task.completedAt <= endOfDay
      ).length;

      const focusTime = focusSessions
        .filter(session => session.type === 'focus')
        .reduce((sum, session) => sum + session.completedDuration, 0);

      const activityStats = await storage.getActivityStats(userId, today);

      res.json({
        focusTime: Math.floor(focusTime), // in minutes
        tasksCompleted: todayCompletedTasks,
        totalTasks,
        weeklyGoals: 4, // Mock data for weekly goals
        totalWeeklyGoals: 7,
        productivityScore: Math.min(100, Math.round((focusTime / 240) * 100)), // Based on 4h goal
        activityStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
