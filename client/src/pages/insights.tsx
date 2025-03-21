import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Container, Row, Col } from 'react-bootstrap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { Class, User, Attendance } from "@shared/schema";

const COLORS = {
  present: "#10B981",
  absent: "#EF4444",
  late: "#F59E0B",
  left_early: "#6366F1",
};

export default function InsightsPage() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const { data: classes, isLoading: loadingClasses } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<User[]>({
    queryKey: ["/api/students", { classId: selectedClass }],
    enabled: !!selectedClass,
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery<
    Attendance[]
  >({
    queryKey: ["/api/attendance", { classId: selectedClass }],
    enabled: !!selectedClass,
  });

  if (loadingClasses || loadingStudents || loadingAttendance) {
    return <div>Loading...</div>;
  }

  // Calculate attendance statistics
  const totalStudents = students?.length ?? 0;
  const todayAttendance = attendance?.filter(
    (a) =>
      new Date(a.date).toDateString() === new Date().toDateString()
  );

  const attendanceStats = {
    present: todayAttendance?.filter((a) => a.status === "present").length ?? 0,
    absent: todayAttendance?.filter((a) => a.status === "absent").length ?? 0,
    late: todayAttendance?.filter((a) => a.status === "late").length ?? 0,
    left_early: todayAttendance?.filter((a) => a.status === "left_early").length ?? 0,
  };

  // Calculate weekly attendance data
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start, end });

  const weeklyData = weekDays.map((day) => {
    const dayAttendance = attendance?.filter(
      (a) => new Date(a.date).toDateString() === day.toDateString()
    );

    return {
      date: format(day, "EEE"),
      present: dayAttendance?.filter((a) => a.status === "present").length ?? 0,
      absent: dayAttendance?.filter((a) => a.status === "absent").length ?? 0,
      late: dayAttendance?.filter((a) => a.status === "late").length ?? 0,
      left_early: dayAttendance?.filter((a) => a.status === "left_early").length ?? 0,
    };
  });

  // Prepare data for pie chart
  const pieData = [
    { name: "Present", value: attendanceStats.present },
    { name: "Absent", value: attendanceStats.absent },
    { name: "Late", value: attendanceStats.late },
    { name: "Left Early", value: attendanceStats.left_early },
  ];

  return (
    <Container fluid className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold fade-in-up">Attendance Insights</h1>

        <div className="w-[200px] slide-in-right">
          <Select
            value={selectedClass?.toString()}
            onValueChange={(value) => setSelectedClass(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedClass ? (
        <div className="space-y-6">
          <Row className="g-4">
            <Col md={3}>
              <div className="bounce-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceStats.present}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((attendanceStats.present / totalStudents) * 100).toFixed(1)}% of class
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Col>

            <Col md={3}>
              <div className="bounce-in" style={{ animationDelay: '0.2s' }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceStats.absent}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((attendanceStats.absent / totalStudents) * 100).toFixed(1)}% of class
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Col>

            <Col md={3}>
              <div className="bounce-in" style={{ animationDelay: '0.4s' }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Late</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {attendanceStats.late}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((attendanceStats.late / totalStudents) * 100).toFixed(1)}% of class
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Col>

            <Col md={3}>
              <div className="bounce-in" style={{ animationDelay: '0.6s' }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Left Early</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {attendanceStats.left_early}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((attendanceStats.left_early / totalStudents) * 100).toFixed(1)}% of class
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={6}>
              <div className="fade-in-up" style={{ animationDelay: '0.8s' }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Attendance Trends</CardTitle>
                    <CardDescription>
                      Track attendance patterns throughout the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="present"
                            stroke={COLORS.present}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="absent"
                            stroke={COLORS.absent}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="late"
                            stroke={COLORS.late}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="left_early"
                            stroke={COLORS.left_early}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Col>

            <Col md={6}>
              <div className="fade-in-up" style={{ animationDelay: '1s' }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Attendance Distribution</CardTitle>
                    <CardDescription>
                      Overview of today's attendance status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name.toLowerCase().replace(" ", "_") as keyof typeof COLORS]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Col>
          </Row>

          <div className="slide-in-right" style={{ animationDelay: '1.2s' }}>
            <Card>
              <CardHeader>
                <CardTitle>Individual Student Patterns</CardTitle>
                <CardDescription>
                  Detailed view of each student's attendance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students?.map((student, index) => {
                    const studentAttendance = attendance?.filter(
                      (a) => a.studentId === student.id
                    );

                    const totalDays = studentAttendance?.length ?? 0;
                    const presentDays = studentAttendance?.filter(
                      (a) => a.status === "present"
                    ).length ?? 0;
                    const attendanceRate = totalDays ? (presentDays / totalDays) * 100 : 0;

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg fade-in-right"
                        style={{ animationDelay: `${1.4 + index * 0.1}s` }}
                      >
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Present: {presentDays} out of {totalDays} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {attendanceRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Attendance Rate
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bounce-in">
          Please select a class to view attendance insights
        </div>
      )}
    </Container>
  );
}