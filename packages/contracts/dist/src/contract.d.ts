import { z } from 'zod';
export declare const contract: {
    jobs: {
        readonly createJob: {
            readonly summary: "Create a new job";
            readonly description: "Creates a new watermark embedding or decoding job";
            readonly method: "POST";
            readonly body: z.ZodObject<{
                type: z.ZodEnum<["EMBED", "DECODE"]>;
                srcImagePath: z.ZodString;
                payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                srcImagePath: string;
                type: "EMBED" | "DECODE";
                payload: Record<string, unknown>;
            }, {
                srcImagePath: string;
                type: "EMBED" | "DECODE";
                payload?: Record<string, unknown> | undefined;
            }>;
            readonly tags: readonly ["jobs"];
            path: "/api/v1/jobs";
            responses: {
                readonly 201: z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<["EMBED", "DECODE"]>;
                    status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
                    createdAt: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    id: string;
                }, {
                    createdAt: string;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    id: string;
                }>;
            };
        };
        readonly getJobs: {
            readonly query: z.ZodObject<{
                filter: z.ZodOptional<z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>>;
                search: z.ZodOptional<z.ZodString>;
                startDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
                endDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
                cursor: z.ZodOptional<z.ZodString>;
                limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
                userId: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                limit?: number | undefined;
                search?: string | undefined;
                userId?: string | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                filter?: "all" | "embed" | "decode" | undefined;
                cursor?: string | undefined;
            }, {
                limit?: number | undefined;
                search?: string | undefined;
                userId?: string | undefined;
                startDate?: unknown;
                endDate?: unknown;
                filter?: "all" | "embed" | "decode" | undefined;
                cursor?: string | undefined;
            }>;
            readonly summary: "Get jobs list";
            readonly description: "Retrieves a paginated list of jobs with optional filtering";
            readonly method: "GET";
            readonly tags: readonly ["jobs"];
            path: "/api/v1/jobs";
            responses: {
                readonly 200: z.ZodObject<{
                    jobs: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
                        id: z.ZodString;
                        type: z.ZodEnum<["EMBED", "DECODE"]>;
                        status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
                        createdAt: z.ZodString;
                    }, {
                        srcImagePath: z.ZodNullable<z.ZodString>;
                        thumbnailPath: z.ZodNullable<z.ZodString>;
                        params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    }>, "strip", z.ZodTypeAny, {
                        createdAt: string;
                        srcImagePath: string | null;
                        params: Record<string, unknown> | null;
                        type: "EMBED" | "DECODE";
                        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                        id: string;
                        thumbnailPath: string | null;
                    }, {
                        createdAt: string;
                        srcImagePath: string | null;
                        params: Record<string, unknown> | null;
                        type: "EMBED" | "DECODE";
                        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                        id: string;
                        thumbnailPath: string | null;
                    }>, "many">;
                    nextCursor: z.ZodNullable<z.ZodString>;
                    hasNextPage: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    jobs: {
                        createdAt: string;
                        srcImagePath: string | null;
                        params: Record<string, unknown> | null;
                        type: "EMBED" | "DECODE";
                        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                        id: string;
                        thumbnailPath: string | null;
                    }[];
                    nextCursor: string | null;
                    hasNextPage: boolean;
                }, {
                    jobs: {
                        createdAt: string;
                        srcImagePath: string | null;
                        params: Record<string, unknown> | null;
                        type: "EMBED" | "DECODE";
                        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                        id: string;
                        thumbnailPath: string | null;
                    }[];
                    nextCursor: string | null;
                    hasNextPage: boolean;
                }>;
            };
        };
        readonly deleteJob: {
            readonly pathParams: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            readonly summary: "Delete a job";
            readonly description: "Deletes a job by its ID";
            readonly method: "DELETE";
            readonly body: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
            readonly tags: readonly ["jobs"];
            path: "/api/v1/jobs/:id";
            responses: {
                readonly 200: z.ZodObject<{
                    message: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
        };
    };
    images: {
        getImages: {
            query: z.ZodObject<{
                page: z.ZodDefault<z.ZodNumber>;
                limit: z.ZodDefault<z.ZodNumber>;
                sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "userName", "srcImagePath"]>>;
                sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
                search: z.ZodOptional<z.ZodString>;
                userId: z.ZodOptional<z.ZodString>;
                startDate: z.ZodOptional<z.ZodString>;
                endDate: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                page: number;
                limit: number;
                sortBy: "createdAt" | "updatedAt" | "userName" | "srcImagePath";
                sortOrder: "asc" | "desc";
                search?: string | undefined;
                userId?: string | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
            }, {
                page?: number | undefined;
                limit?: number | undefined;
                sortBy?: "createdAt" | "updatedAt" | "userName" | "srcImagePath" | undefined;
                sortOrder?: "asc" | "desc" | undefined;
                search?: string | undefined;
                userId?: string | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
            }>;
            method: "GET";
            path: string;
            responses: {
                200: z.ZodObject<{
                    data: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        srcImagePath: z.ZodString;
                        thumbnailPath: z.ZodNullable<z.ZodString>;
                        userName: z.ZodString;
                        createdAt: z.ZodString;
                        params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, "strip", z.ZodTypeAny, {
                        createdAt: string;
                        userName: string;
                        srcImagePath: string;
                        params: Record<string, any> | null;
                        id: string;
                        thumbnailPath: string | null;
                    }, {
                        createdAt: string;
                        userName: string;
                        srcImagePath: string;
                        params: Record<string, any> | null;
                        id: string;
                        thumbnailPath: string | null;
                    }>, "many">;
                    meta: z.ZodObject<{
                        total: z.ZodNumber;
                        page: z.ZodNumber;
                        limit: z.ZodNumber;
                        totalPages: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    }, {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    data: {
                        createdAt: string;
                        userName: string;
                        srcImagePath: string;
                        params: Record<string, any> | null;
                        id: string;
                        thumbnailPath: string | null;
                    }[];
                    meta: {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    };
                }, {
                    data: {
                        createdAt: string;
                        userName: string;
                        srcImagePath: string;
                        params: Record<string, any> | null;
                        id: string;
                        thumbnailPath: string | null;
                    }[];
                    meta: {
                        page: number;
                        limit: number;
                        total: number;
                        totalPages: number;
                    };
                }>;
            };
        };
        uploadImage: {
            method: "POST";
            body: z.ZodObject<{
                fileName: z.ZodString;
                contentType: z.ZodString;
                size: z.ZodNumber;
                folder: z.ZodDefault<z.ZodEnum<["images", "thumbnails", "results"]>>;
            }, "strip", z.ZodTypeAny, {
                fileName: string;
                contentType: string;
                size: number;
                folder: "images" | "thumbnails" | "results";
            }, {
                fileName: string;
                contentType: string;
                size: number;
                folder?: "images" | "thumbnails" | "results" | undefined;
            }>;
            path: string;
            responses: {
                200: z.ZodObject<{
                    uploadUrl: z.ZodString;
                    downloadUrl: z.ZodOptional<z.ZodString>;
                    filePath: z.ZodString;
                    expiresIn: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    uploadUrl: string;
                    filePath: string;
                    expiresIn: number;
                    downloadUrl?: string | undefined;
                }, {
                    uploadUrl: string;
                    filePath: string;
                    expiresIn: number;
                    downloadUrl?: string | undefined;
                }>;
            };
        };
        archiveImage: {
            pathParams: z.ZodObject<{
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
            }, {
                id: string;
            }>;
            method: "PATCH";
            body: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
            path: string;
            responses: {
                200: z.ZodObject<{
                    id: z.ZodString;
                    srcImagePath: z.ZodString;
                    thumbnailPath: z.ZodNullable<z.ZodString>;
                    userName: z.ZodString;
                    createdAt: z.ZodString;
                    params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    userName: string;
                    srcImagePath: string;
                    params: Record<string, any> | null;
                    id: string;
                    thumbnailPath: string | null;
                }, {
                    createdAt: string;
                    userName: string;
                    srcImagePath: string;
                    params: Record<string, any> | null;
                    id: string;
                    thumbnailPath: string | null;
                }>;
            };
        };
    };
    logs: {
        getLogs: {
            query: z.ZodObject<{
                filter: z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>;
                search: z.ZodOptional<z.ZodString>;
                startDate: z.ZodOptional<z.ZodString>;
                endDate: z.ZodOptional<z.ZodString>;
                cursor: z.ZodOptional<z.ZodString>;
                limit: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                limit: number;
                filter: "all" | "embed" | "decode";
                search?: string | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                cursor?: string | undefined;
            }, {
                limit?: number | undefined;
                search?: string | undefined;
                startDate?: string | undefined;
                endDate?: string | undefined;
                filter?: "all" | "embed" | "decode" | undefined;
                cursor?: string | undefined;
            }>;
            method: "GET";
            path: string;
            responses: {
                200: z.ZodObject<{
                    jobs: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        status: z.ZodString;
                        tenantId: z.ZodString;
                        userId: z.ZodString;
                        userName: z.ZodString;
                        srcImagePath: z.ZodString;
                        imageUrl: z.ZodString;
                        thumbnailPath: z.ZodNullable<z.ZodString>;
                        params: z.ZodRecord<z.ZodString, z.ZodAny>;
                        result: z.ZodRecord<z.ZodString, z.ZodAny>;
                        startedAt: z.ZodString;
                        finishedAt: z.ZodNullable<z.ZodString>;
                        durationMs: z.ZodNullable<z.ZodNumber>;
                        ip: z.ZodNullable<z.ZodString>;
                        ua: z.ZodNullable<z.ZodString>;
                        createdAt: z.ZodString;
                        updatedAt: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        createdAt: string;
                        updatedAt: string;
                        userName: string;
                        srcImagePath: string;
                        userId: string;
                        params: Record<string, any>;
                        type: string;
                        status: string;
                        id: string;
                        thumbnailPath: string | null;
                        tenantId: string;
                        imageUrl: string;
                        result: Record<string, any>;
                        startedAt: string;
                        finishedAt: string | null;
                        durationMs: number | null;
                        ip: string | null;
                        ua: string | null;
                    }, {
                        createdAt: string;
                        updatedAt: string;
                        userName: string;
                        srcImagePath: string;
                        userId: string;
                        params: Record<string, any>;
                        type: string;
                        status: string;
                        id: string;
                        thumbnailPath: string | null;
                        tenantId: string;
                        imageUrl: string;
                        result: Record<string, any>;
                        startedAt: string;
                        finishedAt: string | null;
                        durationMs: number | null;
                        ip: string | null;
                        ua: string | null;
                    }>, "many">;
                    nextCursor: z.ZodNullable<z.ZodString>;
                    hasNextPage: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    jobs: {
                        createdAt: string;
                        updatedAt: string;
                        userName: string;
                        srcImagePath: string;
                        userId: string;
                        params: Record<string, any>;
                        type: string;
                        status: string;
                        id: string;
                        thumbnailPath: string | null;
                        tenantId: string;
                        imageUrl: string;
                        result: Record<string, any>;
                        startedAt: string;
                        finishedAt: string | null;
                        durationMs: number | null;
                        ip: string | null;
                        ua: string | null;
                    }[];
                    nextCursor: string | null;
                    hasNextPage: boolean;
                }, {
                    jobs: {
                        createdAt: string;
                        updatedAt: string;
                        userName: string;
                        srcImagePath: string;
                        userId: string;
                        params: Record<string, any>;
                        type: string;
                        status: string;
                        id: string;
                        thumbnailPath: string | null;
                        tenantId: string;
                        imageUrl: string;
                        result: Record<string, any>;
                        startedAt: string;
                        finishedAt: string | null;
                        durationMs: number | null;
                        ip: string | null;
                        ua: string | null;
                    }[];
                    nextCursor: string | null;
                    hasNextPage: boolean;
                }>;
            };
        };
        createJob: {
            method: "POST";
            body: z.ZodObject<{
                type: z.ZodEnum<["EMBED", "DECODE"]>;
                srcImagePath: z.ZodString;
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, "strip", z.ZodTypeAny, {
                srcImagePath: string;
                type: "EMBED" | "DECODE";
                params?: Record<string, any> | undefined;
            }, {
                srcImagePath: string;
                type: "EMBED" | "DECODE";
                params?: Record<string, any> | undefined;
            }>;
            path: string;
            responses: {
                201: z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    status: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodString;
                    userName: z.ZodString;
                    srcImagePath: z.ZodString;
                    imageUrl: z.ZodString;
                    createdAt: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    type: string;
                    status: string;
                    id: string;
                    tenantId: string;
                    imageUrl: string;
                }, {
                    createdAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    type: string;
                    status: string;
                    id: string;
                    tenantId: string;
                    imageUrl: string;
                }>;
            };
        };
    };
    users: {
        getUsers: {
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
            method: "GET";
            path: string;
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
            path: string;
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
    admin: {
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
            path: string;
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
    getLogById: {
        pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        method: "GET";
        path: "/api/v1/logs/:id";
        responses: {
            200: z.ZodNullable<z.ZodObject<{
                id: z.ZodString;
                action: z.ZodString;
                createdAt: z.ZodString;
                userName: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                userName: string | null;
                id: string;
                action: string;
            }, {
                createdAt: string;
                userName: string | null;
                id: string;
                action: string;
            }>>;
        };
    };
    decode: {
        method: "POST";
        body: z.ZodObject<{
            inputFileName: z.ZodString;
            blockSize: z.ZodDefault<z.ZodNumber>;
            timer: z.ZodDefault<z.ZodNumber>;
            widthScalingFrom: z.ZodDefault<z.ZodNumber>;
            widthScalingTo: z.ZodDefault<z.ZodNumber>;
            heightScalingFrom: z.ZodDefault<z.ZodNumber>;
            heightScalingTo: z.ZodDefault<z.ZodNumber>;
            rotationFrom: z.ZodDefault<z.ZodNumber>;
            rotationTo: z.ZodDefault<z.ZodNumber>;
            logfile: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            inputFileName: string;
            blockSize: number;
            timer: number;
            widthScalingFrom: number;
            widthScalingTo: number;
            heightScalingFrom: number;
            heightScalingTo: number;
            rotationFrom: number;
            rotationTo: number;
            logfile: string;
        }, {
            inputFileName: string;
            blockSize?: number | undefined;
            timer?: number | undefined;
            widthScalingFrom?: number | undefined;
            widthScalingTo?: number | undefined;
            heightScalingFrom?: number | undefined;
            heightScalingTo?: number | undefined;
            rotationFrom?: number | undefined;
            rotationTo?: number | undefined;
            logfile?: string | undefined;
        }>;
        path: "/api/v1/decode";
        responses: {
            200: z.ZodObject<{
                result: z.ZodString;
                success: z.ZodOptional<z.ZodBoolean>;
                error: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                result: string;
                success?: boolean | undefined;
                error?: string | undefined;
            }, {
                result: string;
                success?: boolean | undefined;
                error?: string | undefined;
            }>;
        };
    };
    encode: {
        method: "POST";
        body: z.ZodEffects<z.ZodObject<{
            inputFileName: z.ZodString;
            watermarkText: z.ZodOptional<z.ZodString>;
            watermarkImage: z.ZodOptional<z.ZodString>;
            outputFormat: z.ZodDefault<z.ZodEnum<["jpg", "png", "webp"]>>;
            quality: z.ZodDefault<z.ZodNumber>;
            blockSize: z.ZodDefault<z.ZodNumber>;
            strength: z.ZodDefault<z.ZodNumber>;
            position: z.ZodDefault<z.ZodEnum<["center", "top-left", "top-right", "bottom-left", "bottom-right"]>>;
            opacity: z.ZodDefault<z.ZodNumber>;
            rotation: z.ZodDefault<z.ZodNumber>;
            scale: z.ZodDefault<z.ZodNumber>;
            logfile: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            inputFileName: string;
            blockSize: number;
            logfile: string;
            outputFormat: "jpg" | "png" | "webp";
            quality: number;
            strength: number;
            position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
            opacity: number;
            rotation: number;
            scale: number;
            watermarkText?: string | undefined;
            watermarkImage?: string | undefined;
        }, {
            inputFileName: string;
            blockSize?: number | undefined;
            logfile?: string | undefined;
            watermarkText?: string | undefined;
            watermarkImage?: string | undefined;
            outputFormat?: "jpg" | "png" | "webp" | undefined;
            quality?: number | undefined;
            strength?: number | undefined;
            position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | undefined;
            opacity?: number | undefined;
            rotation?: number | undefined;
            scale?: number | undefined;
        }>, {
            inputFileName: string;
            blockSize: number;
            logfile: string;
            outputFormat: "jpg" | "png" | "webp";
            quality: number;
            strength: number;
            position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
            opacity: number;
            rotation: number;
            scale: number;
            watermarkText?: string | undefined;
            watermarkImage?: string | undefined;
        }, {
            inputFileName: string;
            blockSize?: number | undefined;
            logfile?: string | undefined;
            watermarkText?: string | undefined;
            watermarkImage?: string | undefined;
            outputFormat?: "jpg" | "png" | "webp" | undefined;
            quality?: number | undefined;
            strength?: number | undefined;
            position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | undefined;
            opacity?: number | undefined;
            rotation?: number | undefined;
            scale?: number | undefined;
        }>;
        path: "/api/v1/encode";
        responses: {
            200: z.ZodObject<{
                result: z.ZodString;
                outputFileName: z.ZodOptional<z.ZodString>;
                success: z.ZodOptional<z.ZodBoolean>;
                error: z.ZodOptional<z.ZodString>;
                metadata: z.ZodOptional<z.ZodObject<{
                    originalSize: z.ZodOptional<z.ZodNumber>;
                    compressedSize: z.ZodOptional<z.ZodNumber>;
                    compressionRatio: z.ZodOptional<z.ZodNumber>;
                    processingTimeMs: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    originalSize?: number | undefined;
                    compressedSize?: number | undefined;
                    compressionRatio?: number | undefined;
                    processingTimeMs?: number | undefined;
                }, {
                    originalSize?: number | undefined;
                    compressedSize?: number | undefined;
                    compressionRatio?: number | undefined;
                    processingTimeMs?: number | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                result: string;
                metadata?: {
                    originalSize?: number | undefined;
                    compressedSize?: number | undefined;
                    compressionRatio?: number | undefined;
                    processingTimeMs?: number | undefined;
                } | undefined;
                success?: boolean | undefined;
                error?: string | undefined;
                outputFileName?: string | undefined;
            }, {
                result: string;
                metadata?: {
                    originalSize?: number | undefined;
                    compressedSize?: number | undefined;
                    compressionRatio?: number | undefined;
                    processingTimeMs?: number | undefined;
                } | undefined;
                success?: boolean | undefined;
                error?: string | undefined;
                outputFileName?: string | undefined;
            }>;
        };
    };
};
