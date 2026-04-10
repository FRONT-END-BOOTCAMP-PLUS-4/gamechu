import { z } from "zod";
import { NextResponse } from "next/server";

export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
):
    | { success: true; data: T }
    | { success: false; response: NextResponse<{ message: string }> } {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            response: NextResponse.json(
                { message: result.error.issues[0].message },
                { status: 400 }
            ),
        };
    }
    return { success: true, data: result.data };
}

export const IdSchema = z.coerce.number().int().positive();
