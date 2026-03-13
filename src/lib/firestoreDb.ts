import { adminDb } from "./firebaseAdmin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

/**
 * Firestore Database Operations
 * Replaces MongoDB/Prisma with Firebase Firestore
 */

// Type definitions (matching Prisma schema)
export interface CourseFile {
  id: string;
  facultyId: string;
  courseCode: string;
  courseName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  status: string;
  semester: string;
  academicYear: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  audits?: Audit[];
  remarks?: Remark[];
}

export interface Audit {
  id: string;
  courseFileId?: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  changes?: any;
  metadata?: any;
}

export interface Remark {
  id: string;
  courseFileId?: string;
  entityType: string;
  entityId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  type?: string;
  resolved?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  department?: string;
  image?: string;
  role: string;
  roles: string[];
  approved: boolean;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  password?: string;
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventReport {
  id: string;
  facultyId: string;
  title: string;
  description: string;
  eventDate: Date;
  category: string;
  images?: string[];
  attachments?: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to convert Firestore timestamp to Date
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  const result = { ...data };

  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (result[key] && typeof result[key] === "object") {
      result[key] = convertTimestamps(result[key]);
    }
  });

  return result;
};

// Helper to convert data for Firestore storage
const prepareForFirestore = (data: any): any => {
  const result = { ...data };

  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    } else if (result[key] === undefined) {
      delete result[key];
    }
  });

  return result;
};

/**
 * Firestore Course File Operations
 */
export const courseFileDb = {
  // Create a new course file
  create: async (
    data: Omit<CourseFile, "id" | "createdAt" | "updatedAt">,
  ): Promise<CourseFile> => {
    const now = new Date();
    const courseFileData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb
      .collection("courseFiles")
      .add(prepareForFirestore(courseFileData));

    const doc = await docRef.get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as CourseFile;
  },

  // Get all course files
  getAll: async (): Promise<CourseFile[]> => {
    const snapshot = await adminDb
      .collection("courseFiles")
      .orderBy("createdAt", "desc")
      .get();

    const courseFiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as CourseFile[];

    // Fetch related audits and remarks for each course file
    for (const file of courseFiles) {
      file.audits = await auditDb.getByCourseFile(file.id);
      file.remarks = await remarkDb.getByCourseFile(file.id);
    }

    return courseFiles;
  },

  // Get course file by ID
  getById: async (id: string): Promise<CourseFile | null> => {
    const doc = await adminDb.collection("courseFiles").doc(id).get();

    if (!doc.exists) return null;

    const courseFile = {
      id: doc.id,
      ...convertTimestamps(doc.data()),
    } as CourseFile;

    courseFile.audits = await auditDb.getByCourseFile(id);
    courseFile.remarks = await remarkDb.getByCourseFile(id);

    return courseFile;
  },

  // Get course files by faculty ID
  getByFacultyId: async (facultyId: string): Promise<CourseFile[]> => {
    const snapshot = await adminDb
      .collection("courseFiles")
      .where("facultyId", "==", facultyId)
      .orderBy("createdAt", "desc")
      .get();

    const courseFiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as CourseFile[];

    for (const file of courseFiles) {
      file.audits = await auditDb.getByCourseFile(file.id);
      file.remarks = await remarkDb.getByCourseFile(file.id);
    }

    return courseFiles;
  },

  // Update course file
  update: async (
    id: string,
    data: Partial<CourseFile>,
  ): Promise<CourseFile> => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await adminDb
      .collection("courseFiles")
      .doc(id)
      .update(prepareForFirestore(updateData));

    const updated = await courseFileDb.getById(id);
    if (!updated) throw new Error("Course file not found after update");
    return updated;
  },

  // Delete course file (also delete related audits and remarks)
  delete: async (id: string): Promise<void> => {
    // Delete related audits
    await auditDb.deleteByCourseFile(id);
    // Delete related remarks
    await remarkDb.deleteByCourseFile(id);
    // Delete the course file
    await adminDb.collection("courseFiles").doc(id).delete();
  },

  // Get course files by status
  getByStatus: async (status: string): Promise<CourseFile[]> => {
    const snapshot = await adminDb
      .collection("courseFiles")
      .where("status", "==", status)
      .get();

    const courseFiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as CourseFile[];

    for (const file of courseFiles) {
      file.audits = await auditDb.getByCourseFile(file.id);
      file.remarks = await remarkDb.getByCourseFile(file.id);
    }

    return courseFiles;
  },

  // Get course files by course code
  getByCourseCode: async (courseCode: string): Promise<CourseFile[]> => {
    const snapshot = await adminDb
      .collection("courseFiles")
      .where("courseCode", "==", courseCode)
      .get();

    const courseFiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as CourseFile[];

    for (const file of courseFiles) {
      file.audits = await auditDb.getByCourseFile(file.id);
      file.remarks = await remarkDb.getByCourseFile(file.id);
    }

    return courseFiles;
  },
};

/**
 * Firestore Audit Operations
 */
