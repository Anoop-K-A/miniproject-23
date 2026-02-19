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
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(filePath, JSON.stringify(data, null, 2));
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
"[project]/src/app/api/course-files/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const facultyUser = users.find((user)=>user.id === payload.facultyId);
        const timestamp = new Date().toISOString();
        const newFile = {
            id: Date.now().toString(),
            facultyId: payload.facultyId,
            fileName: payload.fileName,
            documentUrl: payload.documentUrl,
            courseCode: payload.courseCode,
            courseName: payload.courseName,
            fileType: payload.fileType,
            uploadDate: payload.uploadDate,
            semester: payload.semester,
            academicYear: payload.academicYear,
            size: payload.size,
            status: payload.status ?? "Pending",
            facultyName: facultyUser?.name ?? payload.facultyName,
            department: facultyUser?.department ?? payload.department,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        const updatedFiles = [
            newFile,
            ...files
        ];
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("courseFiles.json", updatedFiles);
        // Recompute engagement after file upload
        if (payload.facultyId) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recomputeEngagementForFaculty"])(payload.facultyId);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
async function GET() {
    try {
        const files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const fileCategories = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("files/course-file-categories.json");
        const fileTypes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("files/course-file-types.json");
        const filesWithFaculty = files.map((file)=>{
            const facultyUser = users.find((user)=>user.id === file.facultyId);
            return {
                ...file,
                facultyName: facultyUser?.name ?? file.facultyName,
                department: facultyUser?.department ?? file.department
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            files: filesWithFaculty,
            fileCategories,
            fileTypes
        });
    } catch (error) {
        console.error("Course file load error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load course files"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9014acbf._.js.map