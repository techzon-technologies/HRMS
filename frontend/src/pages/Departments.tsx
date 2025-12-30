import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Users, ChevronRight, Plus } from "lucide-react";

interface Department {
  id: number;
  name: string;
  description: string;
  head: string;
  employees: number;
  openPositions: number;
  color: string;
}

const initialDepartments: Department[] = [
  {
    id: 1,
    name: "Engineering",
    description: "Software development and technical operations",
    head: "Robert Martinez",
    employees: 42,
    openPositions: 5,
    color: "bg-primary",
  },
  {
    id: 2,
    name: "Marketing",
    description: "Brand management and marketing campaigns",
    head: "Sarah Johnson",
    employees: 28,
    openPositions: 2,
    color: "bg-chart-2",
  },
  {
    id: 3,
    name: "Sales",
    description: "Customer acquisition and revenue generation",
    head: "David Thompson",
    employees: 35,
    openPositions: 4,
    color: "bg-chart-3",
  },
  {
    id: 4,
    name: "Human Resources",
    description: "Employee management and organizational development",
    head: "Lisa Anderson",
    employees: 12,
    openPositions: 1,
    color: "bg-chart-4",
  },
  {
    id: 5,
    name: "Finance",
    description: "Financial planning and accounting",
    head: "David Kim",
    employees: 18,
    openPositions: 2,
    color: "bg-chart-5",
  },
  {
    id: 6,
    name: "Design",
    description: "UI/UX design and creative services",
    head: "Emily Davis",
    employees: 15,
    openPositions: 3,
    color: "bg-primary",
  },
];

const Departments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    head: "",
    openPositions: "",
  });

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.head) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const colors = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
    const department: Department = {
      id: departments.length + 1,
      name: newDepartment.name,
      description: newDepartment.description,
      head: newDepartment.head,
      employees: 0,
      openPositions: parseInt(newDepartment.openPositions) || 0,
      color: colors[departments.length % colors.length],
    };

    setDepartments([...departments, department]);
    setNewDepartment({ name: "", description: "", head: "", openPositions: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Department Created",
      description: `${department.name} department has been created.`,
    });
  };

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Departments" subtitle="Organizational structure overview">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            className="transition-shadow hover:shadow-md cursor-pointer group"
            onClick={() => handleViewDepartment(dept)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${dept.color} flex items-center justify-center`}>
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <CardTitle className="mt-4">{dept.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{dept.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Department Head</span>
                <span className="font-medium text-foreground">{dept.head}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Employees</span>
                <span className="font-medium text-foreground">{dept.employees}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Open Positions</span>
                <Badge variant={dept.openPositions > 0 ? "default" : "secondary"}>
                  {dept.openPositions}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department in the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                placeholder="e.g., Operations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                placeholder="Brief description of the department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="head">Department Head</Label>
              <Input
                id="head"
                value={newDepartment.head}
                onChange={(e) => setNewDepartment({ ...newDepartment, head: e.target.value })}
                placeholder="Head of department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positions">Open Positions</Label>
              <Input
                id="positions"
                type="number"
                value={newDepartment.openPositions}
                onChange={(e) => setNewDepartment({ ...newDepartment, openPositions: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment}>Create Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Department Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>
              View department information.
            </DialogDescription>
          </DialogHeader>
          {selectedDepartment && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${selectedDepartment.color} flex items-center justify-center`}>
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDepartment.name}</h3>
                  <p className="text-muted-foreground">{selectedDepartment.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department Head</p>
                  <p className="font-medium">{selectedDepartment.head}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="font-medium">{selectedDepartment.employees}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Positions</p>
                  <Badge variant={selectedDepartment.openPositions > 0 ? "default" : "secondary"}>
                    {selectedDepartment.openPositions}
                  </Badge>
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

export default Departments;
