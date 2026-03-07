module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/firebaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "adminAuth",
    ()=>adminAuth,
    "adminDb",
    ()=>adminDb,
    "adminStorage",
    ()=>adminStorage,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/auth [external] (firebase-admin/auth, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/storage [external] (firebase-admin/storage, esm_import, [project]/node_modules/firebase-admin)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// Initialize Firebase Admin SDK (server-side only)
const apps = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])();
let adminApp;
if (!apps.length) {
    // Try to initialize with service account
    try {
        console.log("Initializing Firebase Admin with service account...");
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        if (!projectId || !clientEmail || !privateKey) {
            console.warn("Missing Firebase credentials:", {
                projectId: !!projectId,
                clientEmail: !!clientEmail,
                privateKey: !!privateKey
            });
        }
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])({
                projectId,
                clientEmail,
                privateKey
            }),
            storageBucket: ("TURBOPACK compile-time value", "miniproject-32b81.firebasestorage.app")
        });
        console.log("Firebase Admin initialized successfully with project:", projectId);
    } catch (error) {
        console.warn("Firebase Admin initialization with service account failed:", error.message);
        console.warn("Attempting fallback to default credentials...");
        // Fallback to default credentials (works in Firebase hosting)
        try {
            adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])();
            console.log("Firebase Admin initialized with default credentials");
        } catch (fallbackError) {
            console.error("Both Firebase initialization methods failed:", fallbackError);
            throw fallbackError;
        }
    }
} else {
    adminApp = apps[0];
    console.log("Firebase Admin already initialized");
}
const adminDb = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getFirestore"])(adminApp);
const adminAuth = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getAuth"])(adminApp);
const adminStorage = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$storage__$5b$external$5d$__$28$firebase$2d$admin$2f$storage$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getStorage"])(adminApp);
const __TURBOPACK__default__export__ = adminApp;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/firestoreDb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "auditDb",
    ()=>auditDb,
    "courseFileDb",
    ()=>courseFileDb,
    "eventReportDb",
    ()=>eventReportDb,
    "remarkDb",
    ()=>remarkDb,
    "userDb",
    ()=>userDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/node_modules/firebase-admin)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// Helper to convert Firestore timestamp to Date
