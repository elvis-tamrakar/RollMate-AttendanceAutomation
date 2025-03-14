import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClassSchema, insertStudentSchema, insertAttendanceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Classes
  app.get("/api/classes", async (_req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.post("/api/classes", async (req, res) => {
    const result = insertClassSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid class data" });
    }
    const newClass = await storage.createClass(result.data);
    res.json(newClass);
  });

  app.delete("/api/classes/:id", async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.status(204).end();
  });

  // Students
  app.get("/api/students", async (req, res) => {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const students = await storage.getStudents(classId);
    res.json(students);
  });

  app.post("/api/students", async (req, res) => {
    const result = insertStudentSchema.safeParse(req.body);
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
