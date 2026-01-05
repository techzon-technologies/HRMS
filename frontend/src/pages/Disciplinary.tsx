import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, AlertOctagon, FileWarning, CheckCircle, Clock, Eye, Edit, Trash2, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface DisciplinaryRecord {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  type: string;
  reason: string;
  date: string;
  issuedBy: string; // Display name
  issuedById?: number; // ID for editing
  issuer?: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
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

export default function Disciplinary() {
  const { toast } = useToast();
  const [disciplinaryData, setDisciplinaryData] = useState<DisciplinaryRecord[]>([]);
  const disciplinaryDataRef = useRef<DisciplinaryRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [formData, setFormData] = useState({
    employeeId: 0,
    type: "Verbal Warning",
    reason: "",
    date: "",
    issuedBy: 0, // Changed to ID
    status: "Active",
  });

  // Fetch disciplinary data and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disciplinaryResponse, employeesResponse] = await Promise.all([
          apiService.disciplinary.getAll(),
          apiService.employees.getAll()
        ]);

        const disciplinaryData = Array.isArray(disciplinaryResponse) ? disciplinaryResponse : [];
        const employeesData = Array.isArray(employeesResponse) ? employeesResponse : [];

        setDisciplinaryData(disciplinaryData);
        disciplinaryDataRef.current = disciplinaryData;
        setEmployees(employeesData as Employee[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load disciplinary data and employees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = disciplinaryData.filter((d) =>
    d.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Cases", value: disciplinaryData.length.toString(), icon: AlertOctagon, color: "text-primary" },
    { label: "Active", value: disciplinaryData.filter(d => d.status === "Active").length.toString(), icon: FileWarning, color: "text-amber-600" },
    { label: "Under Review", value: disciplinaryData.filter(d => d.status === "Under Review").length.toString(), icon: Clock, color: "text-blue-600" },
    { label: "Resolved", value: disciplinaryData.filter(d => d.status === "Resolved").length.toString(), icon: CheckCircle, color: "text-emerald-600" },
  ];

  // Chart data
  const casesByType = [
    { name: "Verbal Warning", value: disciplinaryData.filter(d => d.type === "Verbal Warning").length },
    { name: "Written Warning", value: disciplinaryData.filter(d => d.type === "Written Warning").length },
    { name: "Final Warning", value: disciplinaryData.filter(d => d.type === "Final Warning").length },
    { name: "Suspension", value: disciplinaryData.filter(d => d.type === "Suspension").length },
  ];

  const casesByStatus = [
    { name: "Active", value: disciplinaryData.filter(d => d.status === "Active").length },
    { name: "Under Review", value: disciplinaryData.filter(d => d.status === "Under Review").length },
    { name: "Resolved", value: disciplinaryData.filter(d => d.status === "Resolved").length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  const handleAdd = async () => {
    if (!formData.employeeId) {
      toast({
        title: "Validation Error",
        description: "Please select an employee.",
        variant: "destructive",
      });
      return;
    }

    try {
      const disciplinaryData = {
        employeeId: formData.employeeId,
        type: formData.type,
        reason: formData.reason,
        date: formData.date,
        issuedBy: formData.issuedBy,
        status: formData.status,
      };

      const newRecord: any = await apiService.disciplinary.create(disciplinaryData);

      // Find the employee details for the newly created record
      const employee = employees.find(emp => emp.id === formData.employeeId);
      const issuer = employees.find(emp => emp.id === formData.issuedBy);

      const recordWithEmployee: DisciplinaryRecord = {
        id: newRecord.id || 0,
        employeeId: newRecord.employeeId || 0,
        employee: employee || { id: 0, firstName: '', lastName: '', employeeId: '' },
        type: newRecord.type || '',
        reason: newRecord.reason || '',
        date: newRecord.date || '',
        issuedBy: issuer ? `${issuer.firstName} ${issuer.lastName}` : (newRecord.issuedBy || ''),
        issuedById: formData.issuedBy,
        issuer: issuer,
        status: newRecord.status || '',
        createdAt: newRecord.createdAt || '',
        updatedAt: newRecord.updatedAt || ''
      };

      const currentData = [...disciplinaryDataRef.current];
      const updatedData: DisciplinaryRecord[] = [...currentData, recordWithEmployee];
      setDisciplinaryData(updatedData);
      setIsAddDialogOpen(false);
      setFormData({ employeeId: 0, type: "Verbal Warning", reason: "", date: "", issuedBy: 0, status: "Active" });
      toast({ title: "Case Created", description: `Disciplinary case has been created.` });
    } catch (error) {
      console.error('Error creating disciplinary record:', error);
      toast({
        title: "Error",
        description: "Failed to create disciplinary case",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;

    try {
      const disciplinaryData = {
        employeeId: formData.employeeId,
        type: formData.type,
        reason: formData.reason,
        date: formData.date,
        issuedBy: formData.issuedBy,
        status: formData.status,
      };

      const updatedRecord: any = await apiService.disciplinary.update(selectedRecord.id, disciplinaryData);

      // Find the employee details for the updated record
      const employee = employees.find(emp => emp.id === formData.employeeId);
      const issuer = employees.find(emp => emp.id === formData.issuedBy);

      const recordWithEmployee: DisciplinaryRecord = {
        id: updatedRecord.id || 0,
        employeeId: updatedRecord.employeeId || 0,
        employee: employee || { id: 0, firstName: '', lastName: '', employeeId: '' },
        type: updatedRecord.type || '',
        reason: updatedRecord.reason || '',
        date: updatedRecord.date || '',
        issuedBy: issuer ? `${issuer.firstName} ${issuer.lastName}` : (updatedRecord.issuedBy || ''),
        issuedById: formData.issuedBy,
        issuer: issuer,
        status: updatedRecord.status || '',
        createdAt: updatedRecord.createdAt || '',
        updatedAt: updatedRecord.updatedAt || ''
      };

      const currentData = [...disciplinaryDataRef.current];
      const updatedData: DisciplinaryRecord[] = currentData.map((d) => d.id === selectedRecord.id ? recordWithEmployee : d);
      setDisciplinaryData(updatedData);
      setIsEditDialogOpen(false);
      toast({ title: "Case Updated", description: "Disciplinary case has been updated successfully." });
    } catch (error) {
      console.error('Error updating disciplinary record:', error);
      toast({
        title: "Error",
        description: "Failed to update disciplinary case",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this disciplinary case?')) {
      try {
        await apiService.disciplinary.delete(id);

        const updatedData = disciplinaryData.filter((d) => d.id !== id);
        setDisciplinaryData(updatedData);
        toast({ title: "Case Deleted", description: "Disciplinary case has been deleted." });
      } catch (error) {
        console.error('Error deleting disciplinary record:', error);
        toast({
          title: "Error",
          description: "Failed to delete disciplinary case",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (record: DisciplinaryRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId,
      type: record.type,
      reason: record.reason,
      date: record.date,
      issuedBy: record.issuedById || (record.issuer ? record.issuer.id : 0),
      status: record.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: DisciplinaryRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Disciplinary Management" subtitle="Track and manage employee disciplinary actions">
      <div className="space-y-6">
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
              <CardTitle className="text-lg">Cases by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={casesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {casesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cases by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={casesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {casesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Disciplinary Records</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search cases..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Case</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee.firstName} {record.employee.lastName}</TableCell>
                    <TableCell><Badge variant="outline">{record.type}</Badge></TableCell>
                    <TableCell>{record.reason}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.issuedBy}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "Resolved" ? "default" : record.status === "Under Review" ? "secondary" : "destructive"}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(record)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(record)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Disciplinary Case</DialogTitle><DialogDescription>Create a new disciplinary case.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Employee Name</Label>
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
            <div className="space-y-2"><Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                  <SelectItem value="Written Warning">Written Warning</SelectItem>
                  <SelectItem value="Final Warning">Final Warning</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Reason</Label><Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Issued By</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                  value={formData.issuedBy}
                  onChange={(e) => setFormData({ ...formData, issuedBy: parseInt(e.target.value) || 0 })}
                >
                  <option value="">Select issuer</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Disciplinary Case</DialogTitle><DialogDescription>Update the disciplinary case.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Employee Name</Label>
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
            <div className="space-y-2"><Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verbal Warning">Verbal Warning</SelectItem>
                  <SelectItem value="Written Warning">Written Warning</SelectItem>
                  <SelectItem value="Final Warning">Final Warning</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Reason</Label><Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Issued By</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                  value={formData.issuedBy}
                  onChange={(e) => setFormData({ ...formData, issuedBy: parseInt(e.target.value) || 0 })}
                >
                  <option value="">Select issuer</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Case Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedRecord.employee.firstName} {selectedRecord.employee.lastName}</p></div>
                <div><Label className="text-muted-foreground">Type</Label><div className="mt-1"><Badge variant="outline">{selectedRecord.type}</Badge></div></div>
                <div><Label className="text-muted-foreground">Date</Label><p className="font-medium">{selectedRecord.date}</p></div>
                <div><Label className="text-muted-foreground">Issued By</Label><p className="font-medium">{selectedRecord.issuedBy}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedRecord.status === "Resolved" ? "default" : selectedRecord.status === "Under Review" ? "secondary" : "destructive"}>{selectedRecord.status}</Badge></div></div>
              </div>
              <div><Label className="text-muted-foreground">Reason</Label><p className="font-medium">{selectedRecord.reason}</p></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}