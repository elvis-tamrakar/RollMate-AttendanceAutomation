import { 
  Class, InsertClass, 
  User, InsertUser,
  Event, InsertEvent,
  Attendance, InsertAttendance
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
  deleteClass(id: number): Promise<void>;

  // Events
  getEvents(classId?: number): Promise<Event[]>;
  createEvent(data: InsertEvent): Promise<Event>;

  // Students
  getStudents(classId?: number): Promise<User[]>;
  getStudent(id: number): Promise<User | undefined>;
  createStudent(data: InsertUser): Promise<User>;
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
  private attendance: Map<number, Attendance>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.events = new Map();
    this.attendance = new Map();
    this.currentIds = { users: 1, classes: 1, events: 1, attendance: 1 };

    // Adding test teacher
    const testTeacher: User = {
      id: this.currentIds.users++,
      name: "John Smith",
      email: "teacher@example.com",
      role: "teacher",
      classId: null,
    };
    this.users.set(testTeacher.id, testTeacher);

    // Create test classes first
    const classes = [
      { name: "10 A", teacherId: testTeacher.id },
      { name: "10 B", teacherId: testTeacher.id },
      { name: "11 A", teacherId: testTeacher.id },
    ].map(cls => {
      const id = this.currentIds.classes++;
      const newClass: Class = {
        id,
        name: cls.name,
        description: `Class ${cls.name}`,
        teacherId: cls.teacherId,
        schedule: [],
        geofence: null
      };
      this.classes.set(id, newClass);
      return newClass;
    });

    // Adding test students
    const students = [
      { name: "Rijan Gurung", email: "student@example.com", classId: classes[0].id },
      { name: "Karunal Dahal", email: "karunal@example.com", classId: classes[0].id },
      { name: "Elvis Tamakar", email: "elvis@example.com", classId: classes[1].id },
      { name: "Suren Rajbanshi", email: "suren@example.com", classId: classes[1].id },
      { name: "Divya", email: "divya@example.com", classId: classes[2].id }
    ];

    // Add students to users map
    students.forEach(student => {
      const id = this.currentIds.users++;
      const newStudent: User = {
        id,
        name: student.name,
        email: student.email,
        role: "student",
        classId: student.classId
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
    const newUser: User = { ...data, id };
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
    const newClass: Class = { ...data, id };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: number, data: Partial<InsertClass>): Promise<Class> {
    const existing = this.classes.get(id);
    if (!existing) throw new Error("Class not found");

    const updated: Class = { ...existing, ...data };
    this.classes.set(id, updated);
    return updated;
  }

  async deleteClass(id: number): Promise<void> {
    this.classes.delete(id);
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
    const newEvent: Event = { ...data, id };
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Students
  async getStudents(classId?: number): Promise<User[]> {
    const students = Array.from(this.users.values()).filter(u => u.role === "student");
    if (classId) {
      return students.filter(s => s.classId === classId);
    }
    return students;
  }

  async getStudent(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    return user?.role === "student" ? user : undefined;
  }

  async createStudent(data: InsertUser): Promise<User> {
    return this.createUser({ ...data, role: "student" });
  }

  async deleteStudent(id: number): Promise<void> {
    this.users.delete(id);
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
    const newAttendance: Attendance = { ...data, id };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: number, data: Partial<InsertAttendance>): Promise<Attendance> {
    const existing = this.attendance.get(id);
    if (!existing) throw new Error("Attendance record not found");

    const updated: Attendance = { ...existing, ...data };
    this.attendance.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();