import { NextResponse } from "next/server";

export function ErrorHandling(
    condition: boolean,
    errorMessage: string,
    status: number
) {
    if (condition) {
        console.warn(errorMessage);
        return NextResponse.json({ error: errorMessage }, { status });
    }
    // 조건이 false면 undefined 반환 (그냥 계속 진행)
    return undefined;
}
