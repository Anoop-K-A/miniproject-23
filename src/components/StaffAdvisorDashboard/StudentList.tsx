import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { Student, DashboardStats } from "./types";
import { StudentCard } from "./StudentCard";

interface StudentListProps {
  students: Student[];
  stats: DashboardStats;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (student: Student) => void;
}

interface StudentFormState {
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
  batchYear: string;
}

const emptyForm: StudentFormState = {
  name: "",
  rollNumber: "",
  email: "",
  phone: "",
  department: "",
  semester: "",
  batchYear: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentList({
  students,
  stats,
  onSelectStudent,
  onAddStudent,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<StudentFormState>({
    ...emptyForm,
    batchYear: stats.batchYear,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentFormState, string>>
  >({});

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.careerInterest
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [students, searchTerm],
  );

  const groupedStudents = useMemo(() => {
    const groups = new Map<string, Student[]>();
    filteredStudents.forEach((student) => {
      const key = student.batchYear?.trim() || "Unknown";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(student);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredStudents]);

  const handleChange = (field: keyof StudentFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof StudentFormState, string>> = {};
    const trimmedRoll = form.rollNumber.trim();
    const trimmedEmail = form.email.trim();

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!trimmedRoll) {
      nextErrors.rollNumber = "Roll number is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!form.department.trim()) {
      nextErrors.department = "Department is required.";
    }
    if (!form.semester.trim()) {
      nextErrors.semester = "Semester is required.";
    }
    if (!form.batchYear.trim()) {
      nextErrors.batchYear = "Batch year is required.";
    }
    if (trimmedRoll && form.batchYear.trim()) {
      const existsInBatch = students.some(
        (student) =>
          student.batchYear?.toLowerCase() ===
            form.batchYear.trim().toLowerCase() &&
          student.rollNumber.toLowerCase() === trimmedRoll.toLowerCase(),
      );
      if (existsInBatch) {
        nextErrors.rollNumber = "Roll number already exists in this batch.";
      }
    }
    if (
      trimmedEmail &&
      students.some(
        (student) => student.email.toLowerCase() === trimmedEmail.toLowerCase(),
      )
    ) {
      nextErrors.email = "Email already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const batchKey = form.batchYear.trim();
    const rollKey = form.rollNumber.trim();
    const newStudent: Student = {
      id: `${batchKey}-${rollKey}`,
      name: form.name.trim(),
      rollNumber: rollKey,
      email: form.email.trim(),
      phone: form.phone.trim() || "",
      department: form.department.trim(),
      semester: form.semester.trim(),
      batchYear: batchKey,
      cgpa: 0,
      attendance: 0,
      careerInterest: "Not set",
      skillsAcquired: [],
      placementStatus: "Not Started",
      activityPoints: 0,
      activities: [],
    };

    onAddStudent(newStudent);
    setForm({ ...emptyForm, batchYear: stats.batchYear });
    setErrors({});
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              Manage and track student progress and placements
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Add a new student to your batch
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 py-4" onSubmit={handleSubmit}>
                <div>
                  <Label>Student Name</Label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Enter student name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label>Roll Number</Label>
                  <Input
                    value={form.rollNumber}
                    onChange={(event) =>
                      handleChange("rollNumber", event.target.value)
                    }
                    placeholder="Enter roll number"
                  />
                  {errors.rollNumber && (
                    <p className="text-xs text-red-600">{errors.rollNumber}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      placeholder="student@college.edu"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={form.department}
                      onChange={(event) =>
                        handleChange("department", event.target.value)
                      }
                      placeholder="Computer Science"
                    />
                    {errors.department && (
                      <p className="text-xs text-red-600">
                        {errors.department}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <Input
                      value={form.semester}
                      onChange={(event) =>
                        handleChange("semester", event.target.value)
                      }
                      placeholder="6"
                    />
                    {errors.semester && (
                      <p className="text-xs text-red-600">{errors.semester}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Batch Year</Label>
                  <Input
                    value={form.batchYear}
                    onChange={(event) =>
                      handleChange("batchYear", event.target.value)
                    }
                    placeholder="2024"
                  />
                  {errors.batchYear && (
                    <p className="text-xs text-red-600">{errors.batchYear}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Add Student
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, roll number, or career interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Student Cards */}
        <div className="space-y-6">
          {groupedStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students found for the current search.
            </p>
          ) : (
            groupedStudents.map(([batch, batchStudents]) => (
              <div key={batch} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Batch {batch}</p>
                  <span className="text-xs text-muted-foreground">
                    {batchStudents.length} students
                  </span>
                </div>
                <div className="space-y-3">
                  {batchStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onViewDetails={onSelectStudent}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
