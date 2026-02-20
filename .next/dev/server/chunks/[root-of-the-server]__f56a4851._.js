module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

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
"[project]/src/lib/dashboardData.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuditorDashboardData",
    ()=>getAuditorDashboardData,
    "getFacultyDashboardData",
    ()=>getFacultyDashboardData,
    "getStaffAdvisorDashboardData",
    ()=>getStaffAdvisorDashboardData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jsonDb.ts [app-route] (ecmascript)");
;
function toTimeAgo(isoDate) {
    if (!isoDate) return "Just now";
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}
async function getFacultyDashboardData(username) {
    const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
    const facultyUsers = users.filter((user)=>(user.roles?.includes("faculty") || user.role === "faculty") && user.role !== "admin");
    const courseFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
    const eventReports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
    const selectedUser = username ? facultyUsers.find((user)=>user.username === username) : facultyUsers[0];
    const userId = selectedUser?.id;
    const userFiles = userId ? courseFiles.filter((file)=>file.facultyId === userId) : [];
    const userReports = userId ? eventReports.filter((report)=>report.facultyId === userId) : [];
    const totalParticipants = userReports.reduce((sum, report)=>sum + (report.participants ?? 0), 0);
    const pendingReports = userReports.filter((report)=>report.status !== "Approved").length;
    const recentActivity = [
        ...userFiles.map((file)=>({
                action: "Uploaded",
                item: file.fileName,
                time: toTimeAgo(file.updatedAt ?? file.createdAt),
                _sort: file.updatedAt ?? file.createdAt ?? ""
            })),
        ...userReports.map((report)=>({
                action: report.status === "Approved" ? "Reviewed" : "Submitted",
                item: report.eventName,
                time: toTimeAgo(report.updatedAt ?? report.createdAt),
                _sort: report.updatedAt ?? report.createdAt ?? ""
            }))
    ].sort((a, b)=>a._sort < b._sort ? 1 : -1).slice(0, 5).map(({ _sort, ...rest })=>rest);
    const stats = {
        totalFiles: userFiles.length,
        totalReports: userReports.length,
        pendingReports,
        totalParticipants,
        recentActivity
    };
    const facultyMembers = facultyUsers.map((user)=>({
            id: user.id,
            name: user.name,
            department: user.department ?? "",
            role: user.facultyRole ?? "Faculty",
            email: user.email ?? user.username,
            phone: user.phone ?? "",
            courses: user.courses ?? [],
            specialization: user.specialization ?? "",
            experience: user.experience ?? ""
        }));
    return {
        stats,
        facultyMembers
    };
}
async function getAuditorDashboardData() {
    const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
    const courseFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
    const eventReports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
    const audits = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("audits.json");
    const facultyUsers = users.filter((user)=>(user.roles?.includes("faculty") || user.role === "faculty") && user.role !== "admin");
    const totalFiles = courseFiles.length;
    const totalReports = eventReports.length;
    const approvedFiles = courseFiles.filter((file)=>file.status === "Approved").length;
    const approvedReports = eventReports.filter((report)=>report.status === "Approved").length;
    const pendingFiles = courseFiles.filter((file)=>file.status === "Pending").length;
    const pendingReports = eventReports.filter((report)=>report.status === "Submitted" || report.status === "Draft").length;
    const rejectedFiles = courseFiles.filter((file)=>file.status === "Rejected").length;
    const rejectedReports = eventReports.filter((report)=>report.status === "Rejected").length;
    const reviewedFiles = approvedFiles + rejectedFiles;
    const reviewedReports = approvedReports + rejectedReports;
    const completionRate = totalFiles + totalReports > 0 ? Math.round((reviewedFiles + reviewedReports) / (totalFiles + totalReports) * 100) : 0;
    const stats = {
        totalFaculty: facultyUsers.length,
        totalFiles,
        totalReports,
        approvedFiles,
        approvedReports,
        pendingFiles,
        pendingReports,
        rejectedFiles,
        rejectedReports,
        completionRate
    };
    const facultyMembers = facultyUsers.map((user)=>{
        const facultyFiles = courseFiles.filter((file)=>file.facultyId === user.id);
        const facultyReports = eventReports.filter((report)=>report.facultyId === user.id);
        return {
            id: user.id,
            name: user.name,
            department: user.department ?? "",
            totalFiles: facultyFiles.length,
            totalReports: facultyReports.length,
            approvedFiles: facultyFiles.filter((file)=>file.status === "Approved").length,
            approvedReports: facultyReports.filter((report)=>report.status === "Approved").length,
            pendingFiles: facultyFiles.filter((file)=>file.status === "Pending").length,
            pendingReports: facultyReports.filter((report)=>report.status === "Submitted" || report.status === "Draft").length,
            rejectedFiles: facultyFiles.filter((file)=>file.status === "Rejected").length,
            rejectedReports: facultyReports.filter((report)=>report.status === "Rejected").length
        };
    });
    const recentReviews = audits.map((audit)=>{
        const file = courseFiles.find((item)=>item.id === audit.entityId);
        const report = eventReports.find((item)=>item.id === audit.entityId);
        const facultyId = file?.facultyId ?? report?.facultyId;
        const facultyName = facultyUsers.find((user)=>user.id === facultyId)?.name;
        return {
            faculty: facultyName ?? "Faculty",
            item: file?.fileName ?? report?.eventName ?? "Review Item",
            action: audit.status === "completed" ? "Approved" : "In Review",
            time: toTimeAgo(audit.updatedAt ?? audit.createdAt),
            _sort: audit.updatedAt ?? audit.createdAt ?? ""
        };
    }).sort((a, b)=>a._sort < b._sort ? 1 : -1).slice(0, 5).map(({ _sort, ...rest })=>rest);
    return {
        stats,
        facultyMembers,
        recentReviews
    };
}
async function getStaffAdvisorDashboardData(username) {
    const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
    const students = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("students.json");
    const courseFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
    const eventReports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
    const careerActivities = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("careerActivities.json");
    const staffAdvisor = username ? users.find((user)=>user.username === username) : undefined;
    const scopedStudents = staffAdvisor ? students.filter((student)=>student.advisorId === staffAdvisor.id) : students;
    const totalStudents = scopedStudents.length;
    const batchYear = scopedStudents.find((student)=>student.batchYear)?.batchYear ?? "";
    const placedStudents = scopedStudents.filter((student)=>student.placementStatus === "Placed").length;
    const inProcess = scopedStudents.filter((student)=>student.placementStatus === "In Process").length;
    const averageCGPA = totalStudents > 0 ? Math.round(scopedStudents.reduce((sum, student)=>sum + student.cgpa, 0) / totalStudents * 10) / 10 : 0;
    const averageAttendance = totalStudents > 0 ? Math.round(scopedStudents.reduce((sum, student)=>sum + student.attendance, 0) / totalStudents) : 0;
    const facultyUsers = users.filter((user)=>(user.roles?.includes("faculty") || user.role === "faculty") && user.role !== "admin");
    const approvedFiles = courseFiles.filter((file)=>file.status === "Approved").length;
    const approvedReports = eventReports.filter((report)=>report.status === "Approved").length;
    const stats = {
        totalStudents,
        batchYear,
        placedStudents,
        inProcess,
        averageCGPA,
        averageAttendance,
        totalFaculty: facultyUsers.length,
        approvedFiles,
        approvedReports
    };
    const careerStats = {
        totalInternships: careerActivities.filter((activity)=>activity.type === "internship").length,
        activeInternships: careerActivities.filter((activity)=>activity.type === "internship" && activity.status === "active").length,
        completedProjects: careerActivities.filter((activity)=>activity.type === "project" && activity.status === "completed").length,
        skillWorkshops: careerActivities.filter((activity)=>activity.type === "workshop").length,
        campusInterviews: careerActivities.filter((activity)=>activity.type === "interview").length
    };
    return {
        stats,
        careerStats,
        students: scopedStudents
    };
}
}),
"[project]/src/app/api/dashboard/faculty/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboardData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dashboardData.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const username = request.cookies.get("auth_user")?.value ?? null;
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dashboardData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFacultyDashboardData"])(username);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f56a4851._.js.map