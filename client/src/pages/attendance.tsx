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
import { Loader2 } from "lucide-react";

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

  const { data: attendance, isLoading: loadingAttendance } = useQuery<Attendance[]>({
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
      note: string;
    }) => {
      if (!selectedClass) throw new Error("No class selected");

      const res = await apiRequest("POST", "/api/attendance", {
        studentId,
        classId: selectedClass,
        date: selectedDate.toISOString(),
        status,
        note,
      });

      if (!res.ok) {
        throw new Error("Failed to mark attendance");
      }

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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
      note: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/attendance/${id}`, {
        status,
        note,
      });

      if (!res.ok) {
        throw new Error("Failed to update attendance");
      }

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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = loadingClasses || loadingStudents || loadingAttendance;
  const isMutating = markAttendance.isPending || updateAttendance.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Class</label>
            <Select
              value={selectedClass?.toString()}
              onValueChange={(value) => setSelectedClass(Number(value))}
              disabled={isLoading || isMutating}
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="border rounded-md"
              disabled={isLoading || isMutating}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div className="border rounded-lg">
            {!selectedClass ? (
              <div className="p-8 text-center text-muted-foreground">
                Please select a class to mark attendance
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading attendance data...</p>
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
                            value={record?.status || "absent"}
                            onValueChange={(newStatus) => {
                              if (record) {
                                updateAttendance.mutate({
                                  id: record.id,
                                  status: newStatus,
                                  note: record.note || "",
                                });
                              } else {
                                markAttendance.mutate({
                                  studentId: student.id,
                                  status: newStatus,
                                  note: "",
                                });
                              }
                            }}
                            disabled={isMutating}
                          >
                            <SelectTrigger className="w-[140px]">
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
                            placeholder="Add note"
                            className="max-w-[200px]"
                            value={record?.note || ""}
                            onChange={(e) => {
                              const newNote = e.target.value;
                              if (record) {
                                updateAttendance.mutate({
                                  id: record.id,
                                  status: record.status,
                                  note: newNote,
                                });
                              } else {
                                markAttendance.mutate({
                                  studentId: student.id,
                                  status: "absent",
                                  note: newNote,
                                });
                              }
                            }}
                            disabled={isMutating}
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
    </div>
  );
}