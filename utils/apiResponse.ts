// utils/apiResponse.ts
import { NextResponse } from "next/server";

export const errorResponse = (message: string, status: number) =>
    NextResponse.json({ message }, { status });

export const successResponse = <T>(data: T, status = 200) =>
    NextResponse.json(data, { status });
