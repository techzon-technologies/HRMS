import { useState, useEffect, useRef } from "react";
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
import { Search, Plus, Heart, Users, Shield, AlertTriangle, Eye, Edit, Trash2, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface InsuranceRecord {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  policyNo: string;
  provider: string;
  plan: string;
  dependents: number;
  premium: number;
  expiryDate: string;
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

export default function HealthInsurance() {
  const { toast } = useToast();
  const [insuranceData, setInsuranceData] = useState<InsuranceRecord[]>([]);
  const insuranceDataRef = useRef<InsuranceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<InsuranceRecord | null>(null);
  const [formData, setFormData] = useState({
    employeeId: 0,
    policyNo: "",
    provider: "",
    plan: "Basic",
    dependents: 0,
    premium: 0,
    expiryDate: "",
    status: "Active",
  });

  // Fetch insurance data and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insuranceResponse, employeesResponse] = await Promise.all([
          apiService.healthInsurance.getAll(),
          apiService.employees.getAll()
        ]);
        
        const insuranceData: InsuranceRecord[] = Array.isArray(insuranceResponse) ? insuranceResponse : [];
        const employeesData: Employee[] = Array.isArray(employeesResponse) ? employeesResponse : [];
        
        setInsuranceData(insuranceData);
        insuranceDataRef.current = insuranceData;
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load insurance data and employees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = insuranceData.filter((i) =>
    i.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.policyNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Insured", value: insuranceData.length.toString(), icon: Heart, color: "text-primary" },
    { label: "With Dependents", value: insuranceData.filter(i => i.dependents > 0).length.toString(), icon: Users, color: "text-emerald-600" },
    { label: "Active Policies", value: insuranceData.filter(i => i.status === "Active").length.toString(), icon: Shield, color: "text-blue-600" },
    { label: "Expiring Soon", value: insuranceData.filter(i => i.status === "Expiring").length.toString(), icon: AlertTriangle, color: "text-amber-600" },
  ];

  // Chart data
  const policiesByProvider = [
    { name: "Daman", value: insuranceData.filter(i => i.provider === "Daman").length },
    { name: "Oman Insurance", value: insuranceData.filter(i => i.provider === "Oman Insurance").length },
    { name: "AXA", value: insuranceData.filter(i => i.provider === "AXA").length },
    { name: "MetLife", value: insuranceData.filter(i => i.provider === "MetLife").length },
  ];

  const policiesByPlan = [
    { name: "Basic", value: insuranceData.filter(i => i.plan === "Basic").length },
    { name: "Enhanced", value: insuranceData.filter(i => i.plan === "Enhanced").length },
    { name: "Enhanced Plus", value: insuranceData.filter(i => i.plan === "Enhanced Plus").length },
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
      const insuranceData = {
        employeeId: formData.employeeId,
        policyNo: formData.policyNo,
        provider: formData.provider,
        plan: formData.plan,
        dependents: formData.dependents,
        premium: formData.premium,
        expiryDate: formData.expiryDate,
        status: formData.status,
      };

      const newRecord: any = await apiService.healthInsurance.create(insuranceData);
      
      // Find the employee details for the newly created record
      const employee = employees.find(emp => emp.id === formData.employeeId);
      
      const recordWithEmployee: InsuranceRecord = {
        id: newRecord.id || 0,
        employeeId: newRecord.employeeId || 0,
        employee: employee || { id: 0, firstName: '', lastName: '', employeeId: '' },
        policyNo: newRecord.policyNo || '',
        provider: newRecord.provider || '',
        plan: newRecord.plan || '',
        dependents: newRecord.dependents || 0,
        premium: newRecord.premium || 0,
        expiryDate: newRecord.expiryDate || '',
        status: newRecord.status || '',
        createdAt: newRecord.createdAt || '',
        updatedAt: newRecord.updatedAt || ''
      };
      
      const currentData = [...insuranceDataRef.current];
      const updatedData: InsuranceRecord[] = [...currentData, recordWithEmployee];
      setInsuranceData(updatedData);
      setIsAddDialogOpen(false);
      setFormData({ employeeId: 0, policyNo: "", provider: "", plan: "Basic", dependents: 0, premium: 0, expiryDate: "", status: "Active" });
      toast({ title: "Policy Added", description: `Insurance policy has been added.` });
    } catch (error) {
      console.error('Error creating insurance record:', error);
      toast({
        title: "Error",
        description: "Failed to create insurance policy",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;
    
    try {
      const insuranceData = {
        employeeId: formData.employeeId,
        policyNo: formData.policyNo,
        provider: formData.provider,
        plan: formData.plan,
        dependents: formData.dependents,
        premium: formData.premium,
        expiryDate: formData.expiryDate,
        status: formData.status,
      };

      const updatedRecord: any = await apiService.healthInsurance.update(selectedRecord.id, insuranceData);
      
      // Find the employee details for the updated record
      const employee = employees.find(emp => emp.id === formData.employeeId);
      
      const recordWithEmployee: InsuranceRecord = {
        id: updatedRecord.id || 0,
        employeeId: updatedRecord.employeeId || 0,
        employee: employee || { id: 0, firstName: '', lastName: '', employeeId: '' },
        policyNo: updatedRecord.policyNo || '',
        provider: updatedRecord.provider || '',
        plan: updatedRecord.plan || '',
        dependents: updatedRecord.dependents || 0,
        premium: updatedRecord.premium || 0,
        expiryDate: updatedRecord.expiryDate || '',
        status: updatedRecord.status || '',
        createdAt: updatedRecord.createdAt || '',
        updatedAt: updatedRecord.updatedAt || ''
      };
      
      const currentData = [...insuranceDataRef.current];
      const updatedData: InsuranceRecord[] = currentData.map((i) => i.id === selectedRecord.id ? recordWithEmployee : i);
      setInsuranceData(updatedData);
      setIsEditDialogOpen(false);
      toast({ title: "Policy Updated", description: "Insurance policy has been updated successfully." });
    } catch (error) {
      console.error('Error updating insurance record:', error);
      toast({
        title: "Error",
        description: "Failed to update insurance policy",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this insurance policy?')) {
      try {
        await apiService.healthInsurance.delete(id);
        
        const updatedData = insuranceData.filter((i) => i.id !== id);
        setInsuranceData(updatedData);
        insuranceDataRef.current = updatedData;
        toast({ title: "Policy Deleted", description: "Insurance policy has been deleted." });
      } catch (error) {
        console.error('Error deleting insurance record:', error);
        toast({
          title: "Error",
          description: "Failed to delete insurance policy",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (record: InsuranceRecord) => {
    setSelectedRecord(record);
    setFormData({ 
      employeeId: record.employeeId, 
      policyNo: record.policyNo, 
      provider: record.provider, 
      plan: record.plan, 
      dependents: record.dependents, 
      premium: record.premium, 
      expiryDate: record.expiryDate, 
      status: record.status 
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: InsuranceRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Health Insurance" subtitle="Manage employee health insurance policies and dependents">
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
              <CardTitle className="text-lg">Policies by Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={policiesByProvider}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {policiesByProvider.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} policies`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policies by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={policiesByPlan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {policiesByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} policies`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Insurance Policies</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search policies..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Policy</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Policy No</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Dependents</TableHead>
                  <TableHead>Premium (AED)</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.employee.firstName} {policy.employee.lastName}</TableCell>
                    <TableCell>{policy.policyNo}</TableCell>
                    <TableCell>{policy.provider}</TableCell>
                    <TableCell>{policy.plan}</TableCell>
                    <TableCell>{policy.dependents}</TableCell>
                    <TableCell>{policy.premium.toLocaleString()}</TableCell>
                    <TableCell>{policy.expiryDate}</TableCell>
                    <TableCell>
                      <Badge variant={policy.status === "Active" ? "default" : policy.status === "Expiring" ? "secondary" : "destructive"}>{policy.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(policy)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(policy)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>Add Insurance Policy</DialogTitle><DialogDescription>Add a new insurance policy.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2"><Label>Policy Number</Label><Input value={formData.policyNo} onChange={(e) => setFormData({ ...formData, policyNo: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Provider</Label><Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} /></div>
              <div className="space-y-2"><Label>Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Enhanced">Enhanced</SelectItem>
                    <SelectItem value="Enhanced Plus">Enhanced Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Dependents</Label><Input type="number" value={formData.dependents} onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Premium (AED)</Label><Input type="number" value={formData.premium} onChange={(e) => setFormData({ ...formData, premium: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Insurance Policy</DialogTitle><DialogDescription>Update insurance policy details.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2"><Label>Policy Number</Label><Input value={formData.policyNo} onChange={(e) => setFormData({ ...formData, policyNo: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Provider</Label><Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} /></div>
              <div className="space-y-2"><Label>Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Enhanced">Enhanced</SelectItem>
                    <SelectItem value="Enhanced Plus">Enhanced Plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expiring">Expiring</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
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
          <DialogHeader><DialogTitle>Policy Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedRecord.employee.firstName} {selectedRecord.employee.lastName}</p></div>
                <div><Label className="text-muted-foreground">Policy No</Label><p className="font-medium">{selectedRecord.policyNo}</p></div>
                <div><Label className="text-muted-foreground">Provider</Label><p className="font-medium">{selectedRecord.provider}</p></div>
                <div><Label className="text-muted-foreground">Plan</Label><p className="font-medium">{selectedRecord.plan}</p></div>
                <div><Label className="text-muted-foreground">Dependents</Label><p className="font-medium">{selectedRecord.dependents}</p></div>
                <div><Label className="text-muted-foreground">Premium</Label><p className="font-medium">AED {selectedRecord.premium.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Expiry Date</Label><p className="font-medium">{selectedRecord.expiryDate}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedRecord.status === "Active" ? "default" : selectedRecord.status === "Expiring" ? "secondary" : "destructive"}>{selectedRecord.status}</Badge></div></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}