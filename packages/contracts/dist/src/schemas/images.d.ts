import { z } from 'zod';
export declare const GetImagesQuerySchema: z.ZodObject<{
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
export declare const ImageItemSchema: z.ZodObject<{
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
export declare const GetImagesResponseSchema: z.ZodObject<{
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
export declare const UploadImageRequestSchema: z.ZodObject<{
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
export declare const UploadImageResponseSchema: z.ZodObject<{
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
export declare const ImagesApiMeta: {
    getImages: {
        method: "GET";
        path: string;
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
        path: string;
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
        method: "PATCH";
        path: string;
        pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        body: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export type GetImagesQuery = z.infer<typeof GetImagesQuerySchema>;
export type ImageItem = z.infer<typeof ImageItemSchema>;
export type GetImagesResponse = z.infer<typeof GetImagesResponseSchema>;
export type UploadImageRequest = z.infer<typeof UploadImageRequestSchema>;
export type UploadImageResponse = z.infer<typeof UploadImageResponseSchema>;
