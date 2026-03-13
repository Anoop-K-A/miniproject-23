# Frontend Integration Guide

This guide shows how to update your Next.js frontend to use the new Express.js backend instead of JSON files.

---

## 📁 Files to Update

### 1. Create API Client Service

Create `src/lib/api.ts`:

```typescript
// src/lib/api.ts
import { auth } from "./firebase"; // Your existing Firebase config

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API client methods
 */
export const api = {
  // Authentication
  auth: {
    register: (data: {
      email: string;
      password: string;
      fullName: string;
      role: string;
      department: string;
    }) =>
      apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    verifyToken: (token: string) =>
      apiRequest("/api/auth/verify-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
  },

  // Users
  users: {
    getAll: () => apiRequest<any[]>("/api/users"),

    getById: (id: string) => apiRequest<any>(`/api/users/${id}`),

    getAllFaculty: () => apiRequest<any[]>("/api/users/faculty/all"),

    update: (id: string, data: Partial<any>) =>
      apiRequest(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Admin
  admin: {
    getPendingUsers: () => apiRequest<any[]>("/api/admin/users/pending"),

    verifyUser: (id: string, status: "active" | "rejected") =>
      apiRequest(`/api/admin/users/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    updateRoles: (id: string, roles: string[]) =>
      apiRequest(`/api/admin/users/${id}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roles }),
      }),

    deleteUser: (id: string) =>
      apiRequest(`/api/admin/users/${id}`, { method: "DELETE" }),

    getStats: () => apiRequest<any>("/api/admin/stats"),
  },

  // Course Files
  courseFiles: {
    upload: (formData: FormData) =>
      apiRequest("/api/course-files/upload", {
        method: "POST",
        body: formData,
      }),

    getAll: (filters?: {
      facultyId?: string;
      status?: string;
      courseCode?: string;
      academicYear?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return apiRequest<any[]>(`/api/course-files?${params.toString()}`);
    },

    getById: (id: string) => apiRequest<any>(`/api/course-files/${id}`),

    update: (id: string, data: Partial<any>) =>
      apiRequest(`/api/course-files/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest(`/api/course-files/${id}`, { method: "DELETE" }),
  },

  // Responsibilities
  responsibilities: {
    getAll: (filters?: { facultyId?: string; type?: string }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return apiRequest<any[]>(`/api/responsibilities?${params.toString()}`);
    },

    create: (data: any) =>
      apiRequest("/api/responsibilities", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<any>) =>
      apiRequest(`/api/responsibilities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest(`/api/responsibilities/${id}`, { method: "DELETE" }),
  },

  // Event Reports
  eventReports: {
    getAll: (filters?: {
      facultyId?: string;
      status?: string;
      eventType?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      return apiRequest<any[]>(`/api/event-reports?${params.toString()}`);
    },

    create: (formData: FormData) =>
      apiRequest("/api/event-reports", {
        method: "POST",
        body: formData,
      }),

    getById: (id: string) => apiRequest<any>(`/api/event-reports/${id}`),

    update: (id: string, data: Partial<any>) =>
      apiRequest(`/api/event-reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest(`/api/event-reports/${id}`, { method: "DELETE" }),
  },
};

export default api;
```

---

## 🔄 Update Existing Components

### 2. Update Registration Component

Find your signup/register component and update it:

```typescript
// Example: src/components/AuthPage/SignUpForm.tsx

import { useState } from "react";
import api from "@/lib/api";

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.auth.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        department: formData.department,
      });

      // Show success message
      alert("Registration successful! Please wait for admin approval.");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 3. Update Login Flow

```typescript
// Example: src/components/AuthPage/SignInForm.tsx

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function SignInForm() {
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get ID token
      const token = await userCredential.user.getIdToken();

      // Verify with backend (optional, for additional validation)
      const userData = await api.auth.verifyToken(token);

      // Update auth context
      login({
        id: userCredential.user.uid,
        username: userData.user.email,
        name: userData.user.name,
        role: userData.user.role,
        roles: userData.user.roles,
        department: userData.user.department,
      });

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message.includes("pending approval")) {
        setError("Your account is pending admin approval");
      } else {
        setError("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 4. Update Course File Upload

```typescript
// Example: src/components/CourseFileManager/CourseFileManager.tsx

import api from "@/lib/api";

