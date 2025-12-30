import { useState } from "react";
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
import { Search, Plus, Truck, Wrench, CheckCircle, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";

interface VehicleRecord {
  id: number;
  plateNo: string;
  make: string;
  model: string;
  year: string;
  assignedTo: string;
  status: string;
  nextService: string;
}

const initialVehicleData: VehicleRecord[] = [
  { id: 1, plateNo: "ABC-1234", make: "Toyota", model: "Hilux", year: "2022", assignedTo: "Ahmed Hassan", status: "Active", nextService: "2024-08-15" },
  { id: 2, plateNo: "XYZ-5678", make: "Nissan", model: "Patrol", year: "2021", assignedTo: "Pool Vehicle", status: "Active", nextService: "2024-07-20" },
  { id: 3, plateNo: "DEF-9012", make: "Ford", model: "Ranger", year: "2023", assignedTo: "Mohammed Khan", status: "In Service", nextService: "2024-06-30" },
  { id: 4, plateNo: "GHI-3456", make: "Mitsubishi", model: "Pajero", year: "2020", assignedTo: "Pool Vehicle", status: "Active", nextService: "2024-09-01" },
  { id: 5, plateNo: "JKL-7890", make: "Toyota", model: "Land Cruiser", year: "2023", assignedTo: "Management", status: "Active", nextService: "2024-10-15" },
];

export default function VehicleManagement() {
  const { toast } = useToast();
  const [vehicleData, setVehicleData] = useState<VehicleRecord[]>(initialVehicleData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [formData, setFormData] = useState({
    plateNo: "",
    make: "",
    model: "",
    year: "",
    assignedTo: "",
    status: "Active",
    nextService: "",
  });

  const filteredData = vehicleData.filter((v) =>
    v.plateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Vehicles", value: vehicleData.length.toString(), icon: Truck, color: "text-primary" },
    { label: "Active", value: vehicleData.filter(v => v.status === "Active").length.toString(), icon: CheckCircle, color: "text-emerald-600" },
    { label: "In Service", value: vehicleData.filter(v => v.status === "In Service").length.toString(), icon: Wrench, color: "text-amber-600" },
    { label: "Out of Service", value: vehicleData.filter(v => v.status === "Out of Service").length.toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  const handleAdd = () => {
    const newVehicle: VehicleRecord = { id: vehicleData.length + 1, ...formData };
    setVehicleData([...vehicleData, newVehicle]);
    setIsAddDialogOpen(false);
    setFormData({ plateNo: "", make: "", model: "", year: "", assignedTo: "", status: "Active", nextService: "" });
    toast({ title: "Vehicle Added", description: `Vehicle ${formData.plateNo} has been added.` });
  };

  const handleEdit = () => {
    if (!selectedVehicle) return;
    setVehicleData(vehicleData.map((v) => v.id === selectedVehicle.id ? { ...v, ...formData } : v));
    setIsEditDialogOpen(false);
    toast({ title: "Vehicle Updated", description: "Vehicle has been updated successfully." });
  };

  const handleDelete = (id: number) => {
    setVehicleData(vehicleData.filter((v) => v.id !== id));
    toast({ title: "Vehicle Deleted", description: "Vehicle has been deleted." });
  };

  const openEditDialog = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle);
    setFormData({ plateNo: vehicle.plateNo, make: vehicle.make, model: vehicle.model, year: vehicle.year, assignedTo: vehicle.assignedTo, status: vehicle.status, nextService: vehicle.nextService });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Vehicle Management" subtitle="Manage company vehicles and assignments">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vehicle Fleet</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search vehicles..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Vehicle</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate No</TableHead>
                  <TableHead>Make</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Next Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plateNo}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.assignedTo}</TableCell>
                    <TableCell>{vehicle.nextService}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === "Active" ? "default" : vehicle.status === "In Service" ? "secondary" : "destructive"}>{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(vehicle)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vehicle)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle><DialogDescription>Add a new vehicle to the fleet.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Plate No</Label><Input value={formData.plateNo} onChange={(e) => setFormData({ ...formData, plateNo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Make</Label><Input value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} /></div>
              <div className="space-y-2"><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} /></div>
              <div className="space-y-2"><Label>Year</Label><Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Assigned To</Label><Input value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Next Service Date</Label><Input type="date" value={formData.nextService} onChange={(e) => setFormData({ ...formData, nextService: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle><DialogDescription>Update vehicle information.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Plate No</Label><Input value={formData.plateNo} onChange={(e) => setFormData({ ...formData, plateNo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Make</Label><Input value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} /></div>
              <div className="space-y-2"><Label>Model</Label><Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} /></div>
              <div className="space-y-2"><Label>Year</Label><Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Assigned To</Label><Input value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Next Service Date</Label><Input type="date" value={formData.nextService} onChange={(e) => setFormData({ ...formData, nextService: e.target.value })} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="In Service">In Service</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
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
          <DialogHeader><DialogTitle>Vehicle Details</DialogTitle></DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Plate No</Label><p className="font-medium">{selectedVehicle.plateNo}</p></div>
                <div><Label className="text-muted-foreground">Make</Label><p className="font-medium">{selectedVehicle.make}</p></div>
                <div><Label className="text-muted-foreground">Model</Label><p className="font-medium">{selectedVehicle.model}</p></div>
                <div><Label className="text-muted-foreground">Year</Label><p className="font-medium">{selectedVehicle.year}</p></div>
                <div><Label className="text-muted-foreground">Assigned To</Label><p className="font-medium">{selectedVehicle.assignedTo}</p></div>
                <div><Label className="text-muted-foreground">Next Service</Label><p className="font-medium">{selectedVehicle.nextService}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedVehicle.status === "Active" ? "default" : selectedVehicle.status === "In Service" ? "secondary" : "destructive"}>{selectedVehicle.status}</Badge></div></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
