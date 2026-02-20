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
    const results = await Promise.all(users.map((user)=>recomputeEngagementForFaculty(user.id)));
    return results;
}
}),
"[project]/src/app/api/event-reports/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jsonDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engagements.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const payload = await request.json();
        const reports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const facultyUser = users.find((user)=>user.id === payload.facultyId);
        const timestamp = new Date().toISOString();
        const newReport = {
            id: Date.now().toString(),
            facultyId: payload.facultyId,
            eventName: payload.eventName,
            community: payload.community,
            eventDate: payload.eventDate,
            description: payload.description,
            location: payload.location,
            participants: payload.participants,
            duration: payload.duration,
            objectives: payload.objectives,
            outcomes: payload.outcomes,
            thumbnailUrl: payload.thumbnailUrl,
            galleryImages: payload.galleryImages,
            status: payload.status ?? "Draft",
            submittedDate: payload.submittedDate,
            facultyCoordinator: payload.facultyCoordinator,
            department: facultyUser?.department ?? payload.department,
            facultyName: facultyUser?.name,
            eventType: payload.eventType,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        const updatedReports = [
            newReport,
            ...reports
        ];
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("eventReports.json", updatedReports);
        // Recompute engagement after report creation
        if (payload.facultyId) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recomputeEngagementForFaculty"])(payload.facultyId);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reports: updatedReports
        });
    } catch (error) {
        console.error("Event report create error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create event report"
        }, {
            status: 500
        });
    }
}
async function GET() {
    try {
        const reports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const communities = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("reports/communities.json");
        const reportsWithFaculty = reports.map((report)=>{
            const facultyUser = users.find((user)=>user.id === report.facultyId);
            return {
                ...report,
                facultyName: facultyUser?.name,
                department: facultyUser?.department ?? report.department
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            reports: reportsWithFaculty,
            communities
        });
    } catch (error) {
        console.error("Event report load error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load event reports"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__13e93986._.js.map