import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Login from "@/pages/login";
import TeacherDashboard from "@/pages/teacher/dashboard";
import StudentDashboard from "@/pages/student/dashboard";
import Classes from "@/pages/classes";
import Students from "@/pages/students";
import Attendance from "@/pages/attendance";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/teacher">
        <ProtectedRoute allowedRole="teacher">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <TeacherDashboard />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/student">
        <ProtectedRoute allowedRole="student">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <StudentDashboard />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/classes">
        <ProtectedRoute allowedRole="teacher">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <Classes />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/students">
        <ProtectedRoute allowedRole="teacher">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <Students />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/attendance">
        <ProtectedRoute allowedRole="teacher">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <Attendance />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/insights">
        <ProtectedRoute allowedRole="teacher">
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <Insights />
            </main>
          </div>
        </ProtectedRoute>
      </Route>

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