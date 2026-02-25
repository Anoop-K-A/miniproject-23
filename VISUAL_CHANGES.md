# Visual Changes Guide

## Registration Form Changes

### BEFORE

```
Sign-up Form
├─ Full Name          [______________]
├─ Email              [______________]
├─ Role              [Select a role ▼]  ← REMOVED
│  ├─ Faculty
│  ├─ Auditor
│  └─ Staff Advisor
├─ Department        [______________]
├─ Password          [______________]
├─ Confirm Password  [______________]
└─ [Create Account]
```

### AFTER

```
Sign-up Form
├─ Full Name         [______________]
├─ Email             [______________]
├─ Department        [______________]
├─ Password          [______________]
├─ Confirm Password  [______________]
└─ [Create Account]

✓ User automatically registered as "Faculty"
✓ Admin will assign additional roles later
```

---

## Role Switcher Changes

### BEFORE: Single Role

```
┌─────────────────────────────────────┐
│      Faculty Portal                 │  ← Only shows current role
└─────────────────────────────────────┘

Dashboard
└─ Faculty content only
```

### AFTER: Multiple Roles

```
┌──────────────────┬──────────────────┐
│ Faculty Portal   │ Auditor Portal   │  ← Shows all assigned roles
│ (selected)       │ (not selected)   │
└──────────────────┴──────────────────┘

Click to switch roles:
├─ Faculty Portal (currently viewing)
│  └─ Faculty dashboard & content
│
└─ Auditor Portal (can access)
   └─ Auditor dashboard & content
```

---

## Admin Dashboard - Before & After

### BEFORE: User with Single Role

```
┌──────────────────────────────────────┐
│ Users Management                     │
├──────────────────────────────────────┤
│ Name     | Email        | Role       │
│ John Doe | john@col.edu | Faculty    │
│ Jane Doe | jane@col.edu | Auditor    │
└──────────────────────────────────────┘

Single role permanently assigned
```

### AFTER: User with Multiple Roles

```
┌──────────────────────────────────────────┐
│ Users Management                         │
├──────────────────────────────────────────┤
│ Name     | Email        | Roles          │
│ John Doe | john@col.edu | Faculty,      │
│          |              | Auditor        │
│ Jane Doe | jane@col.edu | Faculty        │
└──────────────────────────────────────────┘

Click to edit and assign multiple roles:
[✓] Faculty (always required)
[✓] Auditor (assigned)
[ ] Staff Advisor
[ ] Admin
```

---

## User Login & Session Flow

### BEFORE

```
Login
  ↓
Validate Email/Password
  ↓
Set userRole = "faculty" (or assigned single role)
  ↓
Show only that role's dashboard
  ↓
Can only access one role
```

### AFTER

```
Login
  ↓
Validate Email/Password
  ↓
Get assignedRoles = ["faculty", "auditor"]
  ↓
Set currentRole = "faculty" (primary)
Set assignedRoles = ["faculty", "auditor"]
  ↓
Show role switcher with both options
  ↓
Can click to switch between roles
  ↓
Can access all assigned role dashboards
```

---

## Authentication Context State

### BEFORE

```typescript
Shallow copy of user state:

{
  isAuthenticated: true
  userRole: "faculty"          ← Single role
  user: AuthUser {
    role: "faculty"
  }
}
```

### AFTER

```typescript
Enhanced state management:

{
  isAuthenticated: true
  userRole: "faculty"          ← Current active role
  assignedRoles: ["faculty", "auditor"]  ← All roles
  user: AuthUser {
    role: "faculty"
    roles: ["faculty", "auditor"]  ← New property
  }
}
```

---

## RoleSwitcher Logic

### BEFORE

```typescript
// Show only current role
visibleRoles = roles.filter(({ role }) => role === currentRole);

// Result: 1 button
// All roles hardcoded to show only current one
```

### AFTER

```typescript
// Show all assigned roles
visibleRoles = allRoles.filter(({ role }) => assignedRoles.includes(role));

// Result: Multiple buttons
// Shows all roles user has been assigned
// Current role highlighted with "default" variant
// Others show with "outline" variant
```

---

## Access Control Logic

### BEFORE

```typescript
// Strict single-role check
if (userRole !== "faculty") {
  redirect to dashboard
}

// User can only be in one place
```

### AFTER

```typescript
// Flexible multi-role check
if (!assignedRoles.includes("faculty")) {
  redirect to dashboard
}

// User can be in any assigned role
// If accessing faculty page but assigned roles include facau
}
```

---

## Browser Storage Structure

### BEFORE

