import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Classes from "@/pages/classes";
import Students from "@/pages/students";
import Attendance from "@/pages/attendance";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/classes" component={Classes} />
          <Route path="/students" component={Students} />
          <Route path="/attendance" component={Attendance} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
