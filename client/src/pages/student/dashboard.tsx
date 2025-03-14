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
import type { Event, Attendance, Class, User } from "@shared/schema";
import { Calendar, Clock, MapPin } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Events and assignment deadlines for your class
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
      </div>
    </div>
  );
}