export const auditDb = {
  // Create audit entry
  create: async (data: Omit<Audit, "id" | "performedAt">): Promise<Audit> => {
    const auditData = {
      ...data,
      performedAt: new Date(),
    };

    const docRef = await adminDb
      .collection("audits")
      .add(prepareForFirestore(auditData));

    const doc = await docRef.get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as Audit;
  },

  // Get audits by entity
  getByEntity: async (
    entityType: string,
    entityId: string,
  ): Promise<Audit[]> => {
    const snapshot = await adminDb
      .collection("audits")
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("performedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Audit[];
  },

  // Get all audits for a course file
  getByCourseFile: async (courseFileId: string): Promise<Audit[]> => {
    const snapshot = await adminDb
      .collection("audits")
      .where("courseFileId", "==", courseFileId)
      .orderBy("performedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Audit[];
  },

  // Delete audits for a course file
  deleteByCourseFile: async (courseFileId: string): Promise<void> => {
    const snapshot = await adminDb
      .collection("audits")
      .where("courseFileId", "==", courseFileId)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  },
};

/**
 * Firestore Remark Operations
 */
export const remarkDb = {
  // Create remark
  create: async (
    data: Omit<Remark, "id" | "createdAt" | "updatedAt">,
  ): Promise<Remark> => {
    const now = new Date();
    const remarkData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb
      .collection("remarks")
      .add(prepareForFirestore(remarkData));

    const doc = await docRef.get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as Remark;
  },

  // Get remarks by entity
  getByEntity: async (
    entityType: string,
    entityId: string,
  ): Promise<Remark[]> => {
    const snapshot = await adminDb
      .collection("remarks")
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Remark[];
  },

  // Get remarks for a course file
  getByCourseFile: async (courseFileId: string): Promise<Remark[]> => {
    const snapshot = await adminDb
      .collection("remarks")
      .where("courseFileId", "==", courseFileId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as Remark[];
  },

  // Update remark
  update: async (id: string, data: Partial<Remark>): Promise<Remark> => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await adminDb
      .collection("remarks")
      .doc(id)
      .update(prepareForFirestore(updateData));

    const doc = await adminDb.collection("remarks").doc(id).get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as Remark;
  },

  // Delete remarks for a course file
  deleteByCourseFile: async (courseFileId: string): Promise<void> => {
    const snapshot = await adminDb
      .collection("remarks")
      .where("courseFileId", "==", courseFileId)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  },
};

/**
 * Firestore User Operations
 */
export const userDb = {
  // Create user
  create: async (
    data: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<User> => {
    const now = new Date();
    const userData = {
      ...data,
      emailVerified: data.emailVerified ?? false,
      approved: data.approved ?? false,
      role: data.role ?? "faculty",
      roles: data.roles ?? ["faculty"],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb
      .collection("users")
      .add(prepareForFirestore(userData));
    const doc = await docRef.get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    const doc = await adminDb.collection("users").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    const snapshot = await adminDb
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  },

  // Get user by Firebase UID
  getByFirebaseUid: async (firebaseUid: string): Promise<User | null> => {
    const snapshot = await adminDb
      .collection("users")
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as User;
  },

  // Get all users
  getAll: async (): Promise<User[]> => {
    const snapshot = await adminDb.collection("users").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as User[];
  },

  // Update user
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await adminDb
      .collection("users")
      .doc(id)
      .update(prepareForFirestore(updateData));
    const updated = await userDb.getById(id);
    if (!updated) throw new Error("User not found after update");
    return updated;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await adminDb.collection("users").doc(id).delete();
  },

  // Get users by role
  getByRole: async (role: string): Promise<User[]> => {
    const snapshot = await adminDb
      .collection("users")
      .where("roles", "array-contains", role)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as User[];
  },
};

/**
 * Firestore Event Report Operations
 */
export const eventReportDb = {
  // Create event report
  create: async (
    data: Omit<EventReport, "id" | "createdAt" | "updatedAt">,
  ): Promise<EventReport> => {
    const now = new Date();
    const reportData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb
      .collection("eventReports")
      .add(prepareForFirestore(reportData));

    const doc = await docRef.get();
    return { id: doc.id, ...convertTimestamps(doc.data()) } as EventReport;
  },

  // Get all event reports
  getAll: async (): Promise<EventReport[]> => {
    const snapshot = await adminDb
      .collection("eventReports")
      .orderBy("eventDate", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as EventReport[];
  },

  // Get event report by ID
  getById: async (id: string): Promise<EventReport | null> => {
    const doc = await adminDb.collection("eventReports").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...convertTimestamps(doc.data()) } as EventReport;
  },

  // Get event reports by faculty ID
  getByFacultyId: async (facultyId: string): Promise<EventReport[]> => {
    const snapshot = await adminDb
      .collection("eventReports")
      .where("facultyId", "==", facultyId)
      .orderBy("eventDate", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    })) as EventReport[];
  },

  // Update event report
  update: async (
    id: string,
    data: Partial<EventReport>,
  ): Promise<EventReport> => {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await adminDb
      .collection("eventReports")
      .doc(id)
      .update(prepareForFirestore(updateData));

    const updated = await eventReportDb.getById(id);
    if (!updated) throw new Error("Event report not found after update");
    return updated;
  },

  // Delete event report
  delete: async (id: string): Promise<void> => {
    await adminDb.collection("eventReports").doc(id).delete();
  },
};
