(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [userRole, setUserRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("faculty");
    const [assignedRoles, setAssignedRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        "faculty"
    ]);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const savedAuth = localStorage.getItem("auth_authenticated");
            const savedRole = localStorage.getItem("auth_role");
            const savedRoles = localStorage.getItem("auth_roles");
            const savedUser = localStorage.getItem("auth_user");
            if (savedAuth === "true" && savedRole) {
                setIsAuthenticated(true);
                setUserRole(savedRole);
            }
            if (savedRoles) {
                try {
                    const roles = JSON.parse(savedRoles);
                    setAssignedRoles(roles);
                } catch  {
                    setAssignedRoles([
                        "faculty"
                    ]);
                }
            }
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch  {
                    setUser(null);
                }
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = (authUser)=>{
        setIsAuthenticated(true);
        setUserRole(authUser.role);
        setUser(authUser);
        // Use roles array if available, otherwise default to single role in array
        const roles = authUser.roles || [
            authUser.role
        ];
        setAssignedRoles(roles);
        localStorage.setItem("auth_authenticated", "true");
        localStorage.setItem("auth_role", authUser.role);
        localStorage.setItem("auth_roles", JSON.stringify(roles));
        localStorage.setItem("auth_user", JSON.stringify(authUser));
    };
    const logout = ()=>{
        setIsAuthenticated(false);
        setUserRole("faculty");
        setAssignedRoles([
            "faculty"
        ]);
        setUser(null);
        localStorage.removeItem("auth_authenticated");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("auth_roles");
        localStorage.removeItem("auth_user");
    };
    const switchRole = (role)=>{
        setUserRole(role);
        localStorage.setItem("auth_role", role);
        if (user) {
            const nextUser = {
                ...user,
                role
            };
            setUser(nextUser);
            localStorage.setItem("auth_user", JSON.stringify(nextUser));
        }
    };
    const register = (role)=>{
        setUserRole(role);
        setAssignedRoles([
            role
        ]);
        setIsAuthenticated(true);
        localStorage.setItem("auth_authenticated", "true");
        localStorage.setItem("auth_role", role);
        localStorage.setItem("auth_roles", JSON.stringify([
            role
        ]));
    };
    const value = {
        isAuthenticated,
        userRole,
        assignedRoles,
        user,
        login,
        register,
        logout,
        switchRole,
        isLoading
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.tsx",
        lineNumber: 128,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "vZ4mljJymj69sI5nARdkfeeDKJM=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_context_AuthContext_tsx_b21c1f69._.js.map