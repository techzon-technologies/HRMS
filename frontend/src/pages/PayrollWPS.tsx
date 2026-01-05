import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search, Upload, Download, Banknote, CheckCircle, Clock, AlertCircle, Eye, Edit, RefreshCw, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface WPSRecord {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  bankName: string;
  accountNo: string;
  salary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export default function PayrollWPS() {
  const { toast } = useToast();
  const [wpsData, setWpsData] = useState<WPSRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<WPSRecord | null>(null);
  const [formData, setFormData] = useState({
    employeeId: 0,
    salary: 0,
    allowances: 0,
    deductions: 0,
    status: "Pending",
  });

  // Fetch WPS data and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wpsData, employeesData] = await Promise.all([
          apiService.payrolls.getAll(),
          apiService.employees.getAll()
        ]);

        setWpsData(wpsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load WPS data and employees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = wpsData.filter((r) =>
    r.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayroll = wpsData.reduce((sum, r) => sum + r.netPay, 0);
  const stats = [
    { label: "Total Payroll", value: `AED ${(totalPayroll / 1000).toFixed(0)}K`, icon: Banknote, color: "text-primary" },
    { label: "Processed", value: wpsData.filter(r => r.status === "Processed").length.toString(), icon: CheckCircle, color: "text-emerald-600" },
    { label: "Pending", value: wpsData.filter(r => r.status === "Pending").length.toString(), icon: Clock, color: "text-amber-600" },
    { label: "Failed", value: wpsData.filter(r => r.status === "Failed").length.toString(), icon: AlertCircle, color: "text-destructive" },
  ];

  // Chart data
  const payrollByDepartment = [
    { name: "Engineering", value: 42000 },
    { name: "Marketing", value: 28000 },
    { name: "Sales", value: 35000 },
    { name: "HR", value: 15000 },
    { name: "Finance", value: 22000 },
  ];

  const payrollByStatus = [
    { name: "Processed", value: wpsData.filter(r => r.status === "Processed").length },
    { name: "Pending", value: wpsData.filter(r => r.status === "Pending").length },
    { name: "Failed", value: wpsData.filter(r => r.status === "Failed").length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  const handleExportWPS = () => {
    toast({ title: "WPS File Export", description: "WPS file is being generated for bank submission." });
  };

  const handleProcessPayroll = async () => {
    try {
      const pendingRecords = wpsData.filter(r => r.status === "Pending");
      const updatePromises = pendingRecords.map(record =>
        apiService.payrolls.update(record.id, { ...record, status: "Processed" })
      );

      await Promise.all(updatePromises);

      const updatedWpsData = wpsData.map((r) =>
        r.status === "Pending" ? { ...r, status: "Processed" } : r
      );

      setWpsData(updatedWpsData);
      toast({ title: "Payroll Processed", description: "All pending payroll entries have been processed." });
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Error",
        description: "Failed to process payroll entries",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async (id: number) => {
    try {
      const updatedRecord = await apiService.payrolls.update(id, { status: "Processed" });

      const updatedWpsData = wpsData.map((r) =>
        r.id === id ? { ...r, status: "Processed" } : r
      );

      setWpsData(updatedWpsData);
      toast({ title: "Payment Retried", description: "Payment has been reprocessed successfully." });
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast({
        title: "Error",
        description: "Failed to retry payment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;

    try {
      const netPay = formData.salary + formData.allowances - formData.deductions;
      const payrollData = {
        employeeId: formData.employeeId,
        salary: formData.salary,
        allowances: formData.allowances,
        deductions: formData.deductions,
        status: formData.status,
        netPay
      };

      const updatedRecord = await apiService.payrolls.update(selectedRecord.id, payrollData);

      // Find the employee details for the updated record
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (employee) {
        updatedRecord.employee = employee;
      }

      setWpsData(wpsData.map((r) => r.id === selectedRecord.id ? { ...r, ...updatedRecord } : r));
      setIsEditDialogOpen(false);
      toast({ title: "Record Updated", description: "WPS record has been updated successfully." });
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "Failed to update WPS record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: WPSRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId,
      salary: record.salary,
      allowances: record.allowances,
      deductions: record.deductions,
      status: record.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: WPSRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Payroll & WPS" subtitle="Wage Protection System management and payroll processing">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleExportWPS}><Download className="mr-2 h-4 w-4" />Export WPS File</Button>
          <Button onClick={handleProcessPayroll}><Upload className="mr-2 h-4 w-4" />Process Payroll</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payroll by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={payrollByDepartment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {payrollByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`AED ${value.toLocaleString()}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payroll by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={payrollByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {payrollByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} records`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>WPS Salary Transfer - December 2024</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search employees..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Salary (AED)</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee.firstName} {record.employee.lastName}</TableCell>
                    <TableCell>{record.bankName}</TableCell>
                    <TableCell>{record.accountNo}</TableCell>
                    <TableCell>{record.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600">+{record.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">-{record.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">{record.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "Processed" ? "default" : record.status === "Pending" ? "secondary" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(record)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(record)}><Edit className="h-4 w-4" /></Button>
                        {record.status === "Failed" && (
                          <Button variant="ghost" size="icon" onClick={() => handleRetry(record.id)}><RefreshCw className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedRecord.employee.firstName} {selectedRecord.employee.lastName}</p></div>
                <div><Label className="text-muted-foreground">Bank</Label><p className="font-medium">{selectedRecord.bankName}</p></div>
                <div><Label className="text-muted-foreground">Account</Label><p className="font-medium">{selectedRecord.accountNo}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedRecord.status === "Processed" ? "default" : selectedRecord.status === "Pending" ? "secondary" : "destructive"}>{selectedRecord.status}</Badge></div></div>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between"><span>Basic Salary:</span><span>AED {selectedRecord.salary.toLocaleString()}</span></div>
                <div className="flex justify-between text-emerald-600"><span>Allowances:</span><span>+AED {selectedRecord.allowances.toLocaleString()}</span></div>
                <div className="flex justify-between text-destructive"><span>Deductions:</span><span>-AED {selectedRecord.deductions.toLocaleString()}</span></div>
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Net Pay:</span><span>AED {selectedRecord.netPay.toLocaleString()}</span></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Payment</DialogTitle><DialogDescription>Update payment details.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Employee</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: parseInt(e.target.value) || 0 })}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>Salary (AED)</Label><Input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Allowances (AED)</Label><Input type="number" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Deductions (AED)</Label><Input type="number" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processed">Processed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}