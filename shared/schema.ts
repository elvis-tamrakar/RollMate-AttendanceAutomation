import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  classId: integer("class_id").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: timestamp("date").notNull(),
  present: boolean("present").notNull(),
  note: text("note"),
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
  description: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  email: true,
  classId: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  classId: true,
  date: true,
  present: true,
  note: true,
});

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
