import redis from "@/lib/Redis";
import { NextResponse } from "next/server";

export async function GET() {
    const keys = await redis.keys("*");
    return NextResponse.json({ keys });
}
