"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  Eye,
  Reply,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResponseDialog } from "@/components/shared/dialogs/ResponseDialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeerReviewDialog } from "@/components/shared/dialogs/PeerReviewDialog";
import { AllFacultyFilesView } from "./AllFacultyFilesView";
import { CourseFile } from "./types";
import { useAuth } from "@/context/AuthContext";
import {
  downloadFromDataUrl,
  downloadTextFile,
  sanitizeFileName,
} from "@/lib/download";

interface CourseFileManagerProps {
  initialFiles?: CourseFile[];
  fileCategories?: string[];
  fileTypes?: string[];
}

export function CourseFileManager({
  initialFiles = [],
  fileCategories = [],
  fileTypes = [],
}: CourseFileManagerProps) {
  const [files, setFiles] = useState<CourseFile[]>(initialFiles);
  const [categoryOptions, setCategoryOptions] =
    useState<string[]>(fileCategories);
  const [typeOptions, setTypeOptions] = useState<string[]>(fileTypes);
  const { user, userRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [semester, setSemester] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string | null>(
    null,
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [viewMode, setViewMode] = useState<"my-files" | "all-files">(
    "my-files",
  );
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isMessageReplyOpen, setIsMessageReplyOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: string;
      facultyId: string;
      auditorId?: string;
      entityType: string;
      entityId: string;
      threadId?: string;
      senderRole?: string;
      senderName?: string;
      message: string;
      status?: string;
      createdAt?: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/course-files");
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "Failed to load files");
          return;
        }
        setFiles(data.files ?? []);
        setCategoryOptions(data.fileCategories ?? []);
        setTypeOptions(data.fileTypes ?? []);
      } catch (error) {
        console.error("Load files error:", error);
        toast.error("Failed to load files");
      }
    };

    const fetchMessages = async () => {
      if (userRole !== "faculty" || !user?.id) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(`/api/messages?facultyId=${user.id}`);
        const data = await response.json();
        if (!response.ok) {
          setMessages([]);
          return;
        }
        const scopedMessages = (data.messages ?? []).filter(
          (message: { entityType: string }) =>
            message.entityType === "course-file",
        );
        setMessages(scopedMessages);
      } catch (error) {
        console.error("Load messages error:", error);
        setMessages([]);
      }
    };

    fetchFiles();
    fetchMessages();

    if (typeof window !== "undefined") {
      const handler = () => {
        fetchFiles();
        fetchMessages();
      };
      window.addEventListener("dashboard:data-updated", handler);
      return () => {
        window.removeEventListener("dashboard:data-updated", handler);
      };
    }
  }, [user?.id, userRole]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName || !courseCode || !courseName || !selectedFileType) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!uploadedFileDataUrl) {
      toast.error("Please choose a file to upload");
      return;
    }

    try {
      const response = await fetch("/api/course-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facultyId: user?.id,
          facultyName: user?.name ?? "",
          department: user?.department ?? "",
          fileName,
          documentUrl: uploadedFileDataUrl,
          courseCode,
          courseName,
          fileType: selectedFileType,
          uploadDate: new Date().toISOString().split("T")[0],
          semester,
          academicYear: selectedYear,
          size: "1.5 MB",
          status: "Pending",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setFiles(data.files);
      setUploadDialogOpen(false);
      toast.success("File uploaded successfully");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }

      setSelectedFileType("");
      setCourseCode("");
      setCourseName("");
      setSemester("");
      setFileName("");
      setUploadedFileDataUrl(null);
      setSelectedYear(new Date().getFullYear().toString());
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("An error occurred during upload");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/course-files/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      setFiles(data.files);
      toast.success("File deleted successfully");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    }
  };

  const handleDownload = (file: CourseFile) => {
    const safeName = sanitizeFileName(file.fileName, "course-file");
    if (file.documentUrl) {
      downloadFromDataUrl(file.documentUrl, safeName);
      toast.success(`Downloading ${file.fileName}`);
      return;
    }

    const baseName = safeName.replace(/\.[^/.]+$/, "");
    const summaryName = `${baseName || "course-file"}-summary.txt`;
    const summary = [
      `File Name: ${file.fileName}`,
      `Course: ${file.courseCode} - ${file.courseName}`,
      `Type: ${file.fileType}`,
      `Semester: ${file.semester}`,
      `Academic Year: ${file.academicYear}`,
      `Uploaded: ${file.uploadDate}`,
      `Faculty: ${file.facultyName}`,
      `Department: ${file.department}`,
      `Status: ${file.status ?? "Unknown"}`,
    ].join("\n");
    downloadTextFile(summary, summaryName);
    toast.success(`Downloaded summary for ${file.fileName}`);
  };

  const handleView = (file: CourseFile) => {
    setSelectedFile(file);
    setIsViewOpen(true);
  };

  const handleResponse = async (response: string) => {
    if (!selectedFile) return;

    try {
      const apiResponse = await fetch(`/api/course-files/${selectedFile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facultyResponse: response,
        }),
      });
      const data = await apiResponse.json();
      if (!apiResponse.ok) {
        toast.error(data.error || "Response update failed");
        return;
      }
      setFiles(data.files);
      const updated = data.files
        .filter((file: CourseFile) => file.id === selectedFile.id)
        .reduce<CourseFile | undefined>((acc, file) => acc ?? file, undefined);
      if (updated) {
        setSelectedFile(updated);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("dashboard:data-updated"));
      }
    } catch (error) {
      console.error("Response error:", error);
      toast.error("An error occurred while saving response");
    }
  };

  const handleMessageReply = async (response: string) => {
    if (!selectedFile || !user?.id) return;

    const threadId = `course-file:${selectedFile.id}`;
    const threadMessages = messagesByThread[threadId] ?? [];
    const auditorId = threadMessages.find((msg) => msg.auditorId)?.auditorId;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyId: user.id,
        auditorId,
        entityType: "course-file",
        entityId: selectedFile.id,
        threadId,
        senderRole: "faculty",
        senderName: user.name,
        message: response,
      }),
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dashboard:data-updated"));
    }
  };

  const facultyFiles = useMemo(() => {
    if (userRole === "faculty" && user?.id) {
      return files.filter((file) => file.facultyId === user.id);
    }
    return files;
  }, [files, user?.id, userRole]);

  const resolvedFiles = facultyFiles.filter((file) => {
    const matchesSearch =
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || file.fileType === filterType;
    const matchesStatus =
      filterStatus === "all" || file.status === filterStatus;
    const matchesYear =
      filterYear === "all" || file.academicYear === filterYear;

    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  const statuses = Array.from(
    new Set(facultyFiles.map((f) => f.status).filter(Boolean)),
  );
  const years = Array.from(new Set(facultyFiles.map((f) => f.academicYear)));

  const normalizeThreadId = (message: {
    threadId?: string;
    entityType: string;
    entityId: string;
  }) => message.threadId ?? `${message.entityType}:${message.entityId}`;

  const messagesByThread = useMemo(() => {
    return messages.reduce<Record<string, typeof messages>>((acc, message) => {
      const threadId = normalizeThreadId(message);
      if (!acc[threadId]) {
        acc[threadId] = [];
      }
      acc[threadId].push({ ...message, threadId });
      return acc;
    }, {});
  }, [messages]);

  const getThreadMessagesForFile = (fileId: string) => {
    const threadId = `course-file:${fileId}`;
    const threadMessages = messagesByThread[threadId] ?? [];
    return [...threadMessages].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return aTime - bTime;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course File Management</CardTitle>
        <CardDescription>
          Upload and manage course materials, syllabi, lesson plans, and
          assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="my-files" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-files">My Files</TabsTrigger>
            <TabsTrigger value="all-files">
              <Users className="h-4 w-4 mr-2" />
              All Faculty Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-files" className="space-y-4 mt-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem
                      key={status || "unknown"}
                      value={status || "unknown"}
                    >
                      {status || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Course File</DialogTitle>
                    <DialogDescription>
                      Add a new course file to your repository
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        required
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) {
                            setFileName("");
                            setUploadedFileDataUrl(null);
                            return;
                          }
                          setFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUploadedFileDataUrl(
                              typeof reader.result === "string"
                                ? reader.result
                                : null,
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">File Category *</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value)}
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select file category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="courseCode">Course Code</Label>
                      <Input
                        id="courseCode"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="e.g., CS101"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="courseName">Course Name</Label>
                      <Input
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g., Introduction to Computer Science"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fileType">File Type</Label>
                      <Select
                        value={selectedFileType}
                        onValueChange={(value) => setSelectedFileType(value)}
                      >
                        <SelectTrigger id="fileType">
                          <SelectValue placeholder="Select file type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Select
                          value={semester}
                          onValueChange={(value) => setSemester(value)}
                        >
                          <SelectTrigger id="semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fall">Fall</SelectItem>
                            <SelectItem value="Spring">Spring</SelectItem>
                            <SelectItem value="Summer">Summer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        <Input
                          id="academicYear"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          placeholder="2024-2025"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Upload File
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Files Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedFiles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 py-8"
                      >
                        No files found. Upload your first course file to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resolvedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{file.fileName}</span>
                          {messagesByThread[`course-file:${file.id}`] && (
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{file.courseCode}</div>
                            <div className="text-sm text-gray-500">
                              {file.courseName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{file.fileType}</Badge>
                        </TableCell>
                        <TableCell>
                          {file.semester} {file.academicYear}
                        </TableCell>
                        <TableCell>{file.uploadDate}</TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(file)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{resolvedFiles.length}</div>
                  <p className="text-sm text-gray-500">Total Files</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{fileTypes.length}</div>
                  <p className="text-sm text-gray-500">File Types</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl">{years.length}</div>
                  <p className="text-sm text-gray-500">Years</p>
                </CardContent>
              </Card>
            </div>

            {/* View File Details Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>File Details</DialogTitle>
                  <DialogDescription>
                    {selectedFile && (
                      <span className="flex items-center gap-2 mt-2">
                        <FileText className="h-4 w-4" />
                        {selectedFile.fileName}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                {selectedFile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Course Code</p>
                        <p>{selectedFile.courseCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Course Name</p>
                        <p>{selectedFile.courseName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">File Type</p>
                        <p>{selectedFile.fileType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Semester</p>
                        <p>
                          {selectedFile.semester} {selectedFile.academicYear}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Upload Date</p>
                        <p>{selectedFile.uploadDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">File Size</p>
                        <p>{selectedFile.size}</p>
                      </div>
                    </div>

                    {/* Admin Review Section */}
                    {selectedFile.status && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-gray-600" />
                            Admin Review
                          </h4>
                          <Badge
                            className={
                              selectedFile.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : selectedFile.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {selectedFile.status}
                          </Badge>
                        </div>

                        {selectedFile.adminRemarks ? (
                          <div className="space-y-3">
                            <Alert
                              className={
                                selectedFile.status === "Approved"
                                  ? "border-green-200 bg-green-50"
                                  : selectedFile.status === "Rejected"
                                    ? "border-red-200 bg-red-50"
                                    : "border-yellow-200 bg-yellow-50"
                              }
                            >
                              <AlertDescription>
                                <p className="text-sm mb-3">
                                  {selectedFile.adminRemarks}
                                </p>
                                {selectedFile.reviewedBy && (
                                  <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                                    <p>
                                      Reviewed by: {selectedFile.reviewedBy}
                                    </p>
                                    {selectedFile.reviewedDate && (
                                      <p>Date: {selectedFile.reviewedDate}</p>
                                    )}
                                  </div>
                                )}
                              </AlertDescription>
                            </Alert>

                            {/* Faculty Response */}
                            {selectedFile.facultyResponse ? (
                              <Alert className="border-blue-200 bg-blue-50">
                                <AlertDescription>
                                  <p className="text-xs text-blue-800 mb-2">
                                    Your Response:
                                  </p>
                                  <p className="text-sm mb-3">
                                    {selectedFile.facultyResponse}
                                  </p>
                                  {selectedFile.responseDate && (
                                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                                      <p>
                                        Response Date:{" "}
                                        {selectedFile.responseDate}
                                      </p>
                                    </div>
                                  )}
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsResponseOpen(true)}
                                className="w-full"
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Respond to Admin Review
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Alert>
                            <AlertDescription className="text-sm text-gray-500">
                              This file is pending admin review. You will be
                              notified once the review is complete.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {(() => {
                      const threadMessages = getThreadMessagesForFile(
                        selectedFile.id,
                      );

                      if (threadMessages.length === 0) return null;

                      return (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-gray-600" />
                              Auditor Messages
                            </h4>
                            <Badge variant="outline">
                              {threadMessages.length}
                            </Badge>
                          </div>
                          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {threadMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className="rounded-md border bg-white p-3"
                              >
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    {msg.senderName ||
                                      msg.senderRole ||
                                      "Message"}
                                  </span>
                                  {msg.createdAt && (
                                    <span>
                                      {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mt-2">
                                  {msg.message}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMessageReplyOpen(true)}
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Reply to Auditor
                          </Button>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleDownload(selectedFile)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsViewOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Response Dialog */}
            <ResponseDialog
              open={isResponseOpen}
              onOpenChange={setIsResponseOpen}
              onSubmit={handleResponse}
              itemType="file"
            />
            <ResponseDialog
              open={isMessageReplyOpen}
              onOpenChange={setIsMessageReplyOpen}
              onSubmit={handleMessageReply}
              itemType="file"
            />
          </TabsContent>

          <TabsContent value="all-files" className="space-y-4 mt-4">
            <AllFacultyFilesView
              files={facultyFiles}
              currentUser={user?.name ?? ""}
              onFilesChange={setFiles}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
