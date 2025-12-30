import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: "active" | "on-leave";
  avatar: string;
  initials: string;
  joinDate: string;
}

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
  });

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const initials = newEmployee.name.split(" ").map((n) => n[0]).join("").toUpperCase();
    const employee: Employee = {
      id: employees.length + 1,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone || "+1 234 567 8900",
      position: newEmployee.position || "New Employee",
      department: newEmployee.department,
      status: "active",
      avatar: "",
      initials,
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setEmployees([employee, ...employees]);
    setNewEmployee({ name: "", email: "", phone: "", position: "", department: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Employee Added",
      description: `${employee.name} has been added to the system.`,
    });
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return;

    setEmployees(employees.map((e) =>
      e.id === selectedEmployee.id
        ? { ...e, ...newEmployee, initials: newEmployee.name.split(" ").map((n) => n[0]).join("").toUpperCase() }
        : e
    ));
    setIsEditDialogOpen(false);
    setNewEmployee({ name: "", email: "", phone: "", position: "", department: "" });
    toast({
      title: "Employee Updated",
      description: `${newEmployee.name}'s information has been updated.`,
    });
  };

  const handleDelete = (employee: Employee) => {
    setEmployees(employees.filter((e) => e.id !== employee.id));
    toast({
      title: "Employee Deleted",
      description: `${employee.name} has been removed from the system.`,
    });
  };

  return (
    <MainLayout title="Employees" subtitle="Manage your team members">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Employee Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>{employee.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {employee.status === "active" ? "Active" : "On Leave"}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProfile(employee)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(employee)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(employee)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{employee.department}</span>
                <span className="text-muted-foreground">Joined {employee.joinDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                placeholder="john.doe@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>
              View employee details.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback>{selectedEmployee.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{selectedEmployee.joinDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedEmployee.status === "active" ? "default" : "secondary"}>
                    {selectedEmployee.status === "active" ? "Active" : "On Leave"}
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

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Position</Label>
              <Input
                id="edit-position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Employees;
