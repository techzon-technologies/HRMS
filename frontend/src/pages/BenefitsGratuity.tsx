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
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Gift, DollarSign, Users, TrendingUp, Eye, Edit, Trash2, Calculator, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface BenefitRecord {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  yearsOfService: number;
  basicSalary: number;
  gratuityAmount: number;
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

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export default function BenefitsGratuity() {
  const { toast } = useToast();
  const [benefitsData, setBenefitsData] = useState<BenefitRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitRecord | null>(null);
  const [stats, setStats] = useState([
    { label: "Total Liability", value: "AED 0", icon: DollarSign, color: "text-primary" },
    { label: "Eligible Employees", value: "0", icon: Users, color: "text-emerald-600" },
    { label: "Avg. Years of Service", value: "0", icon: TrendingUp, color: "text-amber-600" },
    { label: "Benefits Programs", value: "0", icon: Gift, color: "text-purple-600" },
  ]);
  const [gratuityByService, setGratuityByService] = useState([
    { name: "< 1 year", value: 0 },
    { name: "1-3 years", value: 0 },
    { name: "3-5 years", value: 0 },
    { name: "5+ years", value: 0 },
  ]);
  const [gratuityAmountRange, setGratuityAmountRange] = useState([
    { name: "< AED 10K", value: 0 },
    { name: "AED 10K-50K", value: 0 },
    { name: "AED 50K-100K", value: 0 },
    { name: "> AED 100K", value: 0 },
  ]);
  const [formData, setFormData] = useState({
    employeeId: 0,
    yearsOfService: 0,
    basicSalary: 0,
    gratuityAmount: 0,
    status: "Accruing",
  });

  // Fetch benefits and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [benefitsData, employeesData] = await Promise.all([
          apiService.benefits.getAll(),
          apiService.employees.getAll()
        ]);

        setBenefitsData(benefitsData);
        setEmployees(employeesData);

        // Calculate stats
        const totalLiability = benefitsData.reduce((sum: number, b: BenefitRecord) => sum + b.gratuityAmount, 0);
        const avgYears = benefitsData.length > 0 ? benefitsData.reduce((sum: number, b: BenefitRecord) => sum + b.yearsOfService, 0) / benefitsData.length : 0;

        setStats([
          { label: "Total Liability", value: `AED ${(totalLiability / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-primary" },
          { label: "Eligible Employees", value: benefitsData.length.toString(), icon: Users, color: "text-emerald-600" },
          { label: "Avg. Years of Service", value: avgYears.toFixed(1), icon: TrendingUp, color: "text-amber-600" },
          { label: "Benefits Programs", value: "6", icon: Gift, color: "text-purple-600" },
        ]);

        // Calculate gratuity by service
        const serviceRange = [
          { name: "< 1 year", value: benefitsData.filter((b: BenefitRecord) => b.yearsOfService < 1).length },
          { name: "1-3 years", value: benefitsData.filter((b: BenefitRecord) => b.yearsOfService >= 1 && b.yearsOfService < 3).length },
          { name: "3-5 years", value: benefitsData.filter((b: BenefitRecord) => b.yearsOfService >= 3 && b.yearsOfService < 5).length },
          { name: "5+ years", value: benefitsData.filter((b: BenefitRecord) => b.yearsOfService >= 5).length },
        ];
        setGratuityByService(serviceRange);

        // Calculate gratuity amount range
        const amountRange = [
          { name: "< AED 10K", value: benefitsData.filter((b: BenefitRecord) => b.gratuityAmount < 10000).length },
          { name: "AED 10K-50K", value: benefitsData.filter((b: BenefitRecord) => b.gratuityAmount >= 10000 && b.gratuityAmount < 50000).length },
          { name: "AED 50K-100K", value: benefitsData.filter((b: BenefitRecord) => b.gratuityAmount >= 50000 && b.gratuityAmount < 100000).length },
          { name: "> AED 100K", value: benefitsData.filter((b: BenefitRecord) => b.gratuityAmount >= 100000).length },
        ];
        setGratuityAmountRange(amountRange);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load benefits and employees data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = benefitsData.filter((b) =>
    b.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateGratuity = (years: number, salary: number) => {
    if (years < 1) return 0;
    if (years <= 5) return (salary / 2) * years;
    return (salary / 2) * 5 + salary * (years - 5);
  };

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
      const gratuity = calculateGratuity(formData.yearsOfService, formData.basicSalary);
      const benefitData = {
        employeeId: formData.employeeId,
        yearsOfService: formData.yearsOfService,
        basicSalary: formData.basicSalary,
        gratuityAmount: gratuity,
        status: formData.status,
      };

      const newBenefit = await apiService.benefits.create(benefitData);

      // Find the employee details for the newly created benefit
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (employee) {
        newBenefit.employee = employee;
      }

      setBenefitsData([...benefitsData, newBenefit]);
      setIsAddDialogOpen(false);
      setFormData({ employeeId: 0, yearsOfService: 0, basicSalary: 0, gratuityAmount: 0, status: "Accruing" });

      // Recalculate stats and charts
      const totalLiability = [...benefitsData, newBenefit].reduce((sum, b) => sum + b.gratuityAmount, 0);
      const avgYears = [...benefitsData, newBenefit].length > 0 ? [...benefitsData, newBenefit].reduce((sum, b) => sum + b.yearsOfService, 0) / [...benefitsData, newBenefit].length : 0;

      setStats([
        { label: "Total Liability", value: `AED ${(totalLiability / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-primary" },
        { label: "Eligible Employees", value: [...benefitsData, newBenefit].length.toString(), icon: Users, color: "text-emerald-600" },
        { label: "Avg. Years of Service", value: avgYears.toFixed(1), icon: TrendingUp, color: "text-amber-600" },
        { label: "Benefits Programs", value: "6", icon: Gift, color: "text-purple-600" },
      ]);

      // Recalculate gratuity by service
      const serviceRange = [
        { name: "< 1 year", value: [...benefitsData, newBenefit].filter(b => b.yearsOfService < 1).length },
        { name: "1-3 years", value: [...benefitsData, newBenefit].filter(b => b.yearsOfService >= 1 && b.yearsOfService < 3).length },
        { name: "3-5 years", value: [...benefitsData, newBenefit].filter(b => b.yearsOfService >= 3 && b.yearsOfService < 5).length },
        { name: "5+ years", value: [...benefitsData, newBenefit].filter(b => b.yearsOfService >= 5).length },
      ];
      setGratuityByService(serviceRange);

      // Recalculate gratuity amount range
      const amountRange = [
        { name: "< AED 10K", value: [...benefitsData, newBenefit].filter(b => b.gratuityAmount < 10000).length },
        { name: "AED 10K-50K", value: [...benefitsData, newBenefit].filter(b => b.gratuityAmount >= 10000 && b.gratuityAmount < 50000).length },
        { name: "AED 50K-100K", value: [...benefitsData, newBenefit].filter(b => b.gratuityAmount >= 50000 && b.gratuityAmount < 100000).length },
        { name: "> AED 100K", value: [...benefitsData, newBenefit].filter(b => b.gratuityAmount >= 100000).length },
      ];
      setGratuityAmountRange(amountRange);

      toast({
        title: "Benefit Added",
        description: `Benefit record for ${employee?.firstName} ${employee?.lastName} has been added.`
      });
    } catch (error) {
      console.error('Error creating benefit:', error);
      toast({
        title: "Error",
        description: "Failed to create benefit",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedBenefit) return;

    try {
      const gratuity = calculateGratuity(formData.yearsOfService, formData.basicSalary);
      const benefitData = {
        employeeId: formData.employeeId,
        yearsOfService: formData.yearsOfService,
        basicSalary: formData.basicSalary,
        gratuityAmount: gratuity,
        status: formData.status,
      };

      const updatedBenefit = await apiService.benefits.update(selectedBenefit.id, benefitData);

      // Find the employee details for the updated benefit
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (employee) {
        updatedBenefit.employee = employee;
      }

      setBenefitsData(benefitsData.map((b) => b.id === selectedBenefit.id ? { ...b, ...updatedBenefit } : b));
      setIsEditDialogOpen(false);

      // Recalculate stats and charts
      const updatedBenefits = benefitsData.map((b) => b.id === selectedBenefit.id ? { ...b, ...updatedBenefit } : b);
      const totalLiability = updatedBenefits.reduce((sum, b) => sum + b.gratuityAmount, 0);
      const avgYears = updatedBenefits.length > 0 ? updatedBenefits.reduce((sum, b) => sum + b.yearsOfService, 0) / updatedBenefits.length : 0;

      setStats([
        { label: "Total Liability", value: `AED ${(totalLiability / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-primary" },
        { label: "Eligible Employees", value: updatedBenefits.length.toString(), icon: Users, color: "text-emerald-600" },
        { label: "Avg. Years of Service", value: avgYears.toFixed(1), icon: TrendingUp, color: "text-amber-600" },
        { label: "Benefits Programs", value: "6", icon: Gift, color: "text-purple-600" },
      ]);

      // Recalculate gratuity by service
      const serviceRange = [
        { name: "< 1 year", value: updatedBenefits.filter(b => b.yearsOfService < 1).length },
        { name: "1-3 years", value: updatedBenefits.filter(b => b.yearsOfService >= 1 && b.yearsOfService < 3).length },
        { name: "3-5 years", value: updatedBenefits.filter(b => b.yearsOfService >= 3 && b.yearsOfService < 5).length },
        { name: "5+ years", value: updatedBenefits.filter(b => b.yearsOfService >= 5).length },
      ];
      setGratuityByService(serviceRange);

      // Recalculate gratuity amount range
      const amountRange = [
        { name: "< AED 10K", value: updatedBenefits.filter(b => b.gratuityAmount < 10000).length },
        { name: "AED 10K-50K", value: updatedBenefits.filter(b => b.gratuityAmount >= 10000 && b.gratuityAmount < 50000).length },
        { name: "AED 50K-100K", value: updatedBenefits.filter(b => b.gratuityAmount >= 50000 && b.gratuityAmount < 100000).length },
        { name: "> AED 100K", value: updatedBenefits.filter(b => b.gratuityAmount >= 100000).length },
      ];
      setGratuityAmountRange(amountRange);

      toast({
        title: "Benefit Updated",
        description: "Benefit record has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating benefit:', error);
      toast({
        title: "Error",
        description: "Failed to update benefit",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this benefit record?')) {
      try {
        await apiService.benefits.delete(id);

        const updatedBenefits = benefitsData.filter((b) => b.id !== id);
        setBenefitsData(updatedBenefits);

        // Recalculate stats and charts
        const totalLiability = updatedBenefits.reduce((sum, b) => sum + b.gratuityAmount, 0);
        const avgYears = updatedBenefits.length > 0 ? updatedBenefits.reduce((sum, b) => sum + b.yearsOfService, 0) / updatedBenefits.length : 0;

        setStats([
          { label: "Total Liability", value: `AED ${(totalLiability / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-primary" },
          { label: "Eligible Employees", value: updatedBenefits.length.toString(), icon: Users, color: "text-emerald-600" },
          { label: "Avg. Years of Service", value: avgYears.toFixed(1), icon: TrendingUp, color: "text-amber-600" },
          { label: "Benefits Programs", value: "6", icon: Gift, color: "text-purple-600" },
        ]);

        // Recalculate gratuity by service
        const serviceRange = [
          { name: "< 1 year", value: updatedBenefits.filter(b => b.yearsOfService < 1).length },
          { name: "1-3 years", value: updatedBenefits.filter(b => b.yearsOfService >= 1 && b.yearsOfService < 3).length },
          { name: "3-5 years", value: updatedBenefits.filter(b => b.yearsOfService >= 3 && b.yearsOfService < 5).length },
          { name: "5+ years", value: updatedBenefits.filter(b => b.yearsOfService >= 5).length },
        ];
        setGratuityByService(serviceRange);

        // Recalculate gratuity amount range
        const amountRange = [
          { name: "< AED 10K", value: updatedBenefits.filter(b => b.gratuityAmount < 10000).length },
          { name: "AED 10K-50K", value: updatedBenefits.filter(b => b.gratuityAmount >= 10000 && b.gratuityAmount < 50000).length },
          { name: "AED 50K-100K", value: updatedBenefits.filter(b => b.gratuityAmount >= 50000 && b.gratuityAmount < 100000).length },
          { name: "> AED 100K", value: updatedBenefits.filter(b => b.gratuityAmount >= 100000).length },
        ];
        setGratuityAmountRange(amountRange);

        toast({
          title: "Benefit Deleted",
          description: "Benefit record has been deleted."
        });
      } catch (error) {
        console.error('Error deleting benefit:', error);
        toast({
          title: "Error",
          description: "Failed to delete benefit",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (benefit: BenefitRecord) => {
    setSelectedBenefit(benefit);
    setFormData({
      employeeId: benefit.employeeId,
      yearsOfService: benefit.yearsOfService,
      basicSalary: benefit.basicSalary,
      gratuityAmount: benefit.gratuityAmount,
      status: benefit.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (benefit: BenefitRecord) => {
    setSelectedBenefit(benefit);
    setIsViewDialogOpen(true);
  };

  const openCalculateDialog = (benefit: BenefitRecord) => {
    setSelectedBenefit(benefit);
    setIsCalculateDialogOpen(true);
  };

  return (
    <MainLayout title="Benefits & Gratuity" subtitle="Manage employee benefits and end-of-service gratuity">
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
              <CardTitle className="text-lg">Gratuity by Years of Service</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={gratuityByService}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gratuityByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gratuity Amount Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={gratuityAmountRange}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gratuityAmountRange.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gratuity Calculator</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search employees..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Benefit</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Years of Service</TableHead>
                  <TableHead>Basic Salary (AED)</TableHead>
                  <TableHead>Gratuity Amount (AED)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell className="font-medium">{benefit.employee.firstName} {benefit.employee.lastName}</TableCell>
                    <TableCell>{benefit.yearsOfService} years</TableCell>
                    <TableCell>{benefit.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>{benefit.gratuityAmount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={benefit.status === "Accruing" ? "default" : "secondary"}>{benefit.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openCalculateDialog(benefit)}><Calculator className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(benefit)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(benefit)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(benefit.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>Add Benefit Record</DialogTitle><DialogDescription>Add a new employee benefit record.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Years of Service</Label><Input type="number" value={formData.yearsOfService} onChange={(e) => setFormData({ ...formData, yearsOfService: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Basic Salary (AED)</Label><Input type="number" value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: parseInt(e.target.value) || 0 })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Benefit Record</DialogTitle><DialogDescription>Update the benefit record.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Years of Service</Label><Input type="number" value={formData.yearsOfService} onChange={(e) => setFormData({ ...formData, yearsOfService: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Basic Salary (AED)</Label><Input type="number" value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: parseInt(e.target.value) || 0 })} /></div>
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
          <DialogHeader><DialogTitle>Benefit Details</DialogTitle></DialogHeader>
          {selectedBenefit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedBenefit.employee.firstName} {selectedBenefit.employee.lastName}</p></div>
                <div><Label className="text-muted-foreground">Years of Service</Label><p className="font-medium">{selectedBenefit.yearsOfService} years</p></div>
                <div><Label className="text-muted-foreground">Basic Salary</Label><p className="font-medium">AED {selectedBenefit.basicSalary.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Gratuity Amount</Label><p className="font-medium">AED {selectedBenefit.gratuityAmount.toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedBenefit.status === "Accruing" ? "default" : "secondary"}>{selectedBenefit.status}</Badge></div></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calculate Dialog */}
      <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gratuity Calculation</DialogTitle><DialogDescription>End of service gratuity calculation details.</DialogDescription></DialogHeader>
          {selectedBenefit && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">{selectedBenefit.employee.firstName} {selectedBenefit.employee.lastName}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Basic Salary:</span><span>AED {selectedBenefit.basicSalary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Years of Service:</span><span>{selectedBenefit.yearsOfService} years</span></div>
                  <div className="flex justify-between border-t pt-2 font-semibold"><span>Calculated Gratuity:</span><span>AED {selectedBenefit.gratuityAmount.toLocaleString()}</span></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Formula: First 5 years = 50% of salary per year. After 5 years = 100% of salary per year.</p>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsCalculateDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}