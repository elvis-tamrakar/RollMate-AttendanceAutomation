import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapboxMap } from "@/components/MapboxMap";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Event, Attendance, Class, User } from "@shared/schema";
import { Calendar, Clock, MapPin, GraduationCap, BookOpen } from "lucide-react";
import { ProfileCard } from "@/components/profile-card";

export default function StudentDashboard() {
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: myClass } = useQuery<Class>({
    queryKey: ["/api/classes", currentUser?.classId],
    enabled: !!currentUser?.classId,
  });

  const { data: myAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/my"],
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events", { classId: currentUser?.classId }],
    enabled: !!currentUser?.classId,
  });

  const attendanceStats = {
    present: myAttendance?.filter(a => a.status === "present").length ?? 0,
    late: myAttendance?.filter(a => a.status === "late").length ?? 0,
    absent: myAttendance?.filter(a => a.status === "absent").length ?? 0,
  };

  // Calculate attendance percentage
  const totalDays = (attendanceStats.present + attendanceStats.late + attendanceStats.absent) || 1;
  const attendancePercentage = ((attendanceStats.present + attendanceStats.late) / totalDays) * 100;

  // Prepare data for attendance chart
  const monthlyAttendance = myAttendance?.reduce((acc: any, curr) => {
    const month = format(new Date(curr.date), 'MMM');
    if (!acc[month]) {
      acc[month] = { month, present: 0, late: 0, absent: 0 };
    }
    acc[month][curr.status]++;
    return acc;
  }, {});

  const chartData = Object.values(monthlyAttendance || {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        {currentUser && (
          <div className="w-[300px]">
            <ProfileCard user={currentUser} />
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
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
                  <Tooltip />
                  <Bar dataKey="present" stackId="a" fill="#10B981" name="Present" />
                  <Bar dataKey="late" stackId="a" fill="#F59E0B" name="Late" />
                  <Bar dataKey="absent" stackId="a" fill="#EF4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Your weekly class timetable and upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  ?.filter(e => new Date(e.dueDate) > new Date())
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.dueDate), "PPp")}
                        </p>
                        {event.description && (
                          <p className="mt-1 text-sm">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {event.type === "assignment" ? (
                        <div className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Assignment
                        </div>
                      ) : (
                        <div className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          Event
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Class Location</CardTitle>
              <CardDescription>
                Your class boundary for automatic attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myClass?.geofence ? (
                <div className="space-y-4">
                  <MapboxMap
                    geofence={myClass.geofence}
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground">
                    You must be within this area during class hours to be marked present automatically.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No geofence has been set for your class yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}