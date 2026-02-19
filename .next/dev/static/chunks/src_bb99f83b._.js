(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/roles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/(dashboard)/auditor/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuditorLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/roles.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AuditorLayout({ children }) {
    _s();
    const { userRole, isAuthenticated, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuditorLayout.useEffect": ()=>{
            if (!isLoading && isAuthenticated && userRole !== "auditor") {
                router.replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardPath"])(userRole));
            }
        }
    }["AuditorLayout.useEffect"], [
        isAuthenticated,
        isLoading,
        router,
        userRole
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/(dashboard)/auditor/layout.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(AuditorLayout, "n/d3+S0VT9xiiD17Ckt8TgtFbMk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuditorLayout;
var _c;
__turbopack_context__.k.register(_c, "AuditorLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_bb99f83b._.js.map