import { z } from 'zod';
export declare const UserListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
}>;
export declare const UserRoleSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodString;
    userId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    userId: string;
    id: string;
    role: string;
}, {
    createdAt: string;
    updatedAt: string;
    userId: string;
    id: string;
    role: string;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    userRoles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodString;
        userId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }, {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }>, "many">;
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    tenantId: string;
    name: string;
    email: string;
    userRoles: {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }[];
    roles: string[];
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    tenantId: string;
    name: string;
    email: string;
    userRoles: {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }[];
    roles: string[];
}>;
export declare const UserListResponseSchema: z.ZodObject<{
    users: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        userRoles: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodString;
            userId: z.ZodString;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }, {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }>, "many">;
        roles: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        tenantId: string;
        name: string;
        email: string;
        userRoles: {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }[];
        roles: string[];
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        tenantId: string;
        name: string;
        email: string;
        userRoles: {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }[];
        roles: string[];
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    users: {
        createdAt: string;
        updatedAt: string;
        id: string;
        tenantId: string;
        name: string;
        email: string;
        userRoles: {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }[];
        roles: string[];
    }[];
}, {
    total: number;
    users: {
        createdAt: string;
        updatedAt: string;
        id: string;
        tenantId: string;
        name: string;
        email: string;
        userRoles: {
            createdAt: string;
            updatedAt: string;
            userId: string;
            id: string;
            role: string;
        }[];
        roles: string[];
    }[];
}>;
export declare const UserCreateSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    roles: string[];
}, {
    name: string;
    email: string;
    roles: string[];
}>;
export declare const UserCreateResponseSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    userRoles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodString;
        userId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }, {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }>, "many">;
    roles: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    tenantId: string;
    name: string;
    email: string;
    userRoles: {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }[];
    roles: string[];
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    tenantId: string;
    name: string;
    email: string;
    userRoles: {
        createdAt: string;
        updatedAt: string;
        userId: string;
        id: string;
        role: string;
    }[];
    roles: string[];
}>;
export declare const UsersApiMeta: {
    getUsers: {
        method: "GET";
        path: string;
        query: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            search: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            search?: string | undefined;
        }, {
            page?: number | undefined;
            limit?: number | undefined;
            search?: string | undefined;
        }>;
        responses: {
            200: z.ZodObject<{
                users: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    tenantId: z.ZodString;
                    name: z.ZodString;
                    email: z.ZodString;
                    createdAt: z.ZodString;
                    updatedAt: z.ZodString;
                    userRoles: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        role: z.ZodString;
                        userId: z.ZodString;
                        createdAt: z.ZodString;
                        updatedAt: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }, {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }>, "many">;
                    roles: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    tenantId: string;
                    name: string;
                    email: string;
                    userRoles: {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }[];
                    roles: string[];
                }, {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    tenantId: string;
                    name: string;
                    email: string;
                    userRoles: {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }[];
                    roles: string[];
                }>, "many">;
                total: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                total: number;
                users: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    tenantId: string;
                    name: string;
                    email: string;
                    userRoles: {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }[];
                    roles: string[];
                }[];
            }, {
                total: number;
                users: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    tenantId: string;
                    name: string;
                    email: string;
                    userRoles: {
                        createdAt: string;
                        updatedAt: string;
                        userId: string;
                        id: string;
                        role: string;
                    }[];
                    roles: string[];
                }[];
            }>;
        };
    };
    createUser: {
        method: "POST";
        path: string;
        body: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            roles: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            roles: string[];
        }, {
            name: string;
            email: string;
            roles: string[];
        }>;
        responses: {
            201: z.ZodObject<{
                id: z.ZodString;
                tenantId: z.ZodString;
                name: z.ZodString;
                email: z.ZodString;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
                userRoles: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    role: z.ZodString;
                    userId: z.ZodString;
                    createdAt: z.ZodString;
                    updatedAt: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    updatedAt: string;
                    userId: string;
                    id: string;
                    role: string;
                }, {
                    createdAt: string;
                    updatedAt: string;
                    userId: string;
                    id: string;
                    role: string;
                }>, "many">;
                roles: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                tenantId: string;
                name: string;
                email: string;
                userRoles: {
                    createdAt: string;
                    updatedAt: string;
                    userId: string;
                    id: string;
                    role: string;
                }[];
                roles: string[];
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                tenantId: string;
                name: string;
                email: string;
                userRoles: {
                    createdAt: string;
                    updatedAt: string;
                    userId: string;
                    id: string;
                    role: string;
                }[];
                roles: string[];
            }>;
        };
    };
};
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserCreateRequest = z.infer<typeof UserCreateSchema>;
export type UserCreateResponse = z.infer<typeof UserCreateResponseSchema>;
