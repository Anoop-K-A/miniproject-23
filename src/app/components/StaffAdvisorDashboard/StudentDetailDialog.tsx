import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Student } from "./types";
import { Mail, Phone, Briefcase, Target, Award } from "lucide-react";

interface StudentDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onAddActivity: () => void;
  onUpdateStudent: (student: Student) => void;
}

interface StudentFormState {
  email: string;
  phone: string;
  semester: string;
  placementStatus: Student["placementStatus"];
  companyName: string;
  cgpa: string;
  attendance: string;
  careerInterest: string;
  skillsInput: string;
}

const emptyFormState: StudentFormState = {
  email: "",
  phone: "",
  semester: "",
  placementStatus: "Not Started",
  companyName: "",
  cgpa: "",
  attendance: "",
  careerInterest: "",
  skillsInput: "",
};

const buildFormState = (student: Student | null): StudentFormState =>
  student
    ? {
        email: student.email ?? "",
        phone: student.phone ?? "",
        semester: student.semester ?? "",
        placementStatus: student.placementStatus,
        companyName: student.companyName ?? "",
        cgpa: Number.isFinite(student.cgpa) ? student.cgpa.toString() : "",
        attendance: Number.isFinite(student.attendance)
          ? student.attendance.toString()
          : "",
        careerInterest: student.careerInterest ?? "",
        skillsInput: student.skillsAcquired?.join(", ") ?? "",
      }
    : emptyFormState;

export function StudentDetailDialog({
  isOpen,
  onOpenChange,
  student,
  onAddActivity,
  onUpdateStudent,
}: StudentDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StudentFormState>(() =>
    buildFormState(student),
  );

  useEffect(() => {
    if (student) {
      setForm(buildFormState(student));
      setIsEditing(false);
    }
  }, [student, isOpen]);

  const getPlacementColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-green-100 text-green-800";
      case "In Process":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFormChange = <K extends keyof StudentFormState>(
    field: K,
    value: StudentFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!student) return;
    const parsedCgpa = Number.parseFloat(form.cgpa);
    const parsedAttendance = Number.parseFloat(form.attendance);
    const nextCompany =
      form.placementStatus === "Placed" ? form.companyName.trim() : "";
    const updatedStudent: Student = {
      ...student,
      email: form.email.trim(),
      phone: form.phone.trim(),
      semester: form.semester.trim(),
      placementStatus: form.placementStatus,
      companyName: nextCompany || undefined,
      cgpa: Number.isFinite(parsedCgpa) ? parsedCgpa : 0,
      attendance: Number.isFinite(parsedAttendance)
        ? Math.min(Math.max(parsedAttendance, 0), 100)
        : 0,
      careerInterest: form.careerInterest.trim(),
      skillsAcquired: form.skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    onUpdateStudent(updatedStudent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(buildFormState(student));
    setIsEditing(false);
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            Complete information and progress tracking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{student.name}</h3>
              <p className="text-gray-600">
                {student.rollNumber} • {student.department}
              </p>
              <Badge
                className={getPlacementColor(student.placementStatus) + " mt-2"}
              >
                {student.placementStatus}
              </Badge>
              {student.companyName && (
                <p className="text-sm text-green-600 mt-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Placed at {student.companyName}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-medium mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${student.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {student.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div>
            <h4 className="font-medium mb-3">Academic Performance</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">CGPA</p>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {student.cgpa}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Attendance</p>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {student.attendance}%
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Semester</p>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {student.semester}
                </div>
              </div>
            </div>
          </div>

          {/* Career Information */}
          <div>
            <h4 className="font-medium mb-3">Career Development</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Career Interest</p>
                <Badge variant="outline" className="mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  {student.careerInterest || "Not set"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Skills Acquired</p>
                <div className="flex flex-wrap gap-2">
                  {student.skillsAcquired.length === 0 ? (
                    <Badge variant="outline" className="bg-gray-50">
                      Not set
                    </Badge>
                  ) : (
                    student.skillsAcquired.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50">
                        {skill}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Points */}
          <div>
            <h4 className="font-medium mb-3">Activity Points</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Points</p>
                <Badge variant="outline" className="mt-1">
                  <Award className="h-3 w-3 mr-1" />
                  {student.activityPoints}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Activities</p>
                <div className="flex flex-wrap gap-2">
                  {student.activities.map((activity, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50">
                      {activity.name} ({activity.points} points)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Add Activity Button */}
          <div>
            <h4 className="font-medium mb-3">Edit Student Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleFormChange("email", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    handleFormChange("phone", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input
                  value={form.semester}
                  onChange={(event) =>
                    handleFormChange("semester", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Placement Status</Label>
                <Select
                  value={form.placementStatus}
                  onValueChange={(value) =>
                    handleFormChange(
                      "placementStatus",
                      value as Student["placementStatus"],
                    )
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Placed">Placed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={form.companyName}
                  onChange={(event) =>
                    handleFormChange("companyName", event.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Company for placed students"
                />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.cgpa}
                  onChange={(event) =>
                    handleFormChange("cgpa", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Attendance %</Label>
                <Input
                  type="number"
                  value={form.attendance}
                  onChange={(event) =>
                    handleFormChange("attendance", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Career Interest</Label>
                <Input
                  value={form.careerInterest}
                  onChange={(event) =>
                    handleFormChange("careerInterest", event.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Skills Acquired</Label>
                <Input
                  value={form.skillsInput}
                  onChange={(event) =>
                    handleFormChange("skillsInput", event.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Java, React, Node.js"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={onAddActivity}>
                  Add Activity
                </Button>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
