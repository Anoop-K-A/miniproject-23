# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Next.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AuthPage (SignIn/SignUp)                                │   │
│  │  ├─ No Role Selection                                    │   │
│  │  └─ Calls /api/auth/register & /api/auth/login         │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                   │
│               ↓                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AuthContext                                             │   │
│  │  ├─ isAuthenticated: boolean                            │   │
│  │  ├─ userRole: UserRole (current)                        │   │
│  │  ├─ assignedRoles: UserRole[] (all roles)               │   │
│  │  └─ user: AuthUser { role, roles: [] }                 │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                   │
│  ┌────────────┴─────────────────────────────────────┐            │
│  ↓                                                   ↓            │
│  ┌──────────────────────┐      ┌──────────────────────────┐     │
│  │  RoleSwitcher        │      │  Dashboard Layouts       │     │
│  │  ├─ currentRole      │      │  ├─ Faculty              │     │
│  │  ├─ assignedRoles    │      │  ├─ Auditor              │     │
│  │  └─ onRoleChange()   │      │  ├─ Staff Advisor        │     │
│  └─────────┬────────────┘      │  └─ Admin                │     │
│            │                   └────────┬─────────────────┘     │
│            └───────────────────────────┬──────────────────────┘  │
│                                        │                         │
│                                        ↓                         │
│                            ┌──────────────────────┐              │
│                            │  Main Content       │              │
│                            │  (Role-specific)    │              │
│                            └──────────────────────┘              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LocalStorage                                            │   │
│  │  ├─ auth_authenticated: "true"                          │   │
│  │  ├─ auth_role: "faculty" | "auditor" | ...             │   │
│  │  ├─ auth_roles: ["faculty", "auditor"]                 │   │
│  │  └─ auth_user: { role, roles: [] }                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Database)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐  ┌──────────────────────┐              │
│  │ Auth Endpoints      │  │ Admin Endpoints      │              │
│  │ ├─ POST /register   │  │ ├─ PUT /users/{}/roles│             │
│  │ ├─ POST /login      │  │ ├─ GET /users        │              │
│  │ └─ POST /logout     │  │ └─ PATCH /users/{}/  │              │
│  └─────────┬───────────┘  │   approve            │              │
│            │              └──────────┬───────────┘              │
│            └──────────────┬──────────┘                          │
│                           ↓                                    │
│                  ┌──────────────────┐                         │
│                  │  Database        │                         │
│                  │  ├─ users table  │                         │
│                  │  │  ├─ id        │                         │
│                  │  │  ├─ email     │                         │
│                  │  │  ├─ role      │                         │
│                  │  │  ├─ roles[]   │                         │
│                  │  │  └─ approved  │                         │
│                  │  └─ ...          │                         │
│                  └──────────────────┘                         │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Registration Flow

```
START
  │
  ├─ User navigates to /register
  │
  ├─ SignUpForm renders
  │  ├─ Full Name field
  │  ├─ Email field
  │  ├─ Department field
  │  ├─ Password field
  │  ├─ Confirm Password field
  │  └─ [Create Account] button
  │     (NO ROLE SELECTION)
  │
  ├─ User fills form & submits
  │
  ├─ handleSubmit() validates
  │  ├─ All required fields present
  │  ├─ Passwords match
  │  ├─ Password length >= 6
  │  └─ Email format valid
  │
  ├─ POST /api/auth/register with:
  │  {
  │    email: string
  │    password: string
  │    fullName: string
  │    department: string
  │    (NO ROLE FIELD)
  │  }
  │
  ├─ Backend:
  │  ├─ Validates input
  │  ├─ Creates user with:
  │  │  ├─ role: "faculty"
  │  │  ├─ roles: ["faculty"]
  │  │  └─ approved: false
  │  └─ Returns success
  │
  ├─ Toast: "Account created! Await admin approval"
  │
  ├─ Redirect to /login
  │
  └─ END

User Status at this point:
├─ Email verified: ✓
├─ Account created: ✓
├─ Role assigned: faculty ✓
├─ Admin approval: WAITING ⏳
└─ Can login: NO ✗ (until approved)
```

