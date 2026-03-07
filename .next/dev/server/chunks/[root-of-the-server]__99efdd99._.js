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
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            }),
            storageBucket: ("TURBOPACK compile-time value", "miniproject-32b81.firebasestorage.app")
        });
    } catch (error) {
        console.warn("Firebase Admin initialization with service account failed, trying default credentials");
        // Fallback to default credentials (works in Firebase hosting)
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])();
    }
} else {
    adminApp = apps[0];
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
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/jsonDb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDataFilePath",
    ()=>getDataFilePath,
    "readJsonFile",
    ()=>readJsonFile,
    "writeJsonFile",
    ()=>writeJsonFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const dataRoot = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "src", "data");
// Simple lock mechanism to prevent concurrent writes
const locks = new Map();
function getDataFilePath(fileName) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataRoot, fileName);
}
async function readJsonFile(fileName) {
    const filePath = getDataFilePath(fileName);
    const fileContents = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
}
async function writeJsonFile(fileName, data) {
    const filePath = getDataFilePath(fileName);
    // Wait for any existing write operation to complete
    while(locks.has(fileName)){
        await locks.get(fileName);
    }
    // Create a new lock for this write operation
    const writeLock = (async ()=>{
        try {
            const jsonString = JSON.stringify(data, null, 2);
            // Validate JSON before writing
            try {
                JSON.parse(jsonString);
            } catch (error) {
                console.error("Invalid JSON data, aborting write:", error);
                throw new Error("Failed to write JSON: Invalid data structure");
            }
            // Write to temporary file first, then rename (atomic operation)
            const tempFilePath = `${filePath}.tmp`;
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(tempFilePath, jsonString, "utf-8");
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].rename(tempFilePath, filePath);
        } finally{
            locks.delete(fileName);
        }
    })();
    locks.set(fileName, writeLock);
    await writeLock;
}
}),
"[project]/src/lib/engagements.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recomputeAllEngagements",
    ()=>recomputeAllEngagements,
    "recomputeEngagementForFaculty",
    ()=>recomputeEngagementForFaculty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jsonDb.ts [app-route] (ecmascript)");
