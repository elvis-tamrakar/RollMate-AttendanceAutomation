import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table and types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // 'teacher' or 'student'
  classId: integer("class_id"), // null for teachers
});

// Class table and types
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  schedule: json("schedule").notNull(), // Array of class timings
  geofence: json("geofence"), // Geofence configuration
});

// Event table and types
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  type: text("type").notNull(), // 'assignment' or 'event'
  location: json("location").$type<{ buildingId: string; room?: string }>(), // Building ID and room info
});

// Attendance table and types
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
export const insertUserSchema = createInsertSchema(users);
export const insertClassSchema = createInsertSchema(classes);
export const insertEventSchema = createInsertSchema(events);
export const insertAttendanceSchema = createInsertSchema(attendance);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;