---

## Admin Role Assignment Flow

```
ADMIN WORKFLOW

  ┌─ Admin Dashboard
  │
  ├─ View Users List
  │  └─ Shows: Name | Email | Role | Roles
  │
  ├─ Find pending approval user
  │
  ├─ Click [Approve] on user
  │  └─ PATCH /api/admin/users/{id}/approve
  │     └─ Sets: approved = true
  │
  ├─ User now visible in approved users
  │
  ├─ Click [Edit Roles] on user
  │
  ├─ Role Editor Dialog opens
  │  ├─ [✓] Faculty (disabled - always required)
  │  ├─ [ ] Auditor  (unchecked)
  │  ├─ [ ] Staff Advisor (unchecked)
  │  ├─ [ ] Admin (unchecked)
  │  └─ [Save] button
  │
  ├─ Admin checks "Auditor" checkbox
  │
  ├─ Click [Save]
  │
  ├─ PUT /api/admin/users/{id}/roles with:
  │  {
  │    roles: ["faculty", "auditor"]
  │  }
  │
  ├─ Backend:
  │  ├─ Validates request
  │  ├─ Checks faculty included
  │  ├─ Updates user.roles = ["faculty", "auditor"]
  │  └─ Returns success
  │
  ├─ Toast: "Roles updated successfully"
  │
  ├─ User list updates to show:
  │  │ Name | Email | Roles
  │  │ John | ... | Faculty, Auditor
  │
  └─ END

Result:
├─ User roles updated: ["faculty", "auditor"] ✓
├─ Change logged in audit trail (optional)
├─ User needs to re-login to see new roles
└─ User will see both Faculty & Auditor portals
```

---

## User Login & Role Selection Flow

```
USER LOGIN WORKFLOW

START
  │
  ├─ User visits /login
  │
  ├─ SignInForm renders
  │  ├─ Email field
  │  └─ Password field
  │
  ├─ User enters credentials
  │
  ├─ Click [Sign In]
  │
  ├─ handleSubmit() validates
  │  ├─ Email present
  │  └─ Password present
  │
  ├─ POST /api/auth/login with:
  │  {
  │    email: string
  │    password: string
  │  }
  │
  ├─ Backend:
  │  ├─ Validates credentials
  │  ├─ Checks approved = true
  │  ├─ Fetches user with:
  │  │  ├─ role: "faculty" (or current)
  │  │  └─ roles: ["faculty", "auditor"]
  │  └─ Returns user
  │
  ├─ Frontend receives response
  │
  ├─ AuthContext.login(user) called via:
  │  ├─ setIsAuthenticated(true)
  │  ├─ setUserRole(user.role)
  │  ├─ setAssignedRoles(user.roles)
  │  ├─ Saves to localStorage
  │  └─ Saves auth_roles = ["faculty", "auditor"]
  │
  ├─ Toast: "Sign in successful!"
  │
  ├─ Redirect to /faculty/dashboard
  │
  ├─ FacultyLayout renders:
  │  ├─ Check: assignedRoles.includes("faculty") ✓
  │  ├─ RoleSwitcher with:
  │  │  ├─ assignedRoles = ["faculty", "auditor"]
  │  │  ├─ currentRole = "faculty"
  │  │  └─ Shows buttons:
  │  │     ├─ [Faculty Portal] ← active (default variant)
  │  │     └─ [Auditor Portal] (outline variant)
  │  │
  │  ├─ User sees 2 role buttons
  │  │
  │  └─ MainContent displays Faculty dashboard
  │
  ├─ User clicks [Auditor Portal] button
  │
  ├─ handleRoleChange("auditor") called:
  │  ├─ AuthContext.switchRole("auditor")
  │  │  ├─ setUserRole("auditor")
  │  │  ├─ Update localStorage auth_role
  │  │  └─ Return
  │  │
  │  ├─ router.push("/auditor/dashboard")
  │  └─ Navigate to auditor page
  │
  ├─ AuditorLayout renders:
  │  ├─ Check: assignedRoles.includes("auditor") ✓
  │  ├─ RoleSwitcher shows same 2 buttons
  │  │  ├─ [Faculty Portal] (outline variant)
  │  │  └─ [Auditor Portal] ← active (default variant)
  │  │
  │  └─ MainContent displays Auditor dashboard
  │
  ├─ User can click between portals
  │
  ├─ Page refresh:
  │  ├─ Load from localStorage
  │  ├─ Restore currentRole: "auditor"
  │  ├─ Restore assignedRoles: ["faculty", "auditor"]
  │  └─ Stay on auditor dashboard
  │
  └─ END

Result:
├─ User authenticated: ✓
├─ Can access faculty dashboard: ✓
├─ Can access auditor dashboard: ✓
├─ Can switch between roles: ✓
├─ Session persists: ✓
└─ Logout clears all: ✓
```

