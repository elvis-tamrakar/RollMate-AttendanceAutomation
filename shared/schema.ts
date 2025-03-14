import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // 'teacher' or 'student'
  classId: integer("class_id"), // null for teachers
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  schedule: json("schedule").notNull(), // Array of class timings
  geofence: json("geofence"), // Mapbox geofence configuration
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  type: text("type").notNull(), // 'assignment' or 'event'
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'late', 'left_early'
  note: text("note"),
  location: json("location"), // Student's location at check-in
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  role: true,
  classId: true,
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
  description: true,
  teacherId: true,
  schedule: true,
  geofence: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  classId: true,
  title: true,
  description: true,
  dueDate: true,
  type: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  classId: true,
  date: true,
  status: true,
  note: true,
  location: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;