import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  ClipboardCheck,
  Calendar,
  BookOpen,
} from "lucide-react";
import type { User } from "@shared/schema";

const teacherNavigation = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "Classes", href: "/classes", icon: GraduationCap },
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
];

const studentNavigation = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Schedule", href: "/student/schedule", icon: Calendar },
  { name: "Materials", href: "/student/materials", icon: BookOpen },
];

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const navigation = user?.role === "teacher" ? teacherNavigation : studentNavigation;

  return (
    <div className="flex h-full flex-col bg-sidebar border-r">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          RollMate
        </h1>
      </div>
      <nav className="flex flex-1 flex-col px-6 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}