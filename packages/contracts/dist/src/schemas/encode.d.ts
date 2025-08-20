import { z } from 'zod';
export declare const EncodeRequestSchema: z.ZodEffects<z.ZodObject<{
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
export declare const EncodeResponseSchema: z.ZodObject<{
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
export declare const EncodeApiMeta: {
    readonly encode: {
        readonly method: "POST";
        readonly path: "/encode";
        readonly summary: "Embed watermark into image";
        readonly description: "Embeds text or image watermark into the target image with customizable parameters";
        readonly tags: readonly ["encode"];
        readonly requestSchema: z.ZodEffects<z.ZodObject<{
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
        readonly responseSchema: z.ZodObject<{
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
        readonly statusCode: 200;
    };
};
export type EncodeRequest = z.infer<typeof EncodeRequestSchema>;
export type EncodeResponse = z.infer<typeof EncodeResponseSchema>;
