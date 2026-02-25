"use client";

import { useMemo, useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FacultyStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
}

const emptyForm: FacultyStudent = {
  id: "",
  name: "",
  email: "",
  department: "",
  year: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentRoster() {
  const { user } = useAuth();
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [form, setForm] = useState<FacultyStudent>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FacultyStudent, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name)),
    [students],
  );

  // Load students from API on mount
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoadingInitial(true);
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          if (data.students && Array.isArray(data.students)) {
            // Map API students to FacultyStudent format
            const mappedStudents = data.students.map((student: any) => ({
              id: student.rollNumber || student.id,
              name: student.name,
              email: student.email,
              department: student.department,
              year: student.batchYear,
            }));
            setStudents(mappedStudents);
          }
        }
      } catch (error) {
        console.error("Failed to load students:", error);
        toast.error("Failed to load students");
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadStudents();
  }, []);

  const handleChange = (field: keyof FacultyStudent, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FacultyStudent, string>> = {};
    const trimmedId = form.id.trim();
    const trimmedEmail = form.email.trim();

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }
    if (!trimmedId) {
      nextErrors.id = "Student ID is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!form.department.trim()) {
      nextErrors.department = "Department is required.";
    }
    if (!form.year.trim()) {
      nextErrors.year = "Year is required.";
    }
    if (
      trimmedId &&
      students.some(
        (student) => student.id.toLowerCase() === trimmedId.toLowerCase(),
      )
    ) {
      nextErrors.id = "Student ID already exists.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const newStudent: FacultyStudent = {
      id: form.id.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      year: form.year.trim(),
    };

    try {
      setIsLoading(true);
      // Create student via API
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advisorId: user?.id || "unknown",
          name: newStudent.name,
          rollNumber: newStudent.id,
          email: newStudent.email,
          phone: "",
          department: newStudent.department,
          semester: "1",
          batchYear: newStudent.year,
          cgpa: 0,
          attendance: 0,
          careerInterest: "",
          skillsAcquired: [],
          placementStatus: "Not Started",
          activityPoints: 0,
          activities: [],
        }),
      });

      if (response.ok) {
        setStudents((prev) => [newStudent, ...prev]);
        setForm(emptyForm);
        toast.success("Student added successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="gap-2">
        <div>
          <CardTitle className="text-lg">Student Roster</CardTitle>
          <CardDescription>Add students to your faculty list.</CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">{students.length}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-name">Name</Label>
              <Input
                id="student-name"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Priya Sharma"
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                value={form.id}
                onChange={(event) => handleChange("id", event.target.value)}
                placeholder="CS23-104"
              />
              {errors.id && <p className="text-xs text-red-600">{errors.id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="student@college.edu"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-department">Department</Label>
              <Input
                id="student-department"
                value={form.department}
                onChange={(event) =>
                  handleChange("department", event.target.value)
                }
                placeholder="Computer Science"
              />
              {errors.department && (
                <p className="text-xs text-red-600">{errors.department}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student-year">Year</Label>
              <Input
                id="student-year"
                value={form.year}
                onChange={(event) => handleChange("year", event.target.value)}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-xs text-red-600">{errors.year}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {isLoadingInitial ? (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          ) : sortedStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students added yet.
            </p>
          ) : (
            sortedStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.id} · {student.department} · {student.year}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {student.email}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
