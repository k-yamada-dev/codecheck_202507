import { z } from 'zod';
export declare const DecodeRequestSchema: z.ZodObject<{
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
export declare const DecodeResponseSchema: z.ZodObject<{
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
export declare const DecodeApiMeta: {
    readonly decode: {
        readonly method: "POST";
        readonly path: "/decode";
        readonly summary: "Decode watermark from image";
        readonly description: "Extracts watermark information from an image using various transformation parameters";
        readonly tags: readonly ["decode"];
        readonly requestSchema: z.ZodObject<{
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
        readonly responseSchema: z.ZodObject<{
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
        readonly statusCode: 200;
    };
};
export type DecodeRequest = z.infer<typeof DecodeRequestSchema>;
export type DecodeResponse = z.infer<typeof DecodeResponseSchema>;
