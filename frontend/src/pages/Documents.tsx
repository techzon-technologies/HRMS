import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, Search, Upload, MoreVertical, File, FileImage, FileSpreadsheet, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  fileUrl: string;
  icon: any;
}

const categoryBadge = (category: string) => {
  switch (category) {
    case "Legal":
      return <Badge variant="default">{category}</Badge>;
    case "Personal":
      return <Badge variant="secondary">{category}</Badge>;
    case "Financial":
      return <Badge className="bg-chart-4 text-primary-foreground hover:bg-chart-4/90">{category}</Badge>;
    case "HR":
      return <Badge variant="outline">{category}</Badge>;
    case "Training":
      return <Badge className="bg-chart-3 text-primary-foreground hover:bg-chart-3/90">{category}</Badge>;
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
};

const Documents = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsData, employeesData] = await Promise.all([
        apiService.documents.getAll(),
        apiService.employees.getAll()
      ]);

      const mappedData = docsData.map((d: any) => ({
        id: d.id,
        name: d.title || d.name || "Untitled",
        type: d.type || "Document",
        category: d.category || "General",
        uploadedBy: d.employee ? `${d.employee.firstName} ${d.employee.lastName}` : "Unknown",
        uploadedAt: new Date(d.uploadedAt || d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        size: d.size || "Unknown",
        fileUrl: d.fileUrl || "#",
        icon: FileText,
      }));
      setDocuments(mappedData);
      setEmployees(employeesData as unknown as Employee[]);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    type: "",
    category: "Legal",
    fileUrl: "",
    size: ""
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = async () => {
    if (!formData.employeeId || !formData.name || !formData.fileUrl) {
      toast({ title: "Validation Error", description: "Please select an employee, enter name, and upload a file.", variant: "destructive" });
      return;
    }

    try {
      // Map frontend 'name' to backend 'title'
      const payload = {
        employeeId: parseInt(formData.employeeId),
        title: formData.name,
        type: formData.type || 'other',
        category: formData.category,
        fileUrl: formData.fileUrl,
        size: formData.size
      };

      await apiService.documents.create(payload);

      toast({ title: "Document Uploaded", description: `${formData.name} has been created successfully.` });
      setIsUploadDialogOpen(false);
      setFormData({ employeeId: "", name: "", type: "", category: "Legal", fileUrl: "", size: "" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload document.", variant: "destructive" });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Read file as Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          name: formData.name || file.name,
          type: file.type || "Document", // checking file.type for MIME
          size: `${(file.size / 1024).toFixed(1)} KB`,
          fileUrl: event.target?.result as string // Store Base64 string
        });
      };
      reader.readAsDataURL(file);

      toast({ title: "File Selected", description: `${file.name} ready for upload.` });
    }
  };

  const handleDownload = (doc: Document) => {
    if (!doc.fileUrl || doc.fileUrl === '#') {
      toast({ title: "Error", description: "File not found.", variant: "destructive" });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.name; // This will hint the browser to save with this name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Started", description: `Downloading ${doc.name}...` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download file.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.documents.delete(id);
      setDocuments(documents.filter((d) => d.id !== id));
      toast({ title: "Document Deleted", description: "Document has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setIsViewDialogOpen(true);
  };

  return (
    <MainLayout title="Documents" subtitle="Manage employee documents">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-lg bg-accent p-3">
                    <doc.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate" title={doc.name}>{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(doc)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleView(doc)}>View</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {categoryBadge(doc.category)}
                <span className="text-sm text-muted-foreground">{doc.size}</span>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploaded by {doc.uploadedBy}</span>
                  <span className="text-muted-foreground">{doc.uploadedAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a new document to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Employment Contract" />
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g., Contract, ID, Certificate" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
              {formData.fileUrl && (
                <p className="text-xs text-primary mt-2 font-medium">Selected: {formData.name} ({formData.size})</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Document Details</DialogTitle></DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-accent p-4 hidden sm:block">
                  <selectedDoc.icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg break-words">{selectedDoc.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{selectedDoc.type}</Badge>
                    {categoryBadge(selectedDoc.category)}
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-4 border rounded-lg overflow-hidden bg-muted/20 min-h-[200px] flex items-center justify-center">
                {selectedDoc.fileUrl && selectedDoc.fileUrl.startsWith('data:image') ? (
                  <img src={selectedDoc.fileUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
                ) : selectedDoc.fileUrl && selectedDoc.type === 'application/pdf' ? (
                  <iframe src={selectedDoc.fileUrl} className="w-full h-[400px]" title="PDF Preview"></iframe>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Preview not available for this file type.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-muted-foreground">Size</Label><p className="font-medium">{selectedDoc.size}</p></div>
                <div><Label className="text-muted-foreground">Uploaded By</Label><p className="font-medium">{selectedDoc.uploadedBy}</p></div>
                <div><Label className="text-muted-foreground">Upload Date</Label><p className="font-medium">{selectedDoc.uploadedAt}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedDoc && <Button onClick={() => handleDownload(selectedDoc)}><Download className="mr-2 h-4 w-4" />Download</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Documents;
