# Admin Role Assignment Implementation Guide

## Overview

This guide explains how to implement the admin functionality to assign and manage multiple roles for users.

## Current State

- Users register as "faculty" (no role selection)
- The `AuthContext` now supports `assignedRoles` (array of roles)
- `RoleSwitcher` displays all assigned roles to the user

## Backend Implementation Steps

### 1. Update Registration Endpoint

**Endpoint:** `POST /api/auth/register`

```typescript
// Remove role from request body
// Register user with default role "faculty"

const user = {
  id: generateId(),
  email: formData.email,
  password: hashPassword(formData.password),
  fullName: formData.fullName,
  department: formData.department,
  role: "faculty", // Default role
  roles: ["faculty"], // Array for future role assignments
  approved: false, // Awaiting admin approval
  createdAt: new Date(),
};
```

### 2. Create Admin Role Assignment Endpoint

**Endpoint:** `PUT /api/admin/users/{userId}/roles`

```typescript
// Request body
{
  roles: ["faculty", "auditor", "staff-advisor"]  // Array of role IDs
}

// Response
{
  id: string;
  email: string;
  name: string;
  role: string;              // Current/primary role
  roles: UserRole[];         // All assigned roles
  department: string;
}

// Validation rules:
// - "faculty" role should always be present
// - Only admins can modify roles
// - Cannot remove all roles from a user
// - Cannot assign admin role (only self-assign or other admins can)
```

### 3. Update Login Response

**Endpoint:** `POST /api/auth/login`

```typescript
// Response should include roles array
{
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;              // Current/primary role
  roles: UserRole[];         // All assigned roles (new)
  department: string;
  approved: boolean;
}
```

### 4. Update User Approval Endpoint (if exists)

When admin approves a user, ensure:

- Set `approved: true`
- Set `role` to "faculty"
- Initialize `roles: ["faculty"]`

```typescript
PATCH /api/admin/users/{userId}/approve
{
  approved: true,
  role: "faculty",
  roles: ["faculty"]
}
```

## Frontend Integration

### Update Login Handler

In `src/context/AuthContext.tsx`, the login function already handles the `roles` array:

```typescript
const login = (authUser: AuthUser) => {
  // ...
  const roles = authUser.roles || [authUser.role]; // Falls back to single role
  setAssignedRoles(roles);
  // ...
};
```

### Admin Dashboard Updates

If you have an admin user management interface, add a role editor:

```typescript
// Component to edit user roles
interface RoleEditorProps {
  userId: string;
  currentRoles: UserRole[];
  onSave: (roles: UserRole[]) => Promise<void>;
}

// Should show checkboxes for each available role
// Faculty checkbox should be disabled (always required)
// Allow toggling auditor, staff-advisor, admin
```

## Database Schema

### Users Table

```sql
ALTER TABLE users ADD COLUMN roles TEXT;  -- JSON array: ["faculty", "auditor"]
ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT false;

-- Migrate existing data:
UPDATE users SET roles = JSON_ARRAY(role) WHERE roles IS NULL;
```

### Audit Trail (Optional)

```sql
CREATE TABLE role_audit_log (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  changedBy UUID REFERENCES users(id),
  oldRoles TEXT,      -- JSON array
  newRoles TEXT,      -- JSON array
  changedAt TIMESTAMP,
  reason TEXT
);
```

## Testing Scenarios

### Scenario 1: Faculty gets promoted to Auditor

1. User registers as faculty
2. Admin approves user registration
3. Admin assigns "auditor" role
4. User logs in and sees both "Faculty Portal" and "Auditor Portal"
5. User can click to switch between portals
6. Data is role-specific (faculty course files vs audit reports)

### Scenario 2: Admin setup (if self-assign is allowed)

1. Initial user registers
2. System or another admin assigns "admin" role
3. User can see Admin, Faculty, and any other assigned roles
4. User manages other users' roles

### Scenario 3: Role revocation

1. User with [faculty, auditor] roles
2. Admin removes auditor role
3. User now only has [faculty]
4. Auditor portal button disappears on next login/refresh
5. If currently on auditor page, redirect to faculty dashboard

## API Response Examples

### Login with Multiple Roles

```json
{
  "id": "user123",
  "username": "john.doe",
  "name": "Dr. John Doe",
  "email": "john@college.edu",
  "role": "auditor",
  "roles": ["faculty", "auditor"],
  "department": "Computer Science",
  "approved": true
}
```

### Get User (with roles)

```json
{
  "id": "user123",
  "email": "john@college.edu",
  "fullName": "Dr. John Doe",
  "department": "Computer Science",
  "role": "auditor",
  "roles": ["faculty", "auditor"],
  "approved": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-02-18T14:30:00Z"
}
```

### Assign Roles Response

```json
{
  "success": true,
  "message": "Roles updated successfully",
  "user": {
    "id": "user123",
    "email": "john@college.edu",
    "name": "Dr. John Doe",
    "roles": ["faculty", "auditor"],
    "previousRoles": ["faculty"],
    "changedAt": "2024-02-18T14:35:00Z"
  }
}
```

## Validation Rules (Backend)

1. **Faculty Required**: Every user must have "faculty" role
2. **No Empty Roles**: Cannot assign empty roles array
3. **Valid Roles Only**: Only use roles from enum: `["faculty", "auditor", "staff-advisor", "admin"]`
4. **Admin Restriction**: Only admins can modify roles (use authentication middleware)
5. **Self-Assignment**: Consider protecting admin role assignment
6. **Approval First**: Cannot assign roles to unapproved users

## Error Handling

```typescript
// Role assignment errors
{
  "error": "INVALID_ROLES",
  "message": "Faculty role cannot be removed",
  "timestamp": "2024-02-18T14:35:00Z"
}

{
  "error": "UNAUTHORIZED",
  "message": "Only admins can assign roles",
  "timestamp": "2024-02-18T14:35:00Z"
}

{
  "error": "USER_NOT_FOUND",
  "message": "User not found",
  "timestamp": "2024-02-18T14:35:00Z"
}
```

## Implementation Order

1. Update database schema to add `roles` column
2. Implement role assignment endpoint
3. Update login endpoint to return roles array
4. Test with multiple roles in admin interface
5. Verify role switching works in frontend
6. Test access control for each role
