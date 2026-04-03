# Admin Dashboard - Engagement & Last Active Tracking Guide

## Overview

The Admin Dashboard now has fully functional **engagement tracking** and **last active timestamp** monitoring across the entire system. These features auto-update whenever faculty members upload files, create reports, or when the admin makes changes.

---

## Data Flow Architecture

```
User Activity (Login/Upload/Report)
    ↓
API Endpoint Updates Data
    ↓
Engagement Recomputation (engagements.ts)
    ↓
Admin Dashboard Fetches Both Users & Engagements
    ↓
Display Updated Stats & Metrics
```

---

## Key Components

### 1. **Last Active Tracking**

**File**: [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)

When a user logs in, their `lastActiveAt` timestamp is automatically updated:

```typescript
// Update lastActiveAt timestamp
const users = await readJsonFile<UserRecord[]>("users.json");
const updatedUsers = users.map((user) =>
  user.id === result.user.id
    ? { ...user, lastActiveAt: new Date().toISOString() }
    : user,
);
await writeJsonFile("users.json", updatedUsers);
```

In the Admin Dashboard, this is formatted for readability:

```typescript
function formatLastActive(isoDate?: string): string {
  // "Just now", "5m ago", "2h ago", "3d ago", etc.
}
```

---

### 2. **Engagement Score Calculation**

**File**: [src/lib/engagements.ts](src/lib/engagements.ts)

Engagement is calculated from four main metrics:

| Metric               | Points      | Notes                   |
| -------------------- | ----------- | ----------------------- |
| **Uploads**          | 10 pts each | Course files uploaded   |
| **Activities**       | 15 pts each | Event reports created   |
| **Responsibilities** | 8 pts each  | Tasks assigned & active |
| **Completions**      | 20 pts each | Courses finished        |

**Formula**:

```
Score = Min(100, uploads*10 + activities*15 + responsibilities*8 + completions*20)
```

---

### 3. **Auto-Recomputation Triggers**

Engagement is automatically recomputed when:

#### a) **Faculty Uploads Course File**

**File**: [src/app/api/course-files/route.ts](src/app/api/course-files/route.ts)

```typescript
export async function POST(request: NextRequest) {
  // ... create file ...

  // Recompute engagement after file upload
  if (payload.facultyId) {
    await recomputeEngagementForFaculty(payload.facultyId);
  }
}
```

#### b) **Faculty Creates Event Report**

**File**: [src/app/api/event-reports/route.ts](src/app/api/event-reports/route.ts)

```typescript
export async function POST(request: NextRequest) {
  // ... create report ...

  // Recompute engagement after report creation
  if (payload.facultyId) {
    await recomputeEngagementForFaculty(payload.facultyId);
  }
}
```

#### c) **Admin Deletes User**

