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
import { Search, Plus, Car, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2 } from "lucide-react";

interface LicenceRecord {
  id: number;
  employee: string;
  licenceNo: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const initialLicenceData: LicenceRecord[] = [
  { id: 1, employee: "Ahmed Hassan", licenceNo: "DL-2024-001", category: "Light Vehicle", issueDate: "2023-05-15", expiryDate: "2028-05-14", status: "Active" },
  { id: 2, employee: "Omar Abdullah", licenceNo: "DL-2024-002", category: "Heavy Vehicle", issueDate: "2022-08-20", expiryDate: "2024-08-19", status: "Expiring Soon" },
  { id: 3, employee: "Mohammed Khan", licenceNo: "DL-2024-003", category: "Light Vehicle", issueDate: "2024-01-10", expiryDate: "2029-01-09", status: "Active" },
  { id: 4, employee: "Khalid Ibrahim", licenceNo: "DL-2024-004", category: "Motorcycle", issueDate: "2021-11-01", expiryDate: "2024-10-31", status: "Expired" },
  { id: 5, employee: "Yusuf Mahmoud", licenceNo: "DL-2024-005", category: "Light Vehicle", issueDate: "2023-02-28", expiryDate: "2028-02-27", status: "Active" },
];

export default function DrivingLicence() {
  const { toast } = useToast();
  const [licenceData, setLicenceData] = useState<LicenceRecord[]>(initialLicenceData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLicence, setSelectedLicence] = useState<LicenceRecord | null>(null);
  const [formData, setFormData] = useState({
    employee: "",
    licenceNo: "",
    category: "Light Vehicle",
    issueDate: "",
    expiryDate: "",
    status: "Active",
  });

  const filteredData = licenceData.filter((licence) =>
    licence.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
    licence.licenceNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Licences", value: licenceData.length.toString(), icon: Car, color: "text-primary" },
    { label: "Active", value: licenceData.filter(l => l.status === "Active").length.toString(), icon: CheckCircle, color: "text-emerald-600" },
    { label: "Expiring Soon", value: licenceData.filter(l => l.status === "Expiring Soon").length.toString(), icon: Clock, color: "text-amber-600" },
    { label: "Expired", value: licenceData.filter(l => l.status === "Expired").length.toString(), icon: AlertTriangle, color: "text-destructive" },
  ];

  const handleAdd = () => {
    const newLicence: LicenceRecord = {
      id: licenceData.length + 1,
      ...formData,
    };
    setLicenceData([...licenceData, newLicence]);
    setIsAddDialogOpen(false);
    setFormData({ employee: "", licenceNo: "", category: "Light Vehicle", issueDate: "", expiryDate: "", status: "Active" });
    toast({ title: "Licence Added", description: `Driving licence for ${formData.employee} has been added.` });
  };

  const handleEdit = () => {
    if (!selectedLicence) return;
    setLicenceData(licenceData.map((l) => l.id === selectedLicence.id ? { ...l, ...formData } : l));
    setIsEditDialogOpen(false);
    toast({ title: "Licence Updated", description: "Driving licence has been updated successfully." });
  };

  const handleDelete = (id: number) => {
    setLicenceData(licenceData.filter((l) => l.id !== id));
    toast({ title: "Licence Deleted", description: "Driving licence has been deleted." });
  };

  const openEditDialog = (licence: LicenceRecord) => {
    setSelectedLicence(licence);
    setFormData({ employee: licence.employee, licenceNo: licence.licenceNo, category: licence.category, issueDate: licence.issueDate, expiryDate: licence.expiryDate, status: licence.status });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (licence: LicenceRecord) => {
    setSelectedLicence(licence);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Driving Licence Management" subtitle="Track employee driving licences and renewals">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
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
              <CardTitle>Licence Records</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search licences..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Licence
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Licence No</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((licence) => (
                  <TableRow key={licence.id}>
                    <TableCell className="font-medium">{licence.employee}</TableCell>
                    <TableCell>{licence.licenceNo}</TableCell>
                    <TableCell>{licence.category}</TableCell>
                    <TableCell>{licence.issueDate}</TableCell>
                    <TableCell>{licence.expiryDate}</TableCell>
                    <TableCell>
                      <Badge variant={licence.status === "Active" ? "default" : licence.status === "Expiring Soon" ? "secondary" : "destructive"}>
                        {licence.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(licence)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(licence)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(licence.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader>
            <DialogTitle>Add Driving Licence</DialogTitle>
            <DialogDescription>Add a new driving licence record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Employee Name</Label><Input value={formData.employee} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} /></div>
            <div className="space-y-2"><Label>Licence Number</Label><Input value={formData.licenceNo} onChange={(e) => setFormData({ ...formData, licenceNo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light Vehicle">Light Vehicle</SelectItem>
                  <SelectItem value="Heavy Vehicle">Heavy Vehicle</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Licence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driving Licence</DialogTitle>
            <DialogDescription>Update the driving licence record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Employee Name</Label><Input value={formData.employee} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} /></div>
            <div className="space-y-2"><Label>Licence Number</Label><Input value={formData.licenceNo} onChange={(e) => setFormData({ ...formData, licenceNo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light Vehicle">Light Vehicle</SelectItem>
                  <SelectItem value="Heavy Vehicle">Heavy Vehicle</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
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
          <DialogHeader><DialogTitle>Licence Details</DialogTitle></DialogHeader>
          {selectedLicence && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{selectedLicence.employee}</p></div>
                <div><Label className="text-muted-foreground">Licence No</Label><p className="font-medium">{selectedLicence.licenceNo}</p></div>
                <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{selectedLicence.category}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><Badge variant={selectedLicence.status === "Active" ? "default" : selectedLicence.status === "Expiring Soon" ? "secondary" : "destructive"}>{selectedLicence.status}</Badge></div></div>
                <div><Label className="text-muted-foreground">Issue Date</Label><p className="font-medium">{selectedLicence.issueDate}</p></div>
                <div><Label className="text-muted-foreground">Expiry Date</Label><p className="font-medium">{selectedLicence.expiryDate}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
