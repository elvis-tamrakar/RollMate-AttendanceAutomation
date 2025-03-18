import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfYear, eachMonthOfInterval } from "date-fns";
import { MapboxMap } from "@/components/MapboxMap";
import { Container, Row, Col } from 'react-bootstrap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Event, Attendance, Class, User } from "@shared/schema";
import { Calendar, Clock, MapPin, GraduationCap, HelpCircle } from "lucide-react";
import { ProfileCard } from "@/components/profile-card";

const SCHEDULE = [
  { day: "Tuesday", time: "6:00 PM - 10:00 PM" },
  { day: "Wednesday", time: "6:00 PM - 10:00 PM" },
  { day: "Thursday", time: "6:00 PM - 10:00 PM" },
  { day: "Friday", time: "6:00 PM - 10:00 PM" },
];

const generateAttendanceData = () => {
  const startDate = startOfYear(new Date(2025, 0, 1));
  const months = eachMonthOfInterval({
    start: startDate,
    end: new Date(2025, 2, 15) // March 15, 2025
  });

  return months.map(month => {
    const total = 16; // 4 days per week * 4 weeks
    const present = Math.floor(total * 0.9); // 90% attendance
    const late = Math.floor(total * 0.05);
    const absent = total - present - late;

    return {
      month: format(month, 'MMM'),
      present,
      late,
      absent
    };
  });
};

export default function StudentDashboard() {
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: myClass } = useQuery<Class>({
    queryKey: ["/api/classes", currentUser?.classId],
    enabled: !!currentUser?.classId,
  });

  const chartData = generateAttendanceData();

  const attendanceStats = {
    present: chartData.reduce((sum, month) => sum + month.present, 0),
    late: chartData.reduce((sum, month) => sum + month.late, 0),
    absent: chartData.reduce((sum, month) => sum + month.absent, 0),
  };

  const totalDays = Object.values(attendanceStats).reduce((a, b) => a + b, 0);
  const attendancePercentage = ((attendanceStats.present + attendanceStats.late) / totalDays) * 100;

  return (
    <TooltipProvider>
      <Container fluid className="space-y-6">
        <Row className="mb-4 align-items-start">
          <Col>
            <h1 className="text-3xl font-bold fade-in-up">Student Dashboard</h1>
          </Col>
          {currentUser && (
            <Col xs="auto">
              <div className="slide-in-right">
                <ProfileCard user={currentUser} />
              </div>
            </Col>
          )}
        </Row>

        <Row className="g-4">
          <Col md={3}>
            <div className="bounce-in">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Attendance Rate
                      </CardTitle>
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {attendancePercentage.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Overall attendance performance
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your overall attendance rate including both present and late attendances</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Col>

          <Col md={3}>
            <div className="bounce-in" style={{ animationDelay: '0.2s' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Present Days
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {attendanceStats.present}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total days present
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of days you were present in class on time</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Col>

          <Col md={3}>
            <div className="bounce-in" style={{ animationDelay: '0.4s' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Late Arrivals
                      </CardTitle>
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {attendanceStats.late}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Days arrived late
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of days you arrived after the class start time</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Col>

          <Col md={3}>
            <div className="bounce-in" style={{ animationDelay: '0.6s' }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Absences
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {attendanceStats.absent}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total days absent
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of days you were marked as absent from class</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Col>
        </Row>

        <Tabs defaultValue="attendance">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CardTitle>Attendance History</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Your monthly attendance patterns. The graph shows present, late, and absent days for each month.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>
                  Your monthly attendance patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="present" stackId="a" fill="#10B981" name="Present" />
                    <Bar dataKey="late" stackId="a" fill="#F59E0B" name="Late" />
                    <Bar dataKey="absent" stackId="a" fill="#EF4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CardTitle>Class Schedule</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Your weekly class schedule. Classes run from Tuesday to Friday, 6:00 PM to 10:00 PM.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>
                  Your weekly class timetable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SCHEDULE.map((item, index) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between p-4 border rounded-lg fade-in-right"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div>
                        <h3 className="font-medium">{item.day}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </TooltipProvider>
  );
}