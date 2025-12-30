import { useState } from "react";
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

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  icon: React.ComponentType<{ className?: string }>;
}

const initialDocuments: Document[] = [
  { id: 1, name: "Employment Contract - Sarah Johnson", type: "Contract", category: "Legal", uploadedBy: "HR Admin", uploadedAt: "Dec 15, 2024", size: "245 KB", icon: FileText },
  { id: 2, name: "ID Document - Michael Chen", type: "ID", category: "Personal", uploadedBy: "HR Admin", uploadedAt: "Dec 10, 2024", size: "1.2 MB", icon: FileImage },
  { id: 3, name: "Tax Form W-4 - Emily Davis", type: "Tax", category: "Financial", uploadedBy: "Finance Team", uploadedAt: "Dec 5, 2024", size: "89 KB", icon: FileSpreadsheet },
  { id: 4, name: "Performance Review - James Wilson", type: "Review", category: "HR", uploadedBy: "HR Manager", uploadedAt: "Nov 28, 2024", size: "156 KB", icon: FileText },
  { id: 5, name: "Training Certificate - Lisa Anderson", type: "Certificate", category: "Training", uploadedBy: "Training Dept", uploadedAt: "Nov 20, 2024", size: "320 KB", icon: FileImage },
  { id: 6, name: "Salary Slip - David Kim", type: "Payroll", category: "Financial", uploadedBy: "Payroll System", uploadedAt: "Nov 15, 2024", size: "78 KB", icon: FileSpreadsheet },
];

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
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "Legal",
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    const newDoc: Document = {
      id: documents.length + 1,
      name: formData.name,
      type: formData.type,
      category: formData.category,
      uploadedBy: "Current User",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      size: "100 KB",
      icon: FileText,
    };
    setDocuments([...documents, newDoc]);
    setIsUploadDialogOpen(false);
    setFormData({ name: "", type: "", category: "Legal" });
    toast({ title: "Document Uploaded", description: `${formData.name} has been uploaded successfully.` });
  };

  const handleDownload = (doc: Document) => {
    toast({ title: "Download Started", description: `Downloading ${doc.name}...` });
  };

  const handleDelete = (id: number) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast({ title: "Document Deleted", description: "Document has been deleted." });
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent p-3">
                    <doc.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{doc.name}</h3>
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
              <Label>Document Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Employment Contract - John Doe" />
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
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
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-accent p-4">
                  <selectedDoc.icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedDoc.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoc.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Category</Label><div className="mt-1">{categoryBadge(selectedDoc.category)}</div></div>
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
