import { User } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";

interface ProfileCardProps {
  user: User;
  className?: string;
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  return (
    <Card className={`fade-in-up ${className}`}>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bounce-in" style={{ animationDelay: '0.2s' }}>
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              <UserCircle className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="slide-in-right" style={{ animationDelay: '0.3s' }}>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 slide-in-right" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Role</span>
            <span className="text-sm capitalize">{user.role}</span>
          </div>
          {user.classId && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Class</span>
              <span className="text-sm">{user.classId}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}