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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Package, Laptop, Wrench, CheckCircle, AlertTriangle, MoreVertical, Download, BarChart3, PieChart, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";
import { apiService } from "@/lib/api";

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  assignedTo: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  } | null;
  assignedToId: number | null;
  purchaseDate: string;
  value: number;
  status: "In Use" | "Available" | "Maintenance" | "Retired";
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

export default function CompanyAssets() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assignTo, setAssignTo] = useState("");
  const [stats, setStats] = useState([
    { label: "Total Assets", value: "0", icon: Package, color: "text-primary" },
    { label: "In Use", value: "0", icon: Laptop, color: "text-emerald-600" },
    { label: "Under Maintenance", value: "0", icon: Wrench, color: "text-amber-600" },
    { label: "Asset Value", value: "AED 0", icon: CheckCircle, color: "text-blue-600" },
  ]);
  const [assetsByCategory, setAssetsByCategory] = useState([
    { name: "Laptop", value: 0 },
    { name: "Mobile", value: 0 },
    { name: "Monitor", value: 0 },
    { name: "Furniture", value: 0 },
    { name: "Equipment", value: 0 },
    { name: "Printer", value: 0 },
  ]);
  const [assetsByStatus, setAssetsByStatus] = useState([
    { name: "In Use", value: 0 },
    { name: "Available", value: 0 },
    { name: "Maintenance", value: 0 },
  ]);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    assignedToId: 0,
    purchaseDate: "",
    value: "",
  });

  // Fetch assets and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, employeesData] = await Promise.all([
          apiService.assets.getAll(),
          apiService.employees.getAll()
        ]);
        
        setAssets(assetsData);
        setEmployees(employeesData);
        
        // Calculate stats
        const totalAssets = assetsData.length;
        const inUseAssets = assetsData.filter(asset => asset.status === 'In Use').length;
        const maintenanceAssets = assetsData.filter(asset => asset.status === 'Maintenance').length;
        const totalValue = assetsData.reduce((sum, asset) => sum + asset.value, 0);
        
        setStats([
          { label: "Total Assets", value: totalAssets.toString(), icon: Package, color: "text-primary" },
          { label: "In Use", value: inUseAssets.toString(), icon: Laptop, color: "text-emerald-600" },
          { label: "Under Maintenance", value: maintenanceAssets.toString(), icon: Wrench, color: "text-amber-600" },
          { label: "Asset Value", value: `AED ${totalValue.toLocaleString()}`, icon: CheckCircle, color: "text-blue-600" },
        ]);
        
        // Calculate assets by category
        const categoryMap: Record<string, number> = {};
        assetsData.forEach(asset => {
          categoryMap[asset.category] = (categoryMap[asset.category] || 0) + 1;
        });
        
        const categories = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        setAssetsByCategory(categories);
        
        // Calculate assets by status
        const statusMap: Record<string, number> = {};
        assetsData.forEach(asset => {
          statusMap[asset.status] = (statusMap[asset.status] || 0) + 1;
        });
        
        const statuses = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        setAssetsByStatus(statuses);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load assets and employees data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.assignedTo && asset.assignedTo.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (asset.assignedTo && asset.assignedTo.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.category || !newAsset.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const assetData = {
        name: newAsset.name,
        category: newAsset.category,
        assignedToId: newAsset.assignedToId || null,
        purchaseDate: newAsset.purchaseDate || new Date().toISOString().split("T")[0],
        value: parseFloat(newAsset.value),
        status: newAsset.assignedToId ? "In Use" : "Available",
      };

      const createdAsset = await apiService.assets.create(assetData);
      
      // Find the employee details for the newly created asset
      if (newAsset.assignedToId) {
        const employee = employees.find(emp => emp.id === newAsset.assignedToId);
        if (employee) {
          createdAsset.assignedTo = employee;
        }
      }
      
      setAssets([createdAsset, ...assets]);
      setNewAsset({ name: "", category: "", assignedToId: 0, purchaseDate: "", value: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "Asset Added",
        description: `${createdAsset.name} (${createdAsset.assetTag}) has been added to inventory.`,
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: "Error",
        description: "Failed to create asset",
        variant: "destructive",
      });
    }
  };

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsViewDialogOpen(true);
  };

  const handleAssign = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssignTo("");
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedAsset || !assignTo) return;

    try {
      // Find the employee ID based on the assignTo string
      const employee = employees.find(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(assignTo.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(assignTo.toLowerCase())
      );

      if (!employee) {
        toast({
          title: "Error",
          description: "Employee not found",
          variant: "destructive",
        });
        return;
      }

      const updatedAsset = await apiService.assets.assign(selectedAsset.id, { 
        assignedToId: employee.id 
      });

      setAssets(assets.map((a) =>
        a.id === selectedAsset.id
          ? { ...a, assignedTo: employee, status: "In Use" }
          : a
      ));
      setIsAssignDialogOpen(false);
      toast({
        title: "Asset Assigned",
        description: `${selectedAsset.name} has been assigned to ${assignTo}.`,
      });
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast({
        title: "Error",
        description: "Failed to assign asset",
        variant: "destructive",
      });
    }
  };

  const handleMaintenance = async (asset: Asset) => {
    try {
      await apiService.assets.update(asset.id, { status: "Maintenance" });
      
      setAssets(assets.map((a) =>
        a.id === asset.id ? { ...a, status: "Maintenance" } : a
      ));
      toast({
        title: "Sent for Maintenance",
        description: `${asset.name} has been marked for maintenance.`,
      });
    } catch (error) {
      console.error('Error updating asset status:', error);
      toast({
        title: "Error",
        description: "Failed to update asset status",
        variant: "destructive",
      });
    }
  };

  const handleRetire = async (asset: Asset) => {
    try {
      await apiService.assets.update(asset.id, { status: "Retired", assignedToId: null });
      
      setAssets(assets.map((a) =>
        a.id === asset.id ? { ...a, status: "Retired", assignedTo: null } : a
      ));
      toast({
        title: "Asset Retired",
        description: `${asset.name} has been retired from inventory.`,
      });
    } catch (error) {
      console.error('Error retiring asset:', error);
      toast({
        title: "Error",
        description: "Failed to retire asset",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (window.confirm(`Are you sure you want to delete asset ${asset.assetTag}?`)) {
      try {
        await apiService.assets.delete(asset.id);
        
        setAssets(assets.filter((a) => a.id !== asset.id));
        
        // Recalculate stats
        const updatedAssets = assets.filter((a) => a.id !== asset.id);
        const totalAssets = updatedAssets.length;
        const inUseAssets = updatedAssets.filter(asset => asset.status === 'In Use').length;
        const maintenanceAssets = updatedAssets.filter(asset => asset.status === 'Maintenance').length;
        const totalValue = updatedAssets.reduce((sum, asset) => sum + asset.value, 0);
        
        setStats([
          { label: "Total Assets", value: totalAssets.toString(), icon: Package, color: "text-primary" },
          { label: "In Use", value: inUseAssets.toString(), icon: Laptop, color: "text-emerald-600" },
          { label: "Under Maintenance", value: maintenanceAssets.toString(), icon: Wrench, color: "text-amber-600" },
          { label: "Asset Value", value: `AED ${totalValue.toLocaleString()}`, icon: CheckCircle, color: "text-blue-600" },
        ]);
        
        // Update category chart
        const categoryMap: Record<string, number> = {};
        updatedAssets.forEach(asset => {
          categoryMap[asset.category] = (categoryMap[asset.category] || 0) + 1;
        });
        
        const categories = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        setAssetsByCategory(categories);
        
        // Update status chart
        const statusMap: Record<string, number> = {};
        updatedAssets.forEach(asset => {
          statusMap[asset.status] = (statusMap[asset.status] || 0) + 1;
        });
        
        const statuses = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        setAssetsByStatus(statuses);
        
        toast({
          title: "Asset Deleted",
          description: `${asset.name} has been removed from inventory.`,
        });
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast({
          title: "Error",
          description: "Failed to delete asset",
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Asset inventory report is being generated.",
    });
  };

  return (
    <MainLayout title="Company Assets" subtitle="Track and manage company assets and equipment">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Inventory
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
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
              <CardTitle className="text-lg">Assets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={assetsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} assets`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={assetsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} assets`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Asset Inventory</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Value (AED)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetTag}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : 'Unassigned'}</TableCell>
                    <TableCell>{asset.purchaseDate}</TableCell>
                    <TableCell>{asset.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          asset.status === "In Use"
                            ? "default"
                            : asset.status === "Available"
                            ? "secondary"
                            : asset.status === "Maintenance"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(asset)}>
                            View Details
                          </DropdownMenuItem>
                          {(asset.status === "Available" || asset.status === "In Use") && (
                            <DropdownMenuItem onClick={() => handleAssign(asset)}>
                              {asset.status === "In Use" ? "Reassign" : "Assign"}
                            </DropdownMenuItem>
                          )}
                          {asset.status !== "Maintenance" && asset.status !== "Retired" && (
                            <DropdownMenuItem onClick={() => handleMaintenance(asset)}>
                              Send for Maintenance
                            </DropdownMenuItem>
                          )}
                          {asset.status !== "Retired" && (
                            <DropdownMenuItem onClick={() => handleRetire(asset)}>
                              Retire Asset
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(asset)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Add a new asset to the company inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="e.g., MacBook Pro 16 inch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newAsset.category}
                onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Monitor">Monitor</SelectItem>
                  <SelectItem value="Mobile">Mobile Device</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (AED)</Label>
              <Input
                id="value"
                type="number"
                value={newAsset.value}
                onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                placeholder="Enter asset value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={newAsset.purchaseDate}
                onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To (Optional)</Label>
              <Select
                value={newAsset.assignedToId.toString()}
                onValueChange={(value) => setNewAsset({ ...newAsset, assignedToId: parseInt(value) || 0 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset}>Add Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Asset Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>
              View complete asset information.
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Tag</p>
                  <p className="font-medium">{selectedAsset.assetTag}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedAsset.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedAsset.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="font-medium">AED {selectedAsset.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{selectedAsset.assignedTo ? `${selectedAsset.assignedTo.firstName} ${selectedAsset.assignedTo.lastName}` : 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{selectedAsset.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedAsset.status === "In Use"
                        ? "default"
                        : selectedAsset.status === "Available"
                        ? "secondary"
                        : selectedAsset.status === "Maintenance"
                        ? "outline"
                        : "destructive"
                    }
                  >
                    {selectedAsset.status}
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

      {/* Assign Asset Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>
              {selectedAsset && `Assign ${selectedAsset.name} to an employee or location.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignTo">Assign To</Label>
              <Select
                value={assignTo}
                onValueChange={setAssignTo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}