import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, CheckCircle } from "lucide-react";
import type { Class, Student, Attendance } from "@shared/schema";

export default function Dashboard() {
  const { data: classes, isLoading: loadingClasses } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayAttendance, isLoading: loadingAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", { date: today }],
  });

  const stats = [
    {
      title: "Total Classes",
      value: classes?.length ?? 0,
      icon: GraduationCap,
      loading: loadingClasses,
    },
    {
      title: "Total Students",
      value: students?.length ?? 0,
      icon: Users,
      loading: loadingStudents,
    },
    {
      title: "Today's Attendance",
      value: todayAttendance?.filter(a => a.present).length ?? 0,
      icon: CheckCircle,
      loading: loadingAttendance,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
