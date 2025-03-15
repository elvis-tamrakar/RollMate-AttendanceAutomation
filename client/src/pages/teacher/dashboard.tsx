import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Class, Event } from "@shared/schema";
import { Clock, MapPin, Users, Calendar, HelpCircle } from "lucide-react";
import { ProfileCard } from "@/components/profile-card";
import type { User } from "@shared/schema";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { toast } = useToast();

  const { data: classes, isLoading: loadingClasses } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const updateGeofence = useMutation({
    mutationFn: async ({ classId, geofence }: { classId: number; geofence: any }) => {
      const res = await apiRequest("PATCH", `/api/classes/${classId}`, {
        geofence,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Geofence updated successfully",
      });
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: { classId: number; title: string; dueDate: Date }) => {
      const res = await apiRequest("POST", "/api/events", {
        ...data,
        type: "event",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
  });

  if (loadingClasses || loadingEvents) {
    return <div>Loading...</div>;
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-start">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold"
          >
            Teacher Dashboard
          </motion.h1>
          {currentUser && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-[300px]"
            >
              <ProfileCard user={currentUser} />
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Classes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes?.length ?? 0}</div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of classes you are currently teaching</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {events?.filter(e => new Date(e.dueDate) > new Date()).length ?? 0}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of upcoming events and activities scheduled for your classes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="relative cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Geofences
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes?.filter(c => c.geofence).length ?? 0}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Number of classes with active geofencing for automatic attendance tracking</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CardTitle>Class Geofencing</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Set up geographic boundaries for your classes. Students within these boundaries during class hours will be automatically marked as present.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                Set up geofence boundaries for automatic attendance tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Class</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedClass?.id ?? ""}
                  onChange={(e) => {
                    const cls = classes?.find(c => c.id === Number(e.target.value));
                    setSelectedClass(cls ?? null);
                  }}
                >
                  <option value="">Select a class</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <MapboxMap
                    geofence={selectedClass.geofence}
                    onGeofenceChange={(geofence) => {
                      updateGeofence.mutate({
                        classId: selectedClass.id,
                        geofence,
                      });
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Draw a polygon on the map to set the geofence boundary.
                    Students must be within this area during class hours to be marked present.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CardTitle>Upcoming Events</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Manage and track upcoming class events, assignments, and important dates. Click 'Add New Event' to create a new event.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                View and manage class events and announcements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button>Add New Event</Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new event or announcement for your class</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      createEvent.mutate({
                        classId: Number(formData.get("classId")),
                        title: formData.get("title") as string,
                        dueDate: new Date(formData.get("dueDate") as string),
                      });
                      form.reset();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="classId">Class</Label>
                      <select
                        id="classId"
                        name="classId"
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select a class</option>
                        {classes?.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" name="title" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Date</Label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="datetime-local"
                        required
                      />
                    </div>

                    <Button type="submit">Create Event</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {events
                  ?.filter(e => new Date(e.dueDate) > new Date())
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.dueDate), "PPp")}
                        </p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}