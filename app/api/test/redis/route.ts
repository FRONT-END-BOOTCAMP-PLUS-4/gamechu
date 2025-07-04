import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
    const keys = await redis.keys("*");
    return NextResponse.json({ keys });
}
