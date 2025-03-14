import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function ProtectedRoute({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: "student" | "teacher";
}) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user && user.role !== allowedRole) {
      setLocation(`/${user.role}`);
    }
  }, [user, isLoading, setLocation, allowedRole]);

  if (isLoading || !user) {
    return null;
  }

  return <>{children}</>;
}
