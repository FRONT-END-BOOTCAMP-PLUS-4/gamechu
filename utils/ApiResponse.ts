// utils/ApiResponse.ts
import { NextResponse } from "next/server";

export const errorResponse = (message: string, status: number) =>
    NextResponse.json({ message }, { status });