const convertTimestamps = (data)=>{
    if (!data) return data;
    const result = {
        ...data
    };
    Object.keys(result).forEach((key)=>{
        if (result[key] instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["Timestamp"]) {
            result[key] = result[key].toDate();
        } else if (result[key] && typeof result[key] === "object") {
            result[key] = convertTimestamps(result[key]);
        }
    });
    return result;
};
// Helper to convert data for Firestore storage
const prepareForFirestore = (data)=>{
    const result = {
        ...data
    };
    Object.keys(result).forEach((key)=>{
        if (result[key] instanceof Date) {
            result[key] = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["Timestamp"].fromDate(result[key]);
        } else if (result[key] === undefined) {
            delete result[key];
        }
    });
    return result;
};
const courseFileDb = {
    // Create a new course file
    create: async (data)=>{
        const now = new Date();
        const courseFileData = {
            ...data,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").add(prepareForFirestore(courseFileData));
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get all course files
    getAll: async ()=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").orderBy("createdAt", "desc").get();
        const courseFiles = snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
        // Fetch related audits and remarks for each course file
        for (const file of courseFiles){
            file.audits = await auditDb.getByCourseFile(file.id);
            file.remarks = await remarkDb.getByCourseFile(file.id);
        }
        return courseFiles;
    },
    // Get course file by ID
    getById: async (id)=>{
        const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").doc(id).get();
        if (!doc.exists) return null;
        const courseFile = {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
        courseFile.audits = await auditDb.getByCourseFile(id);
        courseFile.remarks = await remarkDb.getByCourseFile(id);
        return courseFile;
    },
    // Get course files by faculty ID
    getByFacultyId: async (facultyId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").where("facultyId", "==", facultyId).orderBy("createdAt", "desc").get();
        const courseFiles = snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
        for (const file of courseFiles){
            file.audits = await auditDb.getByCourseFile(file.id);
            file.remarks = await remarkDb.getByCourseFile(file.id);
        }
        return courseFiles;
    },
    // Update course file
    update: async (id, data)=>{
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").doc(id).update(prepareForFirestore(updateData));
        const updated = await courseFileDb.getById(id);
        if (!updated) throw new Error("Course file not found after update");
        return updated;
    },
    // Delete course file (also delete related audits and remarks)
    delete: async (id)=>{
        // Delete related audits
        await auditDb.deleteByCourseFile(id);
        // Delete related remarks
        await remarkDb.deleteByCourseFile(id);
        // Delete the course file
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").doc(id).delete();
    },
    // Get course files by status
    getByStatus: async (status)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").where("status", "==", status).get();
        const courseFiles = snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
        for (const file of courseFiles){
            file.audits = await auditDb.getByCourseFile(file.id);
            file.remarks = await remarkDb.getByCourseFile(file.id);
        }
        return courseFiles;
    },
    // Get course files by course code
    getByCourseCode: async (courseCode)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("courseFiles").where("courseCode", "==", courseCode).get();
        const courseFiles = snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
        for (const file of courseFiles){
            file.audits = await auditDb.getByCourseFile(file.id);
            file.remarks = await remarkDb.getByCourseFile(file.id);
        }
        return courseFiles;
    }
};
const auditDb = {
    // Create audit entry
    create: async (data)=>{
        const auditData = {
            ...data,
            performedAt: new Date()
        };
        const docRef = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("audits").add(prepareForFirestore(auditData));
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get audits by entity
    getByEntity: async (entityType, entityId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("audits").where("entityType", "==", entityType).where("entityId", "==", entityId).orderBy("performedAt", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Get all audits for a course file
    getByCourseFile: async (courseFileId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("audits").where("courseFileId", "==", courseFileId).orderBy("performedAt", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Delete audits for a course file
    deleteByCourseFile: async (courseFileId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("audits").where("courseFileId", "==", courseFileId).get();
        const batch = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].batch();
        snapshot.docs.forEach((doc)=>{
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
};
const remarkDb = {
    // Create remark
    create: async (data)=>{
        const now = new Date();
        const remarkData = {
            ...data,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").add(prepareForFirestore(remarkData));
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get remarks by entity
    getByEntity: async (entityType, entityId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").where("entityType", "==", entityType).where("entityId", "==", entityId).orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Get remarks for a course file
    getByCourseFile: async (courseFileId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").where("courseFileId", "==", courseFileId).orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Update remark
    update: async (id, data)=>{
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").doc(id).update(prepareForFirestore(updateData));
        const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").doc(id).get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Delete remarks for a course file
    deleteByCourseFile: async (courseFileId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("remarks").where("courseFileId", "==", courseFileId).get();
        const batch = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].batch();
        snapshot.docs.forEach((doc)=>{
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
};
const userDb = {
    // Create user
    create: async (data)=>{
        const now = new Date();
        const userData = {
            ...data,
            emailVerified: data.emailVerified ?? false,
            approved: data.approved ?? false,
            role: data.role ?? "faculty",
            roles: data.roles ?? [
                "faculty"
            ],
            createdAt: now,
            updatedAt: now
        };
        const docRef = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").add(prepareForFirestore(userData));
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get user by ID
    getById: async (id)=>{
        const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").doc(id).get();
        if (!doc.exists) return null;
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get user by email
    getByEmail: async (email)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").where("email", "==", email).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get user by Firebase UID
    getByFirebaseUid: async (firebaseUid)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").where("firebaseUid", "==", firebaseUid).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get all users
    getAll: async ()=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Update user
    update: async (id, data)=>{
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").doc(id).update(prepareForFirestore(updateData));
        const updated = await userDb.getById(id);
        if (!updated) throw new Error("User not found after update");
        return updated;
    },
    // Delete user
    delete: async (id)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").doc(id).delete();
    },
    // Get users by role
    getByRole: async (role)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("users").where("roles", "array-contains", role).get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    }
};
const eventReportDb = {
    // Create event report
    create: async (data)=>{
        const now = new Date();
        const reportData = {
            ...data,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").add(prepareForFirestore(reportData));
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get all event reports
    getAll: async ()=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").orderBy("eventDate", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Get event report by ID
    getById: async (id)=>{
        const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").doc(id).get();
        if (!doc.exists) return null;
        return {
            id: doc.id,
            ...convertTimestamps(doc.data())
        };
    },
    // Get event reports by faculty ID
    getByFacultyId: async (facultyId)=>{
        const snapshot = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").where("facultyId", "==", facultyId).orderBy("eventDate", "desc").get();
        return snapshot.docs.map((doc)=>({
                id: doc.id,
                ...convertTimestamps(doc.data())
            }));
    },
    // Update event report
    update: async (id, data)=>{
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").doc(id).update(prepareForFirestore(updateData));
        const updated = await eventReportDb.getById(id);
        if (!updated) throw new Error("Event report not found after update");
        return updated;
    },
    // Delete event report
    delete: async (id)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["adminDb"].collection("eventReports").doc(id).delete();
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/app/api/users/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firestoreDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET() {
    try {
        console.log("Fetching all users from Firestore...");
        let users;
        try {
            users = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userDb"].getAll();
        } catch (queryError) {
            // If users collection doesn't exist, return empty array
            if (queryError.code === 5 || queryError.message?.includes("NOT_FOUND")) {
                console.log("Users collection not found, returning empty users array");
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    users: []
                });
            }
            throw queryError;
        }
        console.log(`Successfully fetched ${users.length} users`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users
        });
    } catch (error) {
        console.error("Users load error:", {
            message: error?.message,
            code: error?.code,
            details: error?.details,
            fullError: error
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load users",
            details: error?.message || "Unknown error"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const payload = await request.json();
        // Validate required fields
        if (!payload.email) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Email is required"
            }, {
                status: 400
            });
        }
        // Check if user already exists
        const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userDb"].getByEmail(payload.email);
        if (existingUser) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "User with this email already exists"
            }, {
                status: 409
            });
        }
        const rolesArray = payload.roles || [
            payload.role || "faculty"
        ];
        // Hash password if provided
        let hashedPassword = undefined;
        if (payload.password) {
            hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(payload.password, 10);
        }
        const newUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userDb"].create({
            name: payload.name ?? payload.username ?? payload.email,
            email: payload.email,
            emailVerified: payload.emailVerified ?? false,
            phone: payload.phone,
            department: payload.department,
            image: payload.image,
            role: payload.role ?? "faculty",
            roles: rolesArray,
            approved: payload.approved ?? false,
            banned: payload.banned ?? false,
            banReason: payload.banReason,
            banExpires: payload.banExpires ? new Date(payload.banExpires) : undefined,
            password: hashedPassword,
            firebaseUid: payload.firebaseUid
        });
        // Fetch all users to return updated list
        const users = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userDb"].getAll();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users,
            newUser
        });
    } catch (error) {
        console.error("User create error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create user"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__63b2753d._.js.map