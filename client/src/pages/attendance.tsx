import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Class, User, Attendance } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const { toast } = useToast();

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
    queryKey: [
      "/api/attendance",
      {
        classId: selectedClass,
        date: selectedDate.toISOString(),
      },
    ],
    enabled: !!selectedClass,
  });

  const markAttendance = useMutation({
    mutationFn: async ({
      studentId,
      status,
      note,
    }: {
      studentId: number;
      status: string;
      note?: string;
    }) => {
      if (!selectedClass) return;

      const res = await apiRequest("POST", "/api/attendance", {
        studentId,
        classId: selectedClass,
        date: selectedDate,
        status,
        note,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "/api/attendance",
          {
            classId: selectedClass,
            date: selectedDate.toISOString(),
          },
        ],
      });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: number;
      status: string;
      note?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/attendance/${id}`, {
        status,
        note,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "/api/attendance",
          {
            classId: selectedClass,
            date: selectedDate.toISOString(),
          },
        ],
      });
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Class</label>
            {loadingClasses ? (
              <Skeleton className="h-10 w-full" />
            ) : (
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
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="border rounded-md"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          {loadingStudents || loadingAttendance ? (
            <div className="p-8">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !selectedClass ? (
            <div className="p-8 text-center text-muted-foreground">
              Please select a class to mark attendance
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => {
                  const record = attendance?.find(
                    (a) => a.studentId === student.id
                  );

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Select
                          value={record?.status ?? "absent"}
                          onValueChange={(status) => {
                            if (record) {
                              updateAttendance.mutate({
                                id: record.id,
                                status,
                                note: record.note ?? undefined,
                              });
                            } else {
                              markAttendance.mutate({
                                studentId: student.id,
                                status,
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="left_early">Left Early</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={record?.note ?? ""}
                          onChange={(e) => {
                            if (record) {
                              updateAttendance.mutate({
                                id: record.id,
                                status: record.status,
                                note: e.target.value,
                              });
                            } else {
                              markAttendance.mutate({
                                studentId: student.id,
                                status: "absent",
                                note: e.target.value,
                              });
                            }
                          }}
                          placeholder="Add note"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(selectedDate, "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}