import { 
  Class, InsertClass, 
  Student, InsertStudent,
  Attendance, InsertAttendance
} from "@shared/schema";

export interface IStorage {
  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(data: InsertClass): Promise<Class>;
  deleteClass(id: number): Promise<void>;

  // Students
  getStudents(classId?: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(data: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Attendance
  getAttendance(classId: number, date: Date): Promise<Attendance[]>;
  createAttendance(data: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, data: Partial<InsertAttendance>): Promise<Attendance>;
}

export class MemStorage implements IStorage {
  private classes: Map<number, Class>;
  private students: Map<number, Student>;
  private attendance: Map<number, Attendance>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.classes = new Map();
    this.students = new Map();
    this.attendance = new Map();
    this.currentIds = { classes: 1, students: 1, attendance: 1 };
  }

  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(data: InsertClass): Promise<Class> {
    const id = this.currentIds.classes++;
    const newClass: Class = { 
      ...data, 
      id,
      description: data.description ?? null 
    };
    this.classes.set(id, newClass);
    return newClass;
  }

  async deleteClass(id: number): Promise<void> {
    this.classes.delete(id);
  }

  async getStudents(classId?: number): Promise<Student[]> {
    const students = Array.from(this.students.values());
    if (classId) {
      return students.filter(s => s.classId === classId);
    }
    return students;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(data: InsertStudent): Promise<Student> {
    const id = this.currentIds.students++;
    const newStudent = { ...data, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    this.students.delete(id);
  }

  async getAttendance(classId: number, date: Date): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(a => 
      a.classId === classId && 
      new Date(a.date).toDateString() === date.toDateString()
    );
  }

  async createAttendance(data: InsertAttendance): Promise<Attendance> {
    const id = this.currentIds.attendance++;
    const newAttendance: Attendance = { 
      ...data, 
      id,
      note: data.note ?? null 
    };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: number, data: Partial<InsertAttendance>): Promise<Attendance> {
    const existing = this.attendance.get(id);
    if (!existing) throw new Error("Attendance record not found");

    const updated: Attendance = { 
      ...existing,
      ...data,
      note: data.note ?? existing.note
    };
    this.attendance.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();