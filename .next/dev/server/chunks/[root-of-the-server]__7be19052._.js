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

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jsonDb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$engagements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/engagements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fileUpload$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fileUpload.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = "nodejs";
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
        const files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("courseFiles.json");
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readJsonFile"])("users.json");
        const facultyUser = users.find((user)=>user.id === payload.facultyId);
        const timestamp = new Date().toISOString();
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
        const newFile = {
            id: Date.now().toString(),
            facultyId: payload.facultyId,
            fileName: payload.fileName,
            documentUrl: documentUrl,
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
        try {
            console.log("Writing to courseFiles.json...");
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jsonDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeJsonFile"])("courseFiles.json", updatedFiles);
            console.log("courseFiles.json updated successfully");
        } catch (error) {
            console.error("Error writing courseFiles.json:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to save file metadata"
            }, {
                status: 500
            });
        }
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

//# sourceMappingURL=%5Broot-of-the-server%5D__7be19052._.js.map