```typescript
localStorage = {
  auth_authenticated: "true"
  auth_role: "faculty"
  auth_user: {
    id: "...",
    name: "...",
    role: "faculty"
  }
}
```

### AFTER

```typescript
localStorage = {
  auth_authenticated: "true"
  auth_role: "faculty"                    ← Current role
  auth_roles: ["faculty", "auditor"]      ← All roles (NEW)
  auth_user: {
    id: "...",
    name: "...",
    role: "faculty",
    roles: ["faculty", "auditor"]         ← All roles (NEW)
  }
}
```

---

## User Journey Example: Faculty → Auditor

### BEFORE

```
1. Register → Stuck as Faculty forever
   ↓
2. Only see Faculty Portal
   ↓
3. Can't become Auditor without re-registering
```

### AFTER

```
1. Register as Faculty
   ↓
2. Admin approves registration
   ↓
3. Admin assigns "auditor" role
   ↓
4. User logs in → Sees both portals
   ↓
5. Can switch between Faculty ↔ Auditor
   ↓
6. Access both faculty courses AND audit reports
   ↓
7. Admin can later revoke auditor → Back to faculty only
```

---

## Data Flow Diagram

### BEFORE (Single Role)

```
┌──────────────┐
│   Sign-up    │
│  role: user  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Database   │
│  role: user  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Login      │
│  userRole    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Context    │
│  userRole    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Dashboard  │
│  single role │
└──────────────┘
```

### AFTER (Multiple Roles)

```
┌──────────────────┐
│    Sign-up       │
│  role: "faculty" │
│  roles: [...]    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│    Database      │
│  role: "faculty" │
│  roles: [faculty,│
│          auditor]│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│      Login       │
│  returns roles   │
│  [faculty,       │
│   auditor]       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────┐
│  Context             │
│  userRole: faculty   │
│  assignedRoles:      │
│  [faculty, auditor]  │
└────────┬─────────────┘
         │
         ↓
┌──────────────────────┐
│  RoleSwitcher        │
│  Shows: Faculty btn  │
│         Auditor btn  │
└────────┬─────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐┌─────────┐
│ Faculty ││ Auditor │
│Dashboard││Dashboard│
└─────────┘└─────────┘
```

---

## Feature Comparison Table

| Feature               | Before             | After                    |
| --------------------- | ------------------ | ------------------------ |
| **Registration Form** | Asks for role      | Auto-faculty             |
| **Roles Assigned**    | Single, permanent  | Multiple, flexible       |
| **UI Buttons**        | 1 button (current) | N buttons (all assigned) |
| **Role Switching**    | Not possible       | Click buttons            |
| **Access Control**    | `===` check        | `.includes()` check      |
| **Admin Control**     | Limited            | Full control             |
| **Faculty Retention** | Yes                | Always required          |
| **Session Storage**   | Single role        | Roles array              |

---

## Component Update Checklist

✅ **Sign-up Form Components (2 files)**

- Removed role selector UI
- Removed role validation

✅ **Type Definitions (2 files)**

- Removed role from SignUpFormData
- Added roles to AuthUser

✅ **RoleSwitcher (2 files)**

- Added assignedRoles prop
- Updated filter logic
- Added visual distinction

✅ **Dashboard Layouts (4 files)**

- Updated access control logic
- Pass assignedRoles to RoleSwitcher

✅ **Auth Context (1 file)**

- Added assignedRoles state
- Updated login/logout/switchRole

✅ **App Layouts (2 files)**

- Added assignedRoles state
- Pass to RoleSwitcher

---

## File Modification Summary

| File             | Changes               | Lines      |
| ---------------- | --------------------- | ---------- |
| SignUpForm.tsx   | Remove role field     | ~20        |
| RoleSwitcher.tsx | Multi-role logic      | ~15        |
| AuthContext.tsx  | Add assignedRoles     | ~25        |
| Layouts (×4)     | Update access control | ~40        |
| Types (×2)       | Remove role field     | ~10        |
| App Layouts (×2) | Add state & props     | ~15        |
| **TOTAL**        |                       | ~125 lines |

---

## Migration Path from Old to New

```
Step 1: ✅ DONE
  - Remove role from signup UI
  - Remove role from types

Step 2: ✅ DONE
  - Add assignedRoles to AuthContext
  - Update RoleSwitcher logic

Step 3: ✅ DONE
  - Update layouts for multi-role access

Step 4: TODO (Backend)
  - Update registration endpoint
  - Add role assignment endpoint
  - Update login response

Step 5: TODO (Testing)
  - Test signup without role
  - Test admin role assignment
  - Test role switching
```
