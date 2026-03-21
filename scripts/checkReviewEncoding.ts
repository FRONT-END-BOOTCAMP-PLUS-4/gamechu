import { prisma } from "../lib/prisma";

async function main() {
    const reviews = await prisma.$queryRaw<{ id: number; memberId: string; gameId: number; content: string; rating: number; createdAt: Date; nickname: string }[]>`
        SELECT r.id, r."memberId", r."gameId", r.content, r.rating, r."createdAt",
               m.nickname
        FROM "Review" r
        JOIN "Member" m ON m.id = r."memberId"
        WHERE r."gameId" = 115
        ORDER BY r.id DESC
        LIMIT 10
    `;
    for (const r of reviews) {
        const content = r.content as string;
        console.log(`\n--- Review id=${r.id} (${r.nickname}) ---`);
        console.log("hex (first 100 bytes):", Buffer.from(content, "utf8").slice(0, 100).toString("hex"));
        try {
            const parsed = JSON.parse(content);
            const text = parsed?.root?.children?.[0]?.children?.[0]?.text ?? "(no text)";
            console.log("text:", JSON.stringify(text));
        } catch (e) {
            console.log("parse error:", (e as Error).message);
            console.log("content raw:", content.slice(0, 300));
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
