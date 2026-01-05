import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, X, Clock, Plus } from "lucide-react";
import { apiService } from "@/lib/api";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
}

interface LeaveRequest {
  id: number;
  employeeId: number;
  employee: Employee;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

const LeaveManagement = () => {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState([
    { type: "Annual Leave", used: 0, total: 20, color: "bg-primary" },
    { type: "Sick Leave", used: 0, total: 10, color: "bg-chart-3" },
    { type: "Personal Leave", used: 0, total: 5, color: "bg-chart-4" },
    { type: "Unpaid Leave", used: 0, total: 30, color: "bg-chart-5" },
  ]);

  const [newRequest, setNewRequest] = useState({
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [leavesData, employeesData] = await Promise.all([
        apiService.leaves.getAll(),
        apiService.employees.getAll()
      ]);

      setLeaveRequests(leavesData as unknown as LeaveRequest[]);
      setEmployees(employeesData as unknown as Employee[]);

      // Calculate stats based on approved leaves
      const newStats = stats.map(stat => {
        const used = (leavesData as unknown as LeaveRequest[])
          .filter((l) => l.type === stat.type && l.status === 'approved')
          .reduce((acc, curr) => acc + curr.days, 0);
        return { ...stat, used };
      });
      setStats(newStats);

    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({
        title: "Error",
        description: "Failed to load leave requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: LeaveRequest) => {
    try {
      await apiService.leaves.approve(request.id);
      setLeaveRequests(leaveRequests.map((r) =>
        r.id === request.id ? { ...r, status: "approved" } : r
      ));
      toast({
        title: "Leave Approved",
        description: `Request has been approved.`,
      });
      fetchData(); // Refresh stats
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    try {
      await apiService.leaves.reject(request.id);
      setLeaveRequests(leaveRequests.map((r) =>
        r.id === request.id ? { ...r, status: "rejected" } : r
      ));
      toast({
        title: "Leave Rejected",
        description: `Request has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.employeeId || !newRequest.type || !newRequest.startDate || !newRequest.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(newRequest.startDate);
    const end = new Date(newRequest.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      const payload = {
        employeeId: parseInt(newRequest.employeeId),
        type: newRequest.type,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        days: days,
        reason: newRequest.reason,
      };

      const created = await apiService.leaves.create(payload);
      setLeaveRequests([created as unknown as LeaveRequest, ...leaveRequests]);

      setNewRequest({ employeeId: "", type: "", startDate: "", endDate: "", reason: "" });
      setIsRequestDialogOpen(false);
      toast({
        title: "Leave Request Submitted",
        description: `Request for ${days} day(s) has been submitted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout title="Leave Management" subtitle="Manage time off requests">
      {/* Quick Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        {stats.map((leave) => (
          <Card key={leave.type}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{leave.type}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {leave.total - leave.used} <span className="text-sm font-normal text-muted-foreground">days left</span>
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${leave.color} flex items-center justify-center`}>
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${leave.color}`}
                  style={{ width: `${Math.min((leave.used / leave.total) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {leave.used} of {leave.total} days used
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsRequestDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({leaveRequests.filter(r => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {leaveRequests
            .filter((r) => r.status === "pending")
            .map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(request.employee?.firstName, request.employee?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{request.employee?.firstName} {request.employee?.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{request.employee?.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(request)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Leave Type</p>
                      <p className="font-medium text-foreground">{request.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{request.days} day{request.days > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium text-foreground">{request.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="font-medium text-foreground">{request.endDate}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    <span className="font-medium">Reason:</span> {request.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {leaveRequests
            .filter((r) => r.status === "approved")
            .map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{getInitials(request.employee?.firstName, request.employee?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{request.employee?.firstName} {request.employee?.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{request.employee?.department}</p>
                      </div>
                    </div>
                    {statusBadge(request.status)}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Leave Type</p>
                      <p className="font-medium text-foreground">{request.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{request.days} day{request.days > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium text-foreground">{request.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="font-medium text-foreground">{request.endDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(request.employee?.firstName, request.employee?.lastName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{request.employee?.firstName} {request.employee?.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{request.type} • {request.days} day{request.days > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {statusBadge(request.status)}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{request.startDate}</span>
                  <span>→</span>
                  <span>{request.endDate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Request Leave Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a new leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={newRequest.employeeId}
                onValueChange={(value) => setNewRequest({ ...newRequest, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Leave Type</Label>
              <Select
                value={newRequest.type}
                onValueChange={(value) => setNewRequest({ ...newRequest, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={newRequest.reason}
                onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                placeholder="Briefly describe the reason for leave"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LeaveManagement;
