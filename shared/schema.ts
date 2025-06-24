import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high'
  status: text("status").notNull().default('pending'), // 'pending', 'completed'
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'browser', 'task', 'focus'
  category: text("category").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // in minutes
  metadata: jsonb("metadata"), // additional data like URL, app name, etc.
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: text("type").notNull(), // 'meeting', 'personal', 'work'
  createdAt: timestamp("created_at").defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'focus', 'break'
  duration: integer("duration").notNull(), // in minutes
  completedDuration: integer("completed_duration").notNull(), // in minutes
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  estimatedTime: true,
  dueDate: true,
}).extend({
  priority: z.enum(['low', 'medium', 'high']),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.number(),
  status: z.enum(['pending', 'completed']).optional(),
  actualTime: z.number().optional(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  tags: true,
  category: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  category: true,
  title: true,
  duration: true,
  metadata: true,
  startTime: true,
  endTime: true,
}).extend({
  type: z.enum(['browser', 'task', 'focus']),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  type: true,
}).extend({
  type: z.enum(['meeting', 'personal', 'work']),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  type: true,
  duration: true,
  completedDuration: true,
  startTime: true,
  endTime: true,
}).extend({
  type: z.enum(['focus', 'break']),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
