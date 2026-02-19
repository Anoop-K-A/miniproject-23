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
"[project]/src/app/api/users/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jsonDb.ts [app-route] (ecmascript)");
;
;
async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const updatedAt = new Date().toISOString();
        const updatedUsers = users.map((user)=>user.id === id ? {
                ...user,
                ...payload,
                updatedAt
            } : user);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("users.json", updatedUsers);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users: updatedUsers
        });
    } catch (error) {
        console.error("User update error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update user"
        }, {
            status: 500
        });
    }
}
async function DELETE(_request, { params }) {
    try {
        const { id } = await params;
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const courseFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
        const eventReports = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("eventReports.json");
        const audits = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("audits.json");
        const remarks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("remarks.json");
        const students = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("students.json");
        const engagements = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("engagements.json").catch(()=>[]);
        const updatedUsers = users.filter((user)=>user.id !== id);
        const removedFileIds = courseFiles.filter((file)=>file.facultyId === id).map((file)=>file.id);
        const removedReportIds = eventReports.filter((report)=>report.facultyId === id).map((report)=>report.id);
        const updatedFiles = courseFiles.filter((file)=>file.facultyId !== id);
        const updatedReports = eventReports.filter((report)=>report.facultyId !== id);
        const updatedAudits = audits.filter((audit)=>audit.auditorId !== id && !(audit.entityType === "course-file" && removedFileIds.includes(audit.entityId) || audit.entityType === "event-report" && removedReportIds.includes(audit.entityId)));
        const updatedRemarks = remarks.filter((remark)=>remark.authorId !== id && !(remark.entityType === "course-file" && removedFileIds.includes(remark.entityId) || remark.entityType === "event-report" && removedReportIds.includes(remark.entityId)));
        const updatedStudents = students.filter((student)=>student.advisorId !== id);
        const updatedEngagements = engagements.filter((engagement)=>engagement.facultyId !== id);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("users.json", updatedUsers);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("courseFiles.json", updatedFiles);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("eventReports.json", updatedReports);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("audits.json", updatedAudits);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("remarks.json", updatedRemarks);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("students.json", updatedStudents);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("engagements.json", updatedEngagements);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users: updatedUsers
        });
    } catch (error) {
        console.error("User delete error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to delete user"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__42e6f4bc._.js.map