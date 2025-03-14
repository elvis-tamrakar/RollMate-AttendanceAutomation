import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import Login from "@/pages/login";
import TeacherDashboard from "@/pages/teacher/dashboard";
import StudentDashboard from "@/pages/student/dashboard";
import Classes from "@/pages/classes";
import Students from "@/pages/students";
import Attendance from "@/pages/attendance";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/teacher">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            <TeacherDashboard />
          </main>
        </div>
      </Route>

      <Route path="/student">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            <StudentDashboard />
          </main>
        </div>
      </Route>

      <Route path="/classes" component={Classes} />
      <Route path="/students" component={Students} />
      <Route path="/attendance" component={Attendance} />

      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;