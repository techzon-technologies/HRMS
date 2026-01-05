import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, Download, Clock, UserCheck, UserX, AlertTriangle, Plus, Edit, Trash2, Eye } from "lucide-react";

interface AttendanceRecord {
  id: number;
  employee: {
    name: string;
    avatar: string;
    initials: string;
    department: string;
  };
  checkIn: string;
  checkOut: string;
  status: "present" | "late" | "absent" | "on_leave";
  workHours: string;
}


interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  initials?: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "present":
      return <Badge variant="default">Present</Badge>;
    case "late":
      return <Badge className="bg-chart-4 text-primary-foreground hover:bg-chart-4/90">Late</Badge>;
    case "absent":
      return <Badge variant="destructive">Absent</Badge>;
    case "on_leave":
      return <Badge variant="secondary">On Leave</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const Attendance = () => {
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceData, employeesData] = await Promise.all([
        apiService.attendance.getAll(),
        apiService.employees.getAll()
      ]);

      const mappedData = attendanceData.map((record: any) => ({
        id: record.id,
        employee: {
          name: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown",
          avatar: "",
          initials: record.employee ? `${record.employee.firstName?.[0]}${record.employee.lastName?.[0]}`.toUpperCase() : "NA",
          department: record.employee?.department || "Unknown",
        },
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        workHours: record.workHours,
      }));
      setAttendanceRecords(mappedData);
      setEmployees(employeesData as unknown as Employee[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load records.",
        variant: "destructive",
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split('T')[0],
    checkIn: "",
    checkOut: "",
    status: "present" as "present" | "late" | "absent" | "on_leave",
  });

  const filteredRecords = attendanceRecords.filter((record) =>
    record.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const attendanceStats = [
    { label: "Present", value: filteredRecords.filter(r => r.status === "present").length, icon: UserCheck, color: "text-primary" },
    { label: "Absent", value: filteredRecords.filter(r => r.status === "absent").length, icon: UserX, color: "text-destructive" },
    { label: "Late", value: filteredRecords.filter(r => r.status === "late").length, icon: AlertTriangle, color: "text-chart-4" },
    { label: "On Leave", value: filteredRecords.filter(r => r.status === "on_leave").length, icon: Clock, color: "text-muted-foreground" },
  ];

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Attendance report is being generated and will download shortly.",
    });
  };

  const handleAddAttendance = async () => {
    try {
      if (!formData.employeeId || !formData.date) {
        toast({
          title: "Validation Error",
          description: "Please select an employee and date.",
          variant: "destructive",
        });
        return;
      }

      await apiService.attendance.create(formData);

      toast({
        title: "Attendance Added",
        description: "Attendance record has been created successfully.",
      });
      setIsAddDialogOpen(false);
      fetchData();
      setFormData({ employeeId: "", date: new Date().toISOString().split('T')[0], checkIn: "", checkOut: "", status: "present" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create attendance record.",
        variant: "destructive",
      });
    }
  };

  const handleEditAttendance = async () => {
    if (!selectedRecord) return;

    try {
      await apiService.attendance.update(selectedRecord.id, {
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        status: formData.status,
      });

      toast({
        title: "Attendance Updated",
        description: "Attendance record has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance record.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    try {
      await apiService.attendance.delete(id);
      toast({
        title: "Attendance Deleted",
        description: "Attendance record has been deleted.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete attendance record.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: "", // Not editable in current flow but kept for type consistency
      date: "",
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Attendance" subtitle="Track employee attendance">
      {/* Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        {attendanceStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Attendance</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={record.employee.avatar} />
                        <AvatarFallback>{record.employee.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{record.employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.employee.department}</TableCell>
                  <TableCell className="text-muted-foreground">{record.checkIn}</TableCell>
                  <TableCell className="text-muted-foreground">{record.checkOut}</TableCell>
                  <TableCell className="text-muted-foreground">{record.workHours}</TableCell>
                  <TableCell>{statusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(record)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttendance(record.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Attendance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendance Record</DialogTitle>
            <DialogDescription>Add a new attendance record for an employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check In</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check Out</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "present" | "late" | "absent" | "on_leave") => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAttendance}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>Update the attendance record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCheckIn">Check In</Label>
                <Input
                  id="editCheckIn"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCheckOut">Check Out</Label>
                <Input
                  id="editCheckOut"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value: "present" | "late" | "absent" | "on_leave") => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAttendance}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Attendance Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedRecord.employee.avatar} />
                  <AvatarFallback className="text-lg">{selectedRecord.employee.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedRecord.employee.name}</h3>
                  <p className="text-muted-foreground">{selectedRecord.employee.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Check In</Label>
                  <p className="font-medium">{selectedRecord.checkIn}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check Out</Label>
                  <p className="font-medium">{selectedRecord.checkOut}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Work Hours</Label>
                  <p className="font-medium">{selectedRecord.workHours}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{statusBadge(selectedRecord.status)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Attendance;
