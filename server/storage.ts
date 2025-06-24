import {
  users,
  tasks,
  notes,
  activities,
  events,
  focusSessions,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
  type Note,
  type InsertNote,
  type Activity,
  type InsertActivity,
  type Event,
  type InsertEvent,
  type FocusSession,
  type InsertFocusSession,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tasks
  getUserTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(userId: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(userId: number, taskId: number): Promise<boolean>;

  // Notes
  getUserNotes(userId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(userId: number, note: InsertNote): Promise<Note>;
  updateNote(userId: number, noteId: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(userId: number, noteId: number): Promise<boolean>;
  searchNotes(userId: number, query: string): Promise<Note[]>;

  // Activities
  getUserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]>;
  createActivity(userId: number, activity: InsertActivity): Promise<Activity>;
  getActivityStats(userId: number, date: Date): Promise<any>;

  // Events
  getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(userId: number, event: InsertEvent): Promise<Event>;
  updateEvent(userId: number, eventId: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(userId: number, eventId: number): Promise<boolean>;

  // Focus Sessions
  getUserFocusSessions(userId: number, startDate?: Date, endDate?: Date): Promise<FocusSession[]>;
  createFocusSession(userId: number, session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(userId: number, sessionId: number, session: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private activities: Map<number, Activity>;
  private events: Map<number, Event>;
  private focusSessions: Map<number, FocusSession>;
  private currentUserId: number;
  private currentTaskId: number;
  private currentNoteId: number;
  private currentActivityId: number;
  private currentEventId: number;
  private currentFocusSessionId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.activities = new Map();
    this.events = new Map();
    this.focusSessions = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentNoteId = 1;
    this.currentActivityId = 1;
    this.currentEventId = 1;
    this.currentFocusSessionId = 1;

    // Initialize with demo user
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoUser: User = {
      id: 1,
      username: 'varun',
      password: 'demo',
      name: 'Varun',
      email: 'varun@example.com',
      createdAt: new Date(),
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Tasks
  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      userId,
      status: 'pending',
      actualTime: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(userId: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(updateTask.id);
    if (!existingTask || existingTask.userId !== userId) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updateTask,
      updatedAt: new Date(),
      completedAt: updateTask.status === 'completed' ? new Date() : existingTask.completedAt,
    };
    this.tasks.set(updateTask.id, updatedTask);
    return updatedTask;
  }

  async deleteTask(userId: number, taskId: number): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.userId !== userId) {
      return false;
    }
    return this.tasks.delete(taskId);
  }

  // Notes
  async getUserNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.userId === userId);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(userId: number, insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const note: Note = {
      ...insertNote,
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(userId: number, noteId: number, updateNote: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(noteId);
    if (!existingNote || existingNote.userId !== userId) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...updateNote,
      updatedAt: new Date(),
    };
    this.notes.set(noteId, updatedNote);
    return updatedNote;
  }

  async deleteNote(userId: number, noteId: number): Promise<boolean> {
    const note = this.notes.get(noteId);
    if (!note || note.userId !== userId) {
      return false;
    }
    return this.notes.delete(noteId);
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const userNotes = await this.getUserNotes(userId);
    const lowercaseQuery = query.toLowerCase();
    return userNotes.filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // Activities
  async getUserActivities(userId: number, startDate?: Date, endDate?: Date): Promise<Activity[]> {
    let userActivities = Array.from(this.activities.values()).filter(activity => activity.userId === userId);
    
    if (startDate) {
      userActivities = userActivities.filter(activity => activity.startTime >= startDate);
    }
    if (endDate) {
      userActivities = userActivities.filter(activity => activity.endTime <= endDate);
    }
    
    return userActivities;
  }

  async createActivity(userId: number, insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      userId,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivityStats(userId: number, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayActivities = await this.getUserActivities(userId, startOfDay, endOfDay);
    
    const categoryStats = dayActivities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category] += activity.duration;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);

    return {
      totalTime,
      categoryStats,
      activities: dayActivities,
    };
  }

  // Events
  async getUserEvents(userId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let userEvents = Array.from(this.events.values()).filter(event => event.userId === userId);
    
    if (startDate) {
      userEvents = userEvents.filter(event => event.startTime >= startDate);
    }
    if (endDate) {
      userEvents = userEvents.filter(event => event.endTime <= endDate);
    }
    
    return userEvents;
  }

  async createEvent(userId: number, insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      userId,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(userId: number, eventId: number, updateEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(eventId);
    if (!existingEvent || existingEvent.userId !== userId) {
      return undefined;
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...updateEvent,
    };
    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(userId: number, eventId: number): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event || event.userId !== userId) {
      return false;
    }
    return this.events.delete(eventId);
  }

  // Focus Sessions
  async getUserFocusSessions(userId: number, startDate?: Date, endDate?: Date): Promise<FocusSession[]> {
    let userSessions = Array.from(this.focusSessions.values()).filter(session => session.userId === userId);
    
    if (startDate) {
      userSessions = userSessions.filter(session => session.startTime >= startDate);
    }
    if (endDate) {
      userSessions = userSessions.filter(session => session.endTime && session.endTime <= endDate);
    }
    
    return userSessions;
  }

  async createFocusSession(userId: number, insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = this.currentFocusSessionId++;
    const session: FocusSession = {
      ...insertSession,
      id,
      userId,
      createdAt: new Date(),
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(userId: number, sessionId: number, updateSession: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const existingSession = this.focusSessions.get(sessionId);
    if (!existingSession || existingSession.userId !== userId) {
      return undefined;
    }

    const updatedSession: FocusSession = {
      ...existingSession,
      ...updateSession,
    };
    this.focusSessions.set(sessionId, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