export function CourseFileManager() {
  const handleFileUpload = async (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseCode", metadata.courseCode);
    formData.append("courseName", metadata.courseName);
    formData.append("fileType", metadata.fileType);
    formData.append("semester", metadata.semester);
    formData.append("academicYear", metadata.academicYear);

    try {
      const result = await api.courseFiles.upload(formData);
      console.log("Upload successful:", result);

      // Refresh file list
      fetchFiles();
    } catch (error: any) {
      console.error("Upload failed:", error.message);
    }
  };

  const fetchFiles = async () => {
    try {
      const files = await api.courseFiles.getAll({
        facultyId: user?.id,
      });
      setFiles(files);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  // ... rest of component
}
```

### 5. Update Admin User Verification

```typescript
// Example: src/components/AdminDashboard/UserManagement.tsx

import api from "@/lib/api";

export function UserManagement() {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const users = await api.admin.getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.admin.verifyUser(userId, "active");

      // Refresh list
      fetchPendingUsers();

      alert("User approved successfully");
    } catch (error: any) {
      alert("Failed to approve user: " + error.message);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.admin.verifyUser(userId, "rejected");
      fetchPendingUsers();
      alert("User rejected");
    } catch (error: any) {
      alert("Failed to reject user: " + error.message);
    }
  };

  // ... rest of component
}
```

---

## 🔧 Update Environment Variables

Add to `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# For production:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 🗑️ Remove JSON File Dependencies

### Files to Stop Using:

- `src/lib/jsonDb.ts` - No longer needed
- JSON read/write operations in API routes

### Keep as Backup:

- Keep JSON files in `src/data/` as backup until migration is verified
- Don't delete them immediately

---

## ✅ Testing Checklist

After updating the frontend:

- [ ] Registration creates Firebase user and Firestore document
- [ ] Login works with Firebase Authentication
- [ ] Admin can see and approve pending users
- [ ] File upload saves to Firebase Storage
- [ ] File metadata is saved in Firestore
- [ ] Faculty can view their own files
- [ ] Auditor can view all files
- [ ] Admin has full access
- [ ] Responsibilities can be assigned
- [ ] Event reports can be created with images
- [ ] All existing features work as before

---

## 🐛 Common Frontend Issues

### Issue: "Cannot read token"

**Solution**: Ensure user is logged in via Firebase before making API requests

### Issue: "CORS error"

**Solution**:

- Backend must be running
- `FRONTEND_URL` in backend `.env.local` must match your frontend URL

### Issue: "401 Unauthorized"

**Solution**:

- Check that Firebase ID token is being sent correctly
- Verify token format: `Authorization: Bearer <token>`

### Issue: "File upload returns 400"

**Solution**:

- Ensure all required fields are included in FormData
- Check file size (max 50MB)
- Check file type (PDF, DOC, XLS, etc.)

---

## 📊 Migration Strategy

### Phase 1: Parallel Operation

1. Keep JSON file system working
2. Add backend API calls alongside
3. Compare results to verify correctness

### Phase 2: Switch to Backend

1. Update all components to use API client
2. Test each feature thoroughly
3. Monitor for errors

### Phase 3: Cleanup

1. Remove JSON file dependencies
2. Archive JSON files
3. Remove unused code

---

## 🔗 Example Usage Patterns

### Pattern 1: Fetch Data on Component Mount

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await api.courseFiles.getAll();
      setData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  fetchData();
}, []);
```

### Pattern 2: Handle Form Submission

```typescript
const handleSubmit = async (formData: any) => {
  setLoading(true);
  try {
    await api.responsibilities.create(formData);
    onSuccess();
  } catch (error: any) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 3: Protected Route Check

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const token = await user.getIdToken();
    try {
      await api.auth.verifyToken(token);
    } catch (error) {
      router.push("/login");
    }
  };

  checkAuth();
}, []);
```

---

## 📝 Notes

- Always handle errors gracefully
- Show loading states during API calls
- Provide user feedback for all actions
- Keep token refresh logic in place (Firebase handles this)
- Consider adding retry logic for failed requests
- Implement proper error boundaries

---

## 🎯 Next Steps

1. Create the `api.ts` client file
2. Update authentication components first
3. Then update data fetching components
4. Test each feature after updating
5. Remove JSON file dependencies last
6. Deploy and monitor

---

**Happy Coding!** 🚀