;
function computeEngagementScore(counts) {
    const uploadsPoints = counts.uploadsCount * 10;
    const activityPoints = counts.activityParticipationCount * 15;
    const responsibilityPoints = counts.responsibilitiesCount * 8;
    const completionPoints = counts.courseCompletionCount * 20;
    return Math.min(100, uploadsPoints + activityPoints + responsibilityPoints + completionPoints);
}
async function recomputeEngagementForFaculty(facultyId) {
    const [courseFiles, eventReports, responsibilities, assignments, engagements] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("responsibilities.json"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("assignments.json"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("engagements.json")
    ]);
    const uploadsCount = courseFiles.filter((file)=>file.facultyId === facultyId).length;
    const activityParticipationCount = eventReports.filter((report)=>report.facultyId === facultyId).length;
    const responsibilitiesCount = responsibilities.filter((responsibility)=>responsibility.facultyId === facultyId && responsibility.status !== "removed").length;
    const courseCompletionCount = assignments.filter((assignment)=>assignment.facultyId === facultyId && assignment.status === "completed").length;
    const score = computeEngagementScore({
        uploadsCount,
        activityParticipationCount,
        responsibilitiesCount,
        courseCompletionCount
    });
    const updatedAt = new Date().toISOString();
    const nextRecord = {
        id: facultyId,
        facultyId,
        uploadsCount,
        activityParticipationCount,
        responsibilitiesCount,
        courseCompletionCount,
        score,
        updatedAt
    };
    const existingIndex = engagements.findIndex((entry)=>entry.facultyId === facultyId);
    const nextEngagements = [
        ...engagements
    ];
    if (existingIndex >= 0) {
        nextEngagements[existingIndex] = nextRecord;
    } else {
        nextEngagements.unshift(nextRecord);
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("engagements.json", nextEngagements);
    return nextRecord;
}
async function recomputeAllEngagements() {
    const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
    const results = [];
    for (const user of users){
        results.push(await recomputeEngagementForFaculty(user.id));
    }
    return results;
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/lib/fileUpload.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "saveCoursefile",
    ()=>saveCoursefile,
    "saveDataUrlAsFile",
    ()=>saveDataUrlAsFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
async function saveCoursefile(courseCode, file) {
    try {
        // Sanitize course code to ensure valid folder name
        const sanitizedCourseCode = courseCode.replace(/[^a-zA-Z0-9-_]/g, "_");
        if (!sanitizedCourseCode) {
            throw new Error("Invalid course code");
        }
        // Define the base upload directory
        const baseUploadDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "public", "uploads", "course-files");
        // Create the course code folder path
        const courseFolder = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(baseUploadDir, sanitizedCourseCode);
        // Create the base directory if it doesn't exist
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(baseUploadDir)) {
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(baseUploadDir, {
                recursive: true
            });
        }
        // Create the course code folder if it doesn't exist
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(courseFolder)) {
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(courseFolder, {
                recursive: true
            });
        }
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${timestamp}_${sanitizedFileName}`;
        const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(courseFolder, fileName);
        // Convert file to buffer and save
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(filePath, buffer);
        // Return the public URL path
        return `/uploads/course-files/${sanitizedCourseCode}/${fileName}`;
    } catch (error) {
        console.error("Error saving course file:", error);
        throw new Error("Failed to save course file");
    }
}
async function saveDataUrlAsFile(courseCode, fileName, dataUrl) {
    try {
        // Sanitize course code to ensure valid folder name
        const sanitizedCourseCode = courseCode.replace(/[^a-zA-Z0-9-_]/g, "_");
        console.log(`Original course code: "${courseCode}"`);
        console.log(`Sanitized course code: "${sanitizedCourseCode}"`);
        if (!sanitizedCourseCode) {
            throw new Error("Invalid course code");
        }
        // Define the base upload directory
        const baseUploadDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), "public", "uploads", "course-files");
        // Create the course code folder path
        const courseFolder = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(baseUploadDir, sanitizedCourseCode);
        console.log(`Creating folder: ${courseFolder}`);
        // Create the base directory if it doesn't exist
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(baseUploadDir)) {
            console.log(`Creating base upload directory: ${baseUploadDir}`);
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(baseUploadDir, {
                recursive: true
            });
        }
        // Create the course code folder if it doesn't exist
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(courseFolder)) {
            console.log(`Creating course folder: ${courseFolder}`);
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["mkdir"])(courseFolder, {
                recursive: true
            });
        } else {
            console.log(`Course folder already exists: ${courseFolder}`);
        }
        // Extract base64 data from data URL
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid data URL");
        }
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const newFileName = `${timestamp}_${sanitizedFileName}`;
        const filePath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(courseFolder, newFileName);
        console.log(`Saving file to: ${filePath}`);
        // Save the file
        await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["writeFile"])(filePath, buffer);
        console.log(`File saved successfully, size: ${buffer.length} bytes`);
        // Return the public URL path
        const publicUrl = `/uploads/course-files/${sanitizedCourseCode}/${newFileName}`;
        console.log(`Public URL: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error("Error saving data URL as file:", error);
        throw new Error("Failed to save file from data URL");
    }
}
}),
"[project]/src/app/api/course-files/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firestoreDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engagements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fileUpload$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fileUpload.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const runtime = "nodejs";
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const facultyId = searchParams.get("facultyId");
        const courseCode = searchParams.get("courseCode");
        const status = searchParams.get("status");
        let files;
        if (facultyId) {
            files = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].getByFacultyId(facultyId);
        } else if (courseCode) {
            files = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].getByCourseCode(courseCode);
        } else if (status) {
            files = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].getByStatus(status);
        } else {
            files = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].getAll();
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            files
        });
    } catch (error) {
        console.error("Course files fetch error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch course files"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const payload = await request.json();
        // Validate required fields
        if (!payload.courseCode) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Course code is required"
            }, {
                status: 400
            });
        }
        if (!payload.fileName) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "File name is required"
            }, {
                status: 400
            });
        }
        const timestamp = new Date().toISOString();
        const uploadDate = timestamp.split("T")[0];
        // Save file to course code folder and get the file path
        let documentUrl = payload.documentUrl;
        if (payload.documentUrl && payload.documentUrl.startsWith("data:")) {
            try {
                console.log(`Saving file for course code: ${payload.courseCode}`);
                documentUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fileUpload$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveDataUrlAsFile"])(payload.courseCode, payload.fileName, payload.documentUrl);
                console.log(`File saved successfully: ${documentUrl}`);
            } catch (error) {
                console.error("Error saving file to folder:", error);
                // Return error instead of falling back - we want to know if this fails
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to save file to disk"
                }, {
                    status: 500
                });
            }
        }
        // Create file in Firestore
        const newFile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].create({
            facultyId: payload.facultyId,
            fileName: payload.fileName,
            documentUrl: documentUrl,
            courseCode: payload.courseCode,
            courseName: payload.courseName,
            fileType: payload.fileType,
            uploadDate: uploadDate,
            semester: payload.semester,
            academicYear: payload.academicYear,
            size: payload.size,
            status: payload.status || "Pending",
            facultyName: payload.facultyName,
            department: payload.department
        });
        // Recompute engagement after file upload
        if (payload.facultyId) {
            try {
                console.log(`Recomputing engagement for faculty: ${payload.facultyId}`);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recomputeEngagementForFaculty"])(payload.facultyId);
                console.log("Engagement recomputed successfully");
            } catch (error) {
                console.error("Error recomputing engagement:", error);
            // Don't fail the upload if engagement computation fails
            // The file is already saved and added to the database
            }
        }
        const updatedFiles = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestoreDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseFileDb"].getAll();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            file: newFile,
            files: updatedFiles
        });
    } catch (error) {
        console.error("Course file create error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create course file"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__99efdd99._.js.map