**File**: [src/app/api/users/[id]/route.ts](src/app/api/users/[id]/route.ts#L96-L98)

```typescript
// Clean up engagement records when user deleted
const updatedEngagements = engagements.filter(
  (engagement) => engagement.facultyId !== id,
);
```

---

### 4. **Admin Dashboard Data Fetching**

**File**: [src/components/AdminDashboard/AdminDashboard.tsx](src/components/AdminDashboard/AdminDashboard.tsx#L149-L175)

The dashboard makes **two parallel API calls**:

```typescript
const fetchUsers = async () => {
  const [usersResponse, engagementResponse] = await Promise.all([
    fetch("/api/users"),
    fetch("/api/engagements"),
  ]);

  // Map engagements by facultyId for O(1) lookup
  const engagementMap = (engagementData.engagements ?? []).reduce(
    (acc: Record<string, any>, eng: any) => {
      acc[eng.facultyId] = eng;
      return acc;
    },
    {},
  );

  // Merge user and engagement data
  const mappedUsers = (usersData.users as ApiUser[]).map((user) =>
    mapApiUser(user, engagementMap),
  );
};
```

---

### 5. **Data Mapping Function**

**File**: [src/components/AdminDashboard/AdminDashboard.tsx#L93-L130](src/components/AdminDashboard/AdminDashboard.tsx#L93-L130)

This function enriches user data with engagement metrics:

```typescript
function mapApiUser(
  user: ApiUser,
  engagementMap: Record<string, any> = {},
): AdminUser {
  const engagement = engagementMap[user.id] ?? {};

  return {
    // ... basic user info ...
    lastActive: formatLastActive(user.lastActiveAt), // "2h ago"
    courseFilesCount: engagement.uploadsCount ?? 0, // 5 files
    eventReportsCount: engagement.activityParticipationCount ?? 0, // 3 reports
    completionRate: engagement.score ?? 0, // 75%
  };
}
```

---

## Data Files

### Users Table Schema

**File**: [src/data/users.json](src/data/users.json)

```json
[
  {
    "id": "faculty-1",
    "name": "Dr. John Smith",
    "role": "faculty",
    "status": "active",
    "lastActiveAt": "2026-02-17T14:30:00.000Z", // ← Updated on login
    "createdAt": "2026-02-16T00:00:00.000Z",
    "updatedAt": "2026-02-17T00:00:00.000Z"
  }
]
```

### Engagements Table Schema

**File**: [src/data/engagements.json](src/data/engagements.json)

```json
[
  {
    "id": "faculty-1",
    "facultyId": "faculty-1",
    "uploadsCount": 5,
    "activityParticipationCount": 3,
    "responsibilitiesCount": 2,
    "courseCompletionCount": 1,
    "score": 92,
    "updatedAt": "2026-02-17T15:45:00.000Z"
  }
]
```

---

## API Routes

### GET `/api/users`

Returns all users with basic information.

### GET `/api/engagements`

Returns engagement records for all faculty.

**Response**:

```json
{
  "engagements": [
    {
      "facultyId": "faculty-1",
      "uploadsCount": 5,
      "activityParticipationCount": 3,
      "responsibilitiesCount": 2,
      "courseCompletionCount": 1,
      "score": 92,
      "updatedAt": "2026-02-17T15:45:00.000Z"
    }
  ],
  "courseFilesCount": 14,
  "eventReportsCount": 8
}
```

### POST `/api/course-files`

When faculty uploads a file, it triggers `recomputeEngagementForFaculty()`.

### POST `/api/event-reports`

When faculty creates a report, it triggers `recomputeEngagementForFaculty()`.

### PATCH `/api/users/{id}`

Updates user info (name, department, status, etc.). Does NOT trigger engagement recomputation.

### DELETE `/api/users/{id}`

Deletes user AND their engagement record.

---

## Admin Dashboard Display

### User Table Columns

| Column            | Source                                | Format        | Example               |
| ----------------- | ------------------------------------- | ------------- | --------------------- |
| **Name**          | users.name                            | String        | "Dr. John Smith"      |
| **Email**         | users.email                           | String        | "john@college.edu"    |
| **Department**    | users.department                      | String        | "Computer Science"    |
| **Role**          | users.role                            | Badge         | `Faculty` / `Auditor` |
| **Status**        | users.status                          | Badge         | `Active` / `Pending`  |
| **Last Active**   | users.lastActiveAt                    | Relative time | "2h ago"              |
| **Course Files**  | engagement.uploadsCount               | Number        | "5"                   |
| **Event Reports** | engagement.activityParticipationCount | Number        | "3"                   |
| **Engagement**    | engagement.score                      | Progress bar  | "92%"                 |

### Stats Cards

```
┌─────────────────────────────────────────────────────────────┐
│  Total Users: 12  │  Active: 10  │  Pending: 1  │  ...      │
│  Faculty: 9       │  Avg Engagement: 78%                    │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Use

### 1. **Check Last Active**

- Open Admin Dashboard
- Look at "Last Active" column
- Shows relative time when user last logged in

### 2. **View Engagement Score**

- Scroll right to see engagement metrics
- **Course Files**: Number of uploaded files
- **Event Reports**: Number of community engagement activities
- **Engagement**: Overall engagement percentage (0-100%)

### 3. **Trigger Engagement Recomputation**

Faculty engagement automatically updates when they:

- ✅ Upload a course file
- ✅ Create an event report
- ✅ Get assigned responsibilities (future feature)

Admin can also manually trigger by:

- ✅ Deleting the user (cleans up engagement data)

### 4. **Update User Status**

- Click edit on any user
- Change "Active/Inactive/Suspended"
- Saves to users.json immediately

---

## Files Modified

1. **Schema & Types**
   - [src/lib/data/schema.ts](src/lib/data/schema.ts) - Data type definitions

2. **Core Engagement Logic**
   - [src/lib/engagements.ts](src/lib/engagements.ts) - Score calculation & recomputation

3. **API Routes**
   - [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts) - Track lastActiveAt
   - [src/app/api/engagements/route.ts](src/app/api/engagements/route.ts) - Fetch engagement data
   - [src/app/api/course-files/route.ts](src/app/api/course-files/route.ts) - Trigger engagement on upload
   - [src/app/api/event-reports/route.ts](src/app/api/event-reports/route.ts) - Trigger engagement on create
   - [src/app/api/users/[id]/route.ts](src/app/api/users/[id]/route.ts) - Delete engagement records

4. **Frontend Components**
   - [src/components/AdminDashboard/AdminDashboard.tsx](src/components/AdminDashboard/AdminDashboard.tsx) - Main dashboard logic
   - [src/components/AdminDashboard/AdminStats.tsx](src/components/AdminDashboard/AdminStats.tsx) - Stats display

5. **Data Files**
   - [src/data/users.json](src/data/users.json) - User records with lastActiveAt
   - [src/data/engagements.json](src/data/engagements.json) - Engagement scores
   - [src/data/courseFiles.json](src/data/courseFiles.json) - Course file uploads
   - [src/data/eventReports.json](src/data/eventReports.json) - Event reports

---

## Testing

### Test Last Active

```bash
# Login as faculty
# Check admin dashboard → observe "Just now"
# Wait 5 minutes → observe "5m ago"
```

### Test Engagement Update

```bash
# Login as faculty
# Upload a course file
# Check admin dashboard → courseFilesCount increments
# Score increases by ~10 points
```

### Test User Deletion

```bash
# Admin deletes a faculty user
# engagement.json is cleaned up
# User no longer appears in dashboard
```

---

## Future Enhancements

- [ ] Real-time updates with WebSockets (instead of page refresh)
- [ ] Engagement analytics charts with trends
- [ ] Custom engagement weightings per department
- [ ] Responsibility tracking with engagement points
- [ ] Email notifications for low engagement
- [ ] Export admin reports to CSV

---

## Troubleshooting

### Engagement shows 0 for all users

- Check [src/data/engagements.json](src/data/engagements.json) is valid JSON
- Ensure courseFiles.json exists and has data
- Check engagement recomputation logs in terminal

### Last Active shows "-"

- Ensure users.json has `lastActiveAt` field
- Users need to login to update timestamp
- Check API response from `/api/users`

### Admin dashboard won't load

- Verify `/api/users` and `/api/engagements` both return 200
- Check browser console for network errors
- Ensure data files exist: users.json, engagements.json

---

## Summary

✅ **Last Active**: Updates automatically on login
✅ **Engagement Score**: Calculates from uploads, activities, responsibilities, completions
✅ **Auto Recomputation**: Triggers after file/report creation
✅ **Admin View**: Shows all metrics in user table
✅ **Data Sync**: Clean deletetion and proper cascading

The system is now **fully functional** and ready for use!
