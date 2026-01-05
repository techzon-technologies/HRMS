import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaveRequestsProps {
  requests: any[];
}

export function LeaveRequests({ requests }: LeaveRequestsProps) {
  const pendingRequests = requests
    .filter((r: any) => r.status === 'pending')
    .slice(0, 5);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Pending Leave Requests</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link to="/leave-management">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No pending leave requests.</p>
        ) : (
          pendingRequests.map((request: any) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" /> {/* Avatar URL not in basic leave request, could be enriched */}
                  <AvatarFallback>{getInitials(request.employee?.firstName, request.employee?.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{request.employee?.firstName} {request.employee?.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.type} • {request.days} day{request.days > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Actions are view-only here, lead to full page */}
                <span className="text-xs text-muted-foreground self-center">{request.startDate}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
