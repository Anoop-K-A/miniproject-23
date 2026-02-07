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
"[project]/src/data/faculty.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v([{"id":"f1","username":"faculty@test.com","password":"password123","name":"Dr. John Doe","role":"faculty","department":"Computer Science","dashboardId":"faculty-dashboard-1"}]);}),
"[project]/src/data/auditors.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v([{"id":"a1","username":"auditor@test.com","password":"password123","name":"Jane Smith","role":"auditor","department":"Audit","dashboardId":"auditor-dashboard-1"}]);}),
"[project]/src/data/staffAdvisors.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v([{"id":"s1","username":"staff@test.com","password":"password123","name":"Bob Johnson","role":"staff-advisor","department":"Administration","dashboardId":"staff-advisor-dashboard-1"}]);}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_USERS",
    ()=>ALL_USERS,
    "findUserByUsername",
    ()=>findUserByUsername,
    "verifyCredentials",
    ()=>verifyCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$faculty$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/data/faculty.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$auditors$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/data/auditors.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$staffAdvisors$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/data/staffAdvisors.json (json)");
;
;
;
const ALL_USERS = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$faculty$2e$json__$28$json$29$__["default"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$auditors$2e$json__$28$json$29$__["default"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$staffAdvisors$2e$json__$28$json$29$__["default"]
];
function findUserByUsername(username) {
    return ALL_USERS.find((user)=>user.username === username);
}
function verifyCredentials(username, password) {
    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
        return null;
    }
    const { id, name, role, department } = user;
    return {
        id,
        username: user.username,
        name,
        role,
        department
    };
}
}),
"[project]/src/app/api/auth/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const { email, password } = await request.json();
        // Validate inputs
        if (!email || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Email and password are required"
            }, {
                status: 400
            });
        }
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyCredentials"])(email, password);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid credentials"
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            department: user.department
        });
    } catch (error) {
        console.error("Login error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5c086c60._.js.map