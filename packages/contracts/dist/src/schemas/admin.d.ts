import { z } from 'zod';
export declare const TenantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    tenantCode: z.ZodString;
    isDeleted: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
    deletedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    id: string;
    name: string;
    tenantCode: string;
    isDeleted: boolean;
    deletedAt: string | null;
    updatedAt?: string | undefined;
}, {
    createdAt: string;
    id: string;
    name: string;
    tenantCode: string;
    isDeleted: boolean;
    deletedAt: string | null;
    updatedAt?: string | undefined;
}>;
export declare const GetTenantsResponseSchema: z.ZodObject<{
    tenants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        tenantCode: z.ZodString;
        isDeleted: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodOptional<z.ZodString>;
        deletedAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        id: string;
        name: string;
        tenantCode: string;
        isDeleted: boolean;
        deletedAt: string | null;
        updatedAt?: string | undefined;
    }, {
        createdAt: string;
        id: string;
        name: string;
        tenantCode: string;
        isDeleted: boolean;
        deletedAt: string | null;
        updatedAt?: string | undefined;
    }>, "many">;
    meta: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    tenants: {
        createdAt: string;
        id: string;
        name: string;
        tenantCode: string;
        isDeleted: boolean;
        deletedAt: string | null;
        updatedAt?: string | undefined;
    }[];
    meta?: any;
}, {
    tenants: {
        createdAt: string;
        id: string;
        name: string;
        tenantCode: string;
        isDeleted: boolean;
        deletedAt: string | null;
        updatedAt?: string | undefined;
    }[];
    meta?: any;
}>;
export declare const CreateTenantRequestSchema: z.ZodObject<{
    name: z.ZodString;
    adminEmail: z.ZodString;
    tenantCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    adminEmail: string;
    tenantCode?: string | undefined;
}, {
    name: string;
    adminEmail: string;
    tenantCode?: string | undefined;
}>;
export declare const CreateTenantResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    tenantCode: z.ZodString;
    isDeleted: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodNullable<z.ZodString>;
    deletedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string | null;
    id: string;
    name: string;
    tenantCode: string;
    isDeleted: boolean;
    deletedAt: string | null;
}, {
    createdAt: string;
    updatedAt: string | null;
    id: string;
    name: string;
    tenantCode: string;
    isDeleted: boolean;
    deletedAt: string | null;
}>;
export declare const AdminApiMeta: {
    getTenants: {
        method: "GET";
        path: string;
        responses: {
            200: z.ZodObject<{
                tenants: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    tenantCode: z.ZodString;
                    isDeleted: z.ZodBoolean;
                    createdAt: z.ZodString;
                    updatedAt: z.ZodOptional<z.ZodString>;
                    deletedAt: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    id: string;
                    name: string;
                    tenantCode: string;
                    isDeleted: boolean;
                    deletedAt: string | null;
                    updatedAt?: string | undefined;
                }, {
                    createdAt: string;
                    id: string;
                    name: string;
                    tenantCode: string;
                    isDeleted: boolean;
                    deletedAt: string | null;
                    updatedAt?: string | undefined;
                }>, "many">;
                meta: z.ZodOptional<z.ZodAny>;
            }, "strip", z.ZodTypeAny, {
                tenants: {
                    createdAt: string;
                    id: string;
                    name: string;
                    tenantCode: string;
                    isDeleted: boolean;
                    deletedAt: string | null;
                    updatedAt?: string | undefined;
                }[];
                meta?: any;
            }, {
                tenants: {
                    createdAt: string;
                    id: string;
                    name: string;
                    tenantCode: string;
                    isDeleted: boolean;
                    deletedAt: string | null;
                    updatedAt?: string | undefined;
                }[];
                meta?: any;
            }>;
        };
    };
    createTenant: {
        method: "POST";
        path: string;
        body: z.ZodObject<{
            name: z.ZodString;
            adminEmail: z.ZodString;
            tenantCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            adminEmail: string;
            tenantCode?: string | undefined;
        }, {
            name: string;
            adminEmail: string;
            tenantCode?: string | undefined;
        }>;
        responses: {
            201: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                tenantCode: z.ZodString;
                isDeleted: z.ZodBoolean;
                createdAt: z.ZodString;
                updatedAt: z.ZodNullable<z.ZodString>;
                deletedAt: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string | null;
                id: string;
                name: string;
                tenantCode: string;
                isDeleted: boolean;
                deletedAt: string | null;
            }, {
                createdAt: string;
                updatedAt: string | null;
                id: string;
                name: string;
                tenantCode: string;
                isDeleted: boolean;
                deletedAt: string | null;
            }>;
        };
    };
};
export type Tenant = z.infer<typeof TenantSchema>;
export type GetTenantsResponse = z.infer<typeof GetTenantsResponseSchema>;
export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type CreateTenantResponse = z.infer<typeof CreateTenantResponseSchema>;
