import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClassSchema, insertEventSchema, insertAttendanceSchema, insertUserSchema } from "@shared/schema";
import * as z from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    res.json(user);
  });

  app.post("/api/auth/login", async (req, res) => {
    const result = insertUserSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = await storage.getUserByEmail(result.data.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user.id;
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(204).end();
    });
  });

  // Classes
  app.get("/api/classes", async (req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.get("/api/classes/:id", async (req, res) => {
    const cls = await storage.getClass(Number(req.params.id));
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(cls);
  });

  app.post("/api/classes", async (req, res) => {
    const result = insertClassSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid class data" });
    }
    const newClass = await storage.createClass(result.data);
    res.json(newClass);
  });

  app.patch("/api/classes/:id", async (req, res) => {
    const result = insertClassSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid class data" });
    }
    const updated = await storage.updateClass(Number(req.params.id), result.data);
    res.json(updated);
  });

  app.delete("/api/classes/:id", async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.status(204).end();
  });

  // Events
  app.get("/api/events", async (req, res) => {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const events = await storage.getEvents(classId);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    const result = insertEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid event data" });
    }
    const newEvent = await storage.createEvent(result.data);
    res.json(newEvent);
  });

  // Students
  app.get("/api/students", async (req, res) => {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const students = await storage.getStudents(classId);
    res.json(students);
  });

  app.post("/api/students", async (req, res) => {
    const result = insertUserSchema.extend({
      role: z.literal("student"),
      classId: z.number().min(1),
    }).safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: "Invalid student data" });
    }
    const newStudent = await storage.createStudent(result.data);
    res.json(newStudent);
  });

  app.delete("/api/students/:id", async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.status(204).end();
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    const { classId, date } = req.query;
    if (!classId || !date) {
      return res.status(400).json({ message: "Missing classId or date" });
    }
    const attendance = await storage.getAttendance(
      Number(classId),
      new Date(date as string)
    );
    res.json(attendance);
  });

  app.get("/api/attendance/my", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.classId) {
      return res.status(400).json({ message: "No class assigned" });
    }
    const attendance = await storage.getStudentAttendance(req.session.userId);
    res.json(attendance);
  });

  app.post("/api/attendance", async (req, res) => {
    const result = insertAttendanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }
    const newAttendance = await storage.createAttendance(result.data);
    res.json(newAttendance);
  });

  app.patch("/api/attendance/:id", async (req, res) => {
    const result = insertAttendanceSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }
    const updated = await storage.updateAttendance(Number(req.params.id), result.data);
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}