---

## State Management Flow

```
KEY STATE TRANSITIONS

1. BEFORE LOGIN
   ┌─────────────────────────────┐
   │ AuthContext                 │
   │ ├─ isAuthenticated: false   │
   │ ├─ userRole: "faculty"      │
   │ ├─ assignedRoles: []        │
   │ ├─ user: null               │
   │ └─ isLoading: true          │
   └─────────────────────────────┘

2. AFTER REGISTER
   ┌─────────────────────────────┐
   │ AuthContext                 │
   │ ├─ isAuthenticated: false   │
   │ ├─ userRole: "faculty"      │
   │ ├─ assignedRoles: []        │
   │ ├─ user: null               │
   │ └─ isLoading: false         │
   └─────────────────────────────┘
   (User still not authenticated, awaiting approval)

3. AFTER LOGIN (with multi-role)
   ┌──────────────────────────────────────┐
   │ AuthContext                          │
   │ ├─ isAuthenticated: true             │
   │ ├─ userRole: "faculty"               │
   │ ├─ assignedRoles: ["faculty",        │
   │ │                   "auditor"]       │
   │ ├─ user: {                           │
   │ │   id: "...",                       │
   │ │   name: "...",                     │
   │ │   role: "faculty",                 │
   │ │   roles: ["faculty", "auditor"]    │
   │ │ }                                  │
   │ └─ isLoading: false                  │
   └──────────────────────────────────────┘

4. AFTER switchRole("auditor")
   ┌──────────────────────────────────────┐
   │ AuthContext                          │
   │ ├─ isAuthenticated: true             │
   │ ├─ userRole: "auditor" ← CHANGED    │
   │ ├─ assignedRoles: ["faculty",        │
   │ │                   "auditor"]       │
   │ ├─ user: {                           │
   │ │   id: "...",                       │
   │ │   name: "...",                     │
   │ │   role: "auditor", ← CHANGED      │
   │ │   roles: ["faculty", "auditor"]    │
   │ │ }                                  │
   │ └─ isLoading: false                  │
   └──────────────────────────────────────┘

5. AFTER LOGOUT
   ┌─────────────────────────────┐
   │ AuthContext                 │
   │ ├─ isAuthenticated: false   │
   │ ├─ userRole: "faculty"      │
   │ ├─ assignedRoles: []        │
   │ ├─ user: null               │
   │ └─ isLoading: false         │
   └─────────────────────────────┘
```

---

## Component Hierarchy

```
App
├─ AuthProvider
│  ├─ isAuthenticated: false → AuthPage
│  │  ├─ SignInForm
│  │  └─ SignUpForm
│  │
│  └─ isAuthenticated: true → MainLayout
│     ├─ AppHeader
│     ├─ MainContent
│     │  └─ Routes:
│     │     ├─ /faculty/dashboard
│     │     │  └─ FacultyLayout
│     │     │     ├─ RoleSwitcher (shows: Faculty, Auditor)
│     │     │     └─ FacultyDashboard
│     │     │
│     │     ├─ /auditor/dashboard
│     │     │  └─ AuditorLayout
│     │     │     ├─ RoleSwitcher (shows: Faculty, Auditor)
│     │     │     └─ AuditorDashboard
│     │     │
│     │     ├─ /staff-advisor/dashboard
│     │     │  └─ StaffAdvisorLayout
│     │     │     ├─ RoleSwitcher
│     │     │     └─ StaffAdvisorDashboard
│     │     │
│     │     └─ /admin
│     │        └─ AdminLayout
│     │           ├─ RoleSwitcher
│     │           └─ AdminDashboard
│     │
│     └─ AppFooter
```

---

## Data Flow Diagram (Multi-Role)

```
┌────────────────┐
│ User logs in   │
│ with roles:    │
│ ["faculty",    │
│  "auditor"]    │
└────────┬───────┘
         │
         ↓
┌──────────────────────┐
│ AuthContext.login()  │
│ Sets:                │
│ ├─ userRole = first  │
│ │  from roles array  │
│ ├─ assignedRoles =   │
│ │  full roles array  │
│ └─ Saves to LS       │
└────────┬─────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌──────────┐ ┌───────────┐
│ Context  │ │LocalStorage
│          │ │ roles: [] │
│assignedRoles:
│ ["faculty",
│  "auditor"]
└──────────┘ └───────────┘
     │
     ↓ (provided to all children)
┌─────────────────────────────────────┐
│ RoleSwitcher receives:              │
│ ├─ currentRole: "faculty"           │
│ ├─ assignedRoles: ["faculty",       │
│ │                  "auditor"]       │
│ └─ onRoleChange: callback           │
└──────────────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    ┌────────┐                   ┌────────┐
    │Faculty │                   │Auditor │
    │Button  │                   │Button  │
    │(active)│                   │(other) │
    └────┬───┘                   └────┬───┘
         │                            │
         │ on click Faculty           │ on click Auditor
         │                            │
         ↓                            ↓
    currentRole=faculty          currentRole=auditor
    routes to                    routes to
    /faculty/dashboard           /auditor/dashboard
```

---

## API Response Examples

### Register Response

```json
{
  "success": true,
  "message": "User created successfully. Awaiting admin approval.",
  "user": {
    "id": "usr_123abc",
    "email": "john@college.edu",
    "fullName": "Dr. John Doe",
    "department": "Computer Science",
    "role": "faculty",
    "roles": ["faculty"],
    "approved": false,
    "createdAt": "2024-02-18T10:00:00Z"
  }
}
```

### Login Response (Multi-Role)

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "usr_123abc",
    "email": "john@college.edu",
    "username": "john.doe",
    "fullName": "Dr. John Doe",
    "department": "Computer Science",
    "role": "faculty",
    "roles": ["faculty", "auditor"],
    "approved": true,
    "lastLogin": "2024-02-18T14:30:00Z"
  }
}
```

### Assign Roles Response

```json
{
  "success": true,
  "message": "Roles updated successfully",
  "user": {
    "id": "usr_123abc",
    "email": "john@college.edu",
    "fullName": "Dr. John Doe",
    "role": "faculty",
    "roles": ["faculty", "auditor"],
    "changedAt": "2024-02-18T15:00:00Z",
    "changedBy": "admin_456def"
  }
}
```

---

## Error Handling Flow

```
API Error Response
│
├─ 400 Bad Request
│  └─ Invalid role combination
│     └─ Frontend shows toast: "Faculty role is required"
│
├─ 401 Unauthorized
│  ├─ User not authenticated → Redirect to /login
│  └─ User lacks permission → Toast error, no action
│
├─ 403 Forbidden
│  └─ Not approved yet → Toast: "Awaiting admin approval"
│
├─ 404 Not Found
│  └─ User not found → Redirect to /login
│
└─ 500 Server Error
   └─ Toast: "An error occurred. Please try again later"
```

---

## Summary

This implementation provides a flexible, type-safe role management system that supports:

- ✅ Simple registration without role selection
- ✅ Multi-role user assignments
- ✅ Intuitive role switching UI
- ✅ Proper access control validation
- ✅ Session persistence
- ✅ Clear error handling

All components communicate through AuthContext, ensuring consistent state management across the application.
