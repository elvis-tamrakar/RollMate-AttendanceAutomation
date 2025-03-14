import { 
  Class, InsertClass, 
  Student, InsertStudent,
  Attendance, InsertAttendance,
  User, InsertUser,
  Event, InsertEvent
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;

  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(data: InsertClass): Promise<Class>;
  updateClass(id: number, data: Partial<InsertClass>): Promise<Class>;

  // Events
  getEvents(classId?: number): Promise<Event[]>;
  createEvent(data: InsertEvent): Promise<Event>;

  // Students
  getStudents(classId?: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(data: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Attendance
  getAttendance(classId: number, date: Date): Promise<Attendance[]>;
  getStudentAttendance(studentId: number): Promise<Attendance[]>;
  createAttendance(data: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, data: Partial<InsertAttendance>): Promise<Attendance>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classes: Map<number, Class>;
  private events: Map<number, Event>;
  private students: Map<number, Student>;
  private attendance: Map<number, Attendance>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.events = new Map();
    this.students = new Map();
    this.attendance = new Map();
    this.currentIds = { users: 1, classes: 1, events: 1, students: 1, attendance: 1 };

    // Adding test users
    const testTeacher = {
      id: this.currentIds.users++,
      name: "John Smith",
      email: "teacher@example.com",
      role: "teacher",
      classId: null,
    };
    this.users.set(testTeacher.id, testTeacher);

    // Adding test students
    const students = [
      { name: "Rijan Gurung", email: "rijan@example.com" },
      { name: "Karunal Dahal", email: "karunal@example.com" },
      { name: "Elvis Tamakar", email: "elvis@example.com" },
      { name: "Suren Rajbanshi", email: "suren@example.com" },
      { name: "Divya", email: "divya@example.com" }
    ];

    // Adding test classes
    const classes = [
      { name: "10 A", teacherId: testTeacher.id },
      { name: "10 B", teacherId: testTeacher.id },
      { name: "11 A", teacherId: testTeacher.id },
      { name: "11 B", teacherId: testTeacher.id },
      { name: "12 A", teacherId: testTeacher.id },
      { name: "12 B", teacherId: testTeacher.id }
    ];

    // Create classes
    classes.forEach((cls) => {
      const id = this.currentIds.classes++;
      this.classes.set(id, {
        id,
        name: cls.name,
        description: `Class ${cls.name}`,
        teacherId: cls.teacherId,
        schedule: [],
        geofence: null
      });
    });

    // Distribute students across classes
    const classIds = Array.from(this.classes.values()).map(c => c.id);
    students.forEach((student, index) => {
      const id = this.currentIds.users++;
      const classId = classIds[index % classIds.length];
      const newStudent = {
        id,
        name: student.name,
        email: student.email,
        role: "student",
        classId
      };
      this.users.set(id, newStudent);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(data: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const newUser = { ...data, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Classes
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

  async updateClass(id: number, data: Partial<InsertClass>): Promise<Class> {
    const existing = this.classes.get(id);
    if (!existing) throw new Error("Class not found");

    const updated: Class = { 
      ...existing, 
      ...data,
      description: data.description ?? existing.description 
    };
    this.classes.set(id, updated);
    return updated;
  }

  // Events
  async getEvents(classId?: number): Promise<Event[]> {
    const events = Array.from(this.events.values());
    if (classId) {
      return events.filter(e => e.classId === classId);
    }
    return events;
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    const id = this.currentIds.events++;
    const newEvent: Event = { 
      ...data, 
      id,
      description: data.description ?? null 
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Students
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

  // Attendance
  async getAttendance(classId: number, date: Date): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(a => 
      a.classId === classId && 
      new Date(a.date).toDateString() === date.toDateString()
    );
  }

  async getStudentAttendance(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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