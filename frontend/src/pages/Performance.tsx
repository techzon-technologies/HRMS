import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Search, Plus, TrendingUp, Star, Target, Award, Eye, Edit, Trash2, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface PerformanceRecord {
  id: number;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  department: string;
  reviewPeriod: string;
  rating: number;
  goals: number;
  completed: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PerformanceEmployee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
}

export default function Performance() {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState<PerformanceRecord[]>([]);
  const performanceDataRef = useRef<PerformanceRecord[]>([]);
  const [employees, setEmployees] = useState<PerformanceEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PerformanceRecord | null>(null);
  const [formData, setFormData] = useState({
    employeeId: 0,
    department: "",
    reviewPeriod: "Q4 2024",
    rating: 0,
    goals: 0,
    completed: 0,
    status: "Pending",
  });

  // Fetch performance data and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [performanceResponse, employeesResponse] = await Promise.all([
          apiService.performance.getAll(),
          apiService.employees.getAll()
        ]);

        const performanceData: PerformanceRecord[] = Array.isArray(performanceResponse) ? performanceResponse : [];
        const employeesData: PerformanceEmployee[] = Array.isArray(employeesResponse) ? employeesResponse.map((emp: any) => ({ ...emp, department: emp.department || '' })) : [];

        setPerformanceData(performanceData);
        performanceDataRef.current = performanceData;
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load performance data and employees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = performanceData.filter((p) =>
    p.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedReviews = performanceData.filter(p => p.status === "Completed");
  const avgRating = completedReviews.length > 0 ? (completedReviews.reduce((sum, p) => sum + p.rating, 0) / completedReviews.length).toFixed(1) : "0";
  const stats = [
    { label: "Avg Performance", value: avgRating, icon: TrendingUp, color: "text-primary" },
    { label: "Reviews Completed", value: completedReviews.length.toString(), icon: Star, color: "text-amber-500" },
    { label: "Goals Set", value: performanceData.reduce((sum, p) => sum + p.goals, 0).toString(), icon: Target, color: "text-blue-600" },
    { label: "Top Performers", value: performanceData.filter(p => p.rating >= 4.5).length.toString(), icon: Award, color: "text-emerald-600" },
  ];

  // Chart data
  const performanceByDepartment: { name: string; rating: number }[] = [];

  const performanceByStatus = [
    { name: "Completed", value: performanceData.filter(p => p.status === "Completed").length },
    { name: "In Progress", value: performanceData.filter(p => p.status === "In Progress").length },
    { name: "Pending", value: performanceData.filter(p => p.status === "Pending").length },
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
      const performanceData = {
        employeeId: formData.employeeId,
        department: formData.department,
        reviewPeriod: formData.reviewPeriod,
        rating: formData.rating,
        goals: formData.goals,
        completed: formData.completed,
        status: formData.status,
      };

      const newRecord: any = await apiService.performance.create(performanceData);

      // Find the employee details for the newly created record
      const employee = employees.find(emp => emp.id === formData.employeeId);

      const recordWithEmployee: PerformanceRecord = {
        id: newRecord.id || 0,
        employeeId: newRecord.employeeId || 0,
        employee: employee ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, employeeId: employee.employeeId } : { id: 0, firstName: '', lastName: '', employeeId: '' },
        department: newRecord.department || '',
        reviewPeriod: newRecord.reviewPeriod || '',
        rating: newRecord.rating || 0,
        goals: newRecord.goals || 0,
        completed: newRecord.completed || 0,
        status: newRecord.status || '',
        createdAt: newRecord.createdAt || '',
        updatedAt: newRecord.updatedAt || ''
      };

      const currentData = [...performanceDataRef.current];
      const updatedData: PerformanceRecord[] = [...currentData, recordWithEmployee];
      setPerformanceData(updatedData);
      setIsAddDialogOpen(false);
      setFormData({ employeeId: 0, department: "", reviewPeriod: "Q4 2024", rating: 0, goals: 0, completed: 0, status: "Pending" });
      toast({ title: "Review Created", description: `Performance review has been created.` });
    } catch (error) {
      console.error('Error creating performance record:', error);
      toast({
        title: "Error",
        description: "Failed to create performance review",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;

    try {
      const performanceData = {
        employeeId: formData.employeeId,
        department: formData.department,
        reviewPeriod: formData.reviewPeriod,
        rating: formData.rating,
        goals: formData.goals,
        completed: formData.completed,
        status: formData.status,
      };

      const updatedRecord: any = await apiService.performance.update(selectedRecord.id, performanceData);

      // Find the employee details for the updated record
      const employee = employees.find(emp => emp.id === formData.employeeId);

      const recordWithEmployee: PerformanceRecord = {
        id: updatedRecord.id || 0,
        employeeId: updatedRecord.employeeId || 0,
        employee: employee ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, employeeId: employee.employeeId } : { id: 0, firstName: '', lastName: '', employeeId: '' },
        department: updatedRecord.department || '',
        reviewPeriod: updatedRecord.reviewPeriod || '',
        rating: updatedRecord.rating || 0,
        goals: updatedRecord.goals || 0,
        completed: updatedRecord.completed || 0,
        status: updatedRecord.status || '',
        createdAt: updatedRecord.createdAt || '',
        updatedAt: updatedRecord.updatedAt || ''
      };

      const currentData = [...performanceDataRef.current];
      const updatedData: PerformanceRecord[] = currentData.map((p) => p.id === selectedRecord.id ? recordWithEmployee : p);
      setPerformanceData(updatedData);
      setIsEditDialogOpen(false);
      toast({ title: "Review Updated", description: "Performance review has been updated successfully." });
    } catch (error) {
      console.error('Error updating performance record:', error);
      toast({
        title: "Error",
        description: "Failed to update performance review",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this performance review?')) {
      try {
        await apiService.performance.delete(id);

        const updatedData = performanceData.filter((p) => p.id !== id);
        setPerformanceData(updatedData);
        performanceDataRef.current = updatedData;
        toast({ title: "Review Deleted", description: "Performance review has been deleted." });
      } catch (error) {
        console.error('Error deleting performance record:', error);
        toast({
          title: "Error",
          description: "Failed to delete performance review",
          variant: "destructive",
        });
      }
    }
  };

  const handleCompleteReview = async () => {
    if (!selectedRecord) return;

    try {
      const performanceData = {
        employeeId: formData.employeeId,
        department: formData.department,
        reviewPeriod: formData.reviewPeriod,
        rating: formData.rating,
        goals: formData.goals,
        completed: formData.completed,
        status: "Completed",
      };

      const updatedRecord: any = await apiService.performance.update(selectedRecord.id, performanceData);

      // Find the employee details for the updated record
      const employee = employees.find(emp => emp.id === formData.employeeId);

      const recordWithEmployee: PerformanceRecord = {
        id: updatedRecord.id || 0,
        employeeId: updatedRecord.employeeId || 0,
        employee: employee ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, employeeId: employee.employeeId } : { id: 0, firstName: '', lastName: '', employeeId: '' },
        department: updatedRecord.department || '',
        reviewPeriod: updatedRecord.reviewPeriod || '',
        rating: updatedRecord.rating || 0,
        goals: updatedRecord.goals || 0,
        completed: updatedRecord.completed || 0,
        status: updatedRecord.status || '',
        createdAt: updatedRecord.createdAt || '',
        updatedAt: updatedRecord.updatedAt || ''
      };

      const currentData = [...performanceDataRef.current];
      const updatedData: PerformanceRecord[] = currentData.map((p) => p.id === selectedRecord.id ? recordWithEmployee : p);
      setPerformanceData(updatedData);
      setIsReviewDialogOpen(false);
      toast({ title: "Review Completed", description: `Performance review has been completed.` });
    } catch (error) {
      console.error('Error completing performance review:', error);
      toast({
        title: "Error",
        description: "Failed to complete performance review",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: PerformanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId,
      department: record.department,
      reviewPeriod: record.reviewPeriod,
      rating: record.rating,
      goals: record.goals,
      completed: record.completed,
      status: record.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (record: PerformanceRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const openReviewDialog = (record: PerformanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employeeId,
      department: record.department,
      reviewPeriod: record.reviewPeriod,
      rating: record.rating,
      goals: record.goals,
      completed: record.completed,
      status: record.status
    });
    setIsReviewDialogOpen(true);
  };

  return (
    <MainLayout title="Performance Management" subtitle="Track employee performance reviews and goals">
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
              <CardTitle className="text-lg">Performance by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    formatter={(value) => [`${value}/5`, 'Rating']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  />
                  <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reviews by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={performanceByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {performanceByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} reviews`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Reviews - Q4 2024</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search employees..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Review</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Review Period</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Goal Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee.firstName} {record.employee.lastName}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{record.reviewPeriod}</TableCell>
                    <TableCell>
                      {record.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{record.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={record.goals > 0 ? (record.completed / record.goals) * 100 : 0} className="w-16 h-2" />
                        <span className="text-sm">{record.completed}/{record.goals}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === "Completed" ? "default" : record.status === "In Progress" ? "secondary" : "outline"}>{record.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.status !== "Completed" && (
                          <Button variant="ghost" size="sm" onClick={() => openReviewDialog(record)}>Review</Button>
                        )}
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
          <DialogHeader><DialogTitle>New Performance Review</DialogTitle><DialogDescription>Create a new performance review.</DialogDescription></DialogHeader>
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
              <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Goals Count</Label><Input type="number" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Performance Review</DialogTitle><DialogDescription>Update performance review details.</DialogDescription></DialogHeader>
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
              <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Goals</Label><Input type="number" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Completed</Label><Input type="number" value={formData.completed} onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          <DialogHeader><DialogTitle>Review Details</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedRecord.employee.firstName} {selectedRecord.employee.lastName}</p></div>
                <div><Label className="text-muted-foreground">Department</Label><p className="font-medium">{selectedRecord.department}</p></div>
                <div><Label className="text-muted-foreground">Review Period</Label><p className="font-medium">{selectedRecord.reviewPeriod}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedRecord.status === "Completed" ? "default" : selectedRecord.status === "In Progress" ? "secondary" : "outline"}>{selectedRecord.status}</Badge></div></div>
                <div><Label className="text-muted-foreground">Rating</Label><div className="flex items-center gap-1 mt-1">{selectedRecord.rating > 0 ? <><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><span>{selectedRecord.rating}</span></> : <span className="text-muted-foreground">Not rated yet</span>}</div></div>
                <div><Label className="text-muted-foreground">Goal Progress</Label><div className="flex items-center gap-2 mt-1"><Progress value={selectedRecord.goals > 0 ? (selectedRecord.completed / selectedRecord.goals) * 100 : 0} className="w-16 h-2" /><span>{selectedRecord.completed}/{selectedRecord.goals}</span></div></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Review</DialogTitle><DialogDescription>Complete the performance review for {selectedRecord?.employee.firstName} {selectedRecord?.employee.lastName}.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Goals Completed</Label><Input type="number" value={formData.completed} onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteReview}>Complete Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}