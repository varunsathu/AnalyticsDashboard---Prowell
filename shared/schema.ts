import {
  pgTable,
  varchar,
  integer,
  timestamp,
  jsonb,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
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
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'browser', 'task', 'focus'
  category: text("category").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // in seconds
  metadata: jsonb("metadata"), // additional data like URL, app name, etc.
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'meeting', 'personal', 'work'
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'focus', 'break'
  duration: integer("duration").notNull(), // planned duration in seconds
  completedDuration: integer("completed_duration").notNull(), // actual completed duration in seconds
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const browserActivities = pgTable("browser_activities", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'development', 'learning', 'entertainment', 'social', 'productivity'
  duration: integer("duration").notNull(), // in seconds
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'steps', 'heartRate', 'calories', 'workout'
  value: integer("value").notNull(),
  unit: text("unit").notNull(),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  browserStats: jsonb("browser_stats").notNull(),
  productivityScore: integer("productivity_score").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }),
  tags: text("tags").array(),
  weather: varchar("weather", { length: 100 }),
  highlights: text("highlights"),
  gratitude: text("gratitude"),
  challenges: text("challenges"),
  tomorrowGoals: text("tomorrow_goals"),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }).default("blue"),
  type: varchar("type", { length: 50 }).notNull(), // 'task', 'note', 'activity'
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  estimatedTime: true,
  dueDate: true,
  status: true,
}).partial({
  description: true,
  estimatedTime: true,
  dueDate: true,
  status: true,
}).extend({
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.number(),
  status: z.enum(['pending', 'completed']).optional(),
  actualTime: z.number().optional(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  category: true,
  tags: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  category: true,
  title: true,
  duration: true,
  metadata: true,
  startTime: true,
  endTime: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  type: true,
  startTime: true,
  endTime: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  type: true,
  duration: true,
  completedDuration: true,
  startTime: true,
  endTime: true,
});

export const insertBrowserActivitySchema = createInsertSchema(browserActivities).pick({
  url: true,
  domain: true,
  title: true,
  category: true,
  duration: true,
  startTime: true,
  endTime: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).pick({
  type: true,
  value: true,
  unit: true,
  metadata: true,
  recordedAt: true,
});

export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).pick({
  weekStart: true,
  weekEnd: true,
  browserStats: true,
  productivityScore: true,
  recommendations: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateJournalEntrySchema = insertJournalEntrySchema.partial();

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
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

export type BrowserActivity = typeof browserActivities.$inferSelect;
export type InsertBrowserActivity = z.infer<typeof insertBrowserActivitySchema>;

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type UpdateJournalEntry = z.infer<typeof updateJournalEntrySchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;