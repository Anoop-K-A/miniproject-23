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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { Student, DashboardStats } from "./types";
import { StudentCard } from "./StudentCard";
import {
  getStandardBatchYearOptions,
  isValidBatchYear,
  normalizeBatchYear,
} from "@/lib/batchYear";

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
  batchYear: string;
}

const emptyForm: StudentFormState = {
  name: "",
  rollNumber: "",
  email: "",
  phone: "",
  department: "",
  batchYear: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const semesterOptions = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const batchYearOptions = getStandardBatchYearOptions();

function resolveInitialBatchYear(defaultBatch?: string) {
  const normalized = normalizeBatchYear(defaultBatch);
  if (isValidBatchYear(normalized)) {
    return normalized;
  }
  return batchYearOptions[0] ?? "";
}

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
    batchYear: resolveInitialBatchYear(stats.batchYear),
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

    const sortedGroupEntries = Array.from(groups.entries()).map(
      ([batch, studentsInBatch]) => [
        batch,
        [...studentsInBatch].sort((a, b) => {
          const rollA = a.rollNumber?.trim() || "";
          const rollB = b.rollNumber?.trim() || "";

          const extractNumber = (roll: string) => {
            const digits = roll.match(/\d+/g)?.join("");
            return digits ? Number(digits) : NaN;
          };

          const numericA = extractNumber(rollA);
          const numericB = extractNumber(rollB);

          if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
            if (numericA !== numericB) return numericA - numericB;
          }

          return rollA.localeCompare(rollB, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }),
      ] as [string, Student[]],
    );

    const sortBatchKey = (a: string, b: string) => {
      const parseStart = (batch: string) => {
        const parts = batch.split("-").map((p) => Number(p));
        return Number.isNaN(parts[0]) ? 0 : parts[0];
      };

      return parseStart(b) - parseStart(a);
    };

    return sortedGroupEntries.sort(([batchA], [batchB]) => sortBatchKey(batchA, batchB));
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
    const normalizedBatchYear = normalizeBatchYear(form.batchYear);

    if (!normalizedBatchYear) {
      nextErrors.batchYear = "Batch year is required.";
    } else if (!isValidBatchYear(normalizedBatchYear)) {
      nextErrors.batchYear =
        "Batch year must be in YYYY-YYYY format (for example 2023-2027).";
    }
    if (
      trimmedRoll &&
      normalizedBatchYear &&
      isValidBatchYear(normalizedBatchYear)
    ) {
      const existsInBatch = students.some(
        (student) =>
          normalizeBatchYear(student.batchYear).toLowerCase() ===
            normalizedBatchYear.toLowerCase() &&
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

    const batchKey = normalizeBatchYear(form.batchYear);
    const rollKey = form.rollNumber.trim();
    const newStudent: Student = {
      id: `${batchKey}-${rollKey}`,
      name: form.name.trim(),
      rollNumber: rollKey,
      email: form.email.trim(),
      phone: form.phone.trim() || "",
      department: form.department.trim(),
      semester: "",
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
    setForm({
      ...emptyForm,
      batchYear: resolveInitialBatchYear(stats.batchYear),
    });
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
                </div>
                <div>
                  <Label>Batch Year</Label>
                  <Select
                    value={form.batchYear}
                    onValueChange={(value) => handleChange("batchYear", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchYearOptions.map((batchOption) => (
                        <SelectItem key={batchOption} value={batchOption}>
                          {batchOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <details
                key={batch}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500 group-open:hidden">
                      [+]
                    </span>
                    <span className="font-mono text-xs text-slate-500 hidden group-open:inline">
                      [-]
                    </span>
                    <span>Batch {batch}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {batchStudents.length} student{batchStudents.length === 1 ? "" : "s"}
                  </span>
                </summary>

                <div className="bg-white px-4 py-3">
                  {/* Batch Statistics */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Students</p>
                        <p className="text-lg font-semibold text-blue-600">{batchStudents.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg CGPA</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {batchStudents.length > 0
                            ? (batchStudents.reduce((sum, student) => sum + student.cgpa, 0) / batchStudents.length).toFixed(1)
                            : "0.0"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Attendance</p>
                        <p className="text-lg font-semibold text-green-600">
                          {batchStudents.length > 0
                            ? Math.round(batchStudents.reduce((sum, student) => sum + student.attendance, 0) / batchStudents.length)
                            : 0
                          }%
                        </p>
                      </div>
                    </div>
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
              </details>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
