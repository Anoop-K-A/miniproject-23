module.exports = [
"[project]/src/lib/roles.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROLE_PATHS",
    ()=>ROLE_PATHS,
    "VALID_ROLES",
    ()=>VALID_ROLES,
    "getDashboardPath",
    ()=>getDashboardPath,
    "getRoleFromPath",
    ()=>getRoleFromPath,
    "isValidRole",
    ()=>isValidRole
]);
const ROLE_PATHS = {
    faculty: "/faculty",
    auditor: "/auditor",
    "staff-advisor": "/staff-advisor",
    admin: "/admin"
};
const VALID_ROLES = [
    "faculty",
    "auditor",
    "staff-advisor",
    "admin"
];
function getDashboardPath(role) {
    if (role === "admin") {
        return ROLE_PATHS.admin;
    }
    return `${ROLE_PATHS[role]}/dashboard`;
}
function isValidRole(role) {
    return role ? VALID_ROLES.includes(role) : false;
}
function getRoleFromPath(pathname) {
    if (pathname.startsWith(ROLE_PATHS.faculty)) {
        return "faculty";
    }
    if (pathname.startsWith(ROLE_PATHS.auditor)) {
        return "auditor";
    }
    if (pathname.startsWith(ROLE_PATHS["staff-advisor"])) {
        return "staff-advisor";
    }
    if (pathname.startsWith(ROLE_PATHS.admin)) {
        return "admin";
    }
    return null;
}
}),
"[project]/src/app/(dashboard)/admin/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/roles.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function AdminLayout({ children }) {
    const { userRole, isAuthenticated, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoading && isAuthenticated && userRole !== "admin") {
            router.replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDashboardPath"])(userRole));
        }
    }, [
        isAuthenticated,
        isLoading,
        router,
        userRole
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/admin/layout.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_50631f6f._.js.map