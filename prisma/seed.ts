import { Prisma, PrismaClient } from "../prisma/generated";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const seedDataDir = join(__dirname, "seed-data");
const loadJson = <T = Record<string, unknown>>(filename: string): T[] =>
    JSON.parse(readFileSync(join(seedDataDir, filename), "utf-8")) as T[];

// Prisma 6 requires full ISO-8601 DateTime (with timezone).
// JSON exports from PG may lack the 'Z' suffix — normalize them.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
function fixDates<T>(rows: T[]): T[] {
    return rows.map((row) => {
        const out: Record<string, unknown> = { ...(row as Record<string, unknown>) };
        for (const [k, v] of Object.entries(out)) {
            if (typeof v === "string" && ISO_DATE_RE.test(v)) {
                out[k] = new Date(v + "Z");
            }
        }
        return out as T;
    });
}

// --- IGDB Reference Data (hardcoded) ---

const GENRES = [
    { id: 2, name: "Point-and-click" },
    { id: 4, name: "Fighting" },
    { id: 5, name: "Shooter" },
    { id: 7, name: "Music" },
    { id: 8, name: "Platform" },
    { id: 9, name: "Puzzle" },
    { id: 10, name: "Racing" },
    { id: 11, name: "Real Time Strategy (RTS)" },
    { id: 12, name: "Role-playing (RPG)" },
    { id: 13, name: "Simulator" },
    { id: 14, name: "Sport" },
    { id: 15, name: "Strategy" },
    { id: 16, name: "Turn-based strategy (TBS)" },
    { id: 24, name: "Tactical" },
    { id: 25, name: "Hack and slash/Beat 'em up" },
    { id: 26, name: "Quiz/Trivia" },
    { id: 30, name: "Pinball" },
    { id: 31, name: "Adventure" },
    { id: 32, name: "Indie" },
    { id: 33, name: "Arcade" },
    { id: 34, name: "Visual Novel" },
    { id: 35, name: "Card & Board Game" },
    { id: 36, name: "MOBA" },
];

const PLATFORMS = [
    { id: 6, name: "PC (Microsoft Windows)" },
    { id: 34, name: "Android" },
    { id: 39, name: "iOS" },
    { id: 48, name: "PlayStation 4" },
    { id: 130, name: "Nintendo Switch" },
    { id: 163, name: "SteamVR" },
    { id: 169, name: "Xbox Series X|S" },
    { id: 390, name: "PlayStation 5" },
    { id: 508, name: "Meta Quest 3" },
];

const THEMES = [
    { id: 1, name: "Action" },
    { id: 17, name: "Fantasy" },
    { id: 18, name: "Science fiction" },
    { id: 19, name: "Horror" },
    { id: 20, name: "Thriller" },
    { id: 21, name: "Survival" },
    { id: 22, name: "Historical" },
    { id: 23, name: "Stealth" },
    { id: 27, name: "Comedy" },
    { id: 28, name: "Business" },
    { id: 31, name: "Drama" },
    { id: 32, name: "Non-fiction" },
    { id: 33, name: "Sandbox" },
    { id: 34, name: "Educational" },
    { id: 35, name: "Kids" },
    { id: 38, name: "Open world" },
    { id: 39, name: "Warfare" },
    { id: 40, name: "Party" },
    { id: 41, name: "4X (explore, expand, exploit, and exterminate)" },
    { id: 42, name: "Erotic" },
    { id: 43, name: "Mystery" },
    { id: 44, name: "Romance" },
];

const SCORE_POLICIES = [
    { id: 1, name: "출석 완료", description: "일퀘는 생명. 일퀘를 했으면 리워드를 받아야죠. 5포인트가 적립됩니다.", score: 5, imageUrl: "icons/policy-attend.svg" },
    { id: 2, name: "리뷰 삭제", description: "마따끄 리뷰를 삭제했으면 퍼니시먼트를 받아야겠지. 리뷰에 달린 좋아요 갯수만큼의 포인트가 차감됩니다.", score: 0, imageUrl: "icons/policy-review.svg" },
    { id: 3, name: "리뷰 좋아요 획득", description: "당신은 따봉겜추의 축복을 받으셨습니다! 5포인트가 적립됩니다.", score: 5, imageUrl: "icons/policy-likes.svg" },
    { id: 4, name: "투기장 참여", description: "영웅 호걸들의 시간! 투기장 참가비 100포인트 지불합니다", score: -100, imageUrl: "icons/arena.svg" },
    { id: 5, name: "투기장 승리", description: "겜안분 척결 다섯 글자의 환호성! 투기장에서 승리하셨습니다!! 190포인트가 적립됩니다.", score: 190, imageUrl: "icons/arena.svg" },
    { id: 6, name: "투기장 무승부", description: "무승부로 하지 않을래....? 참가비 100포인트를 회수합니다.", score: 100, imageUrl: "icons/arena.svg" },
    { id: 7, name: "투기장 미성립", description: "놀랍게도 그 누구도 관심을 주지 않았다. 참가비 100포인트를 회수합니다.", score: 100, imageUrl: "icons/arena.svg" },
    { id: 8, name: "리뷰 좋아요 삭제", description: "줬다 뺐는건 좀 아닌데. 5포인트가 지불됩니다.", score: -5, imageUrl: "icons/policy-likes.svg" },
];

const NOTIFICATION_TYPES = [
    { id: 1, name: "티어 승급", imageUrl: "/icons/Promote.ico" },
    { id: 2, name: "티어 강등", imageUrl: "/icons/Relegation.ico" },
    { id: 3, name: "투기장 도전자 참여 완료", imageUrl: "/icons/ArenaMatching.ico" },
    { id: 4, name: "투기장 토론 시작", imageUrl: "/icons/AranaStart.ico" },
    { id: 5, name: "투기장 투표 완료", imageUrl: "/icons/ArenaFinish.ico" },
];

async function main() {
    console.log("=== Seeding reference data ===");

    for (const g of GENRES) {
        await prisma.genre.upsert({
            where: { id: g.id },
            create: g,
            update: { name: g.name },
        });
    }
    console.log(`Genres: ${GENRES.length} upserted`);

    for (const p of PLATFORMS) {
        await prisma.platform.upsert({
            where: { id: p.id },
            create: p,
            update: { name: p.name },
        });
    }
    console.log(`Platforms: ${PLATFORMS.length} upserted`);

    for (const t of THEMES) {
        await prisma.theme.upsert({
            where: { id: t.id },
            create: t,
            update: { name: t.name },
        });
    }
    console.log(`Themes: ${THEMES.length} upserted`);

    for (const sp of SCORE_POLICIES) {
        await prisma.scorePolicy.upsert({
            where: { id: sp.id },
            create: sp,
            update: {
                name: sp.name,
                description: sp.description,
                score: sp.score,
                imageUrl: sp.imageUrl,
            },
        });
    }
    console.log(`ScorePolicies: ${SCORE_POLICIES.length} upserted`);

    for (const nt of NOTIFICATION_TYPES) {
        await prisma.notificationType.upsert({
            where: { id: nt.id },
            create: nt,
            update: { name: nt.name, imageUrl: nt.imageUrl },
        });
    }
    console.log(`NotificationTypes: ${NOTIFICATION_TYPES.length} upserted`);

    // --- Sample Data (from JSON) ---
    console.log("\n=== Seeding sample data from JSON ===");

    const members = fixDates(loadJson<Prisma.MemberCreateManyInput>("members.json"));
    const games = fixDates(loadJson<Prisma.GameCreateManyInput>("games.json"));
    const gameGenresRaw = loadJson<{ game_id: number; genre_id: number }>("game_genres.json");
    const gamePlatformsRaw = loadJson<{ game_id: number; platform_id: number }>("game_platforms.json");
    const gameThemesRaw = loadJson<{ game_id: number; theme_id: number }>("game_themes.json");
    const reviews = fixDates(loadJson<Prisma.ReviewCreateManyInput>("reviews.json"));
    const reviewLikes = loadJson<Prisma.ReviewLikeCreateManyInput>("review_likes.json");
    const wishlists = loadJson<Prisma.WishlistCreateManyInput>("wishlists.json");
    const arenas = fixDates(loadJson<Prisma.ArenaCreateManyInput>("arenas.json"));
    const chattings = fixDates(loadJson<Prisma.ChattingCreateManyInput>("chattings.json"));
    const votes = loadJson<Prisma.VoteCreateManyInput>("votes.json");
    const preferredGenres = loadJson<Prisma.PreferredGenreCreateManyInput>("preferred_genres.json");
    const preferredPlatforms = loadJson<Prisma.PreferredPlatformCreateManyInput>("preferred_platforms.json");
    const preferredThemes = loadJson<Prisma.PreferredThemeCreateManyInput>("preferred_themes.json");
    const scoreRecords = fixDates(loadJson<Prisma.ScoreRecordCreateManyInput>("score_records.json"));

    // Map snake_case JSON keys to camelCase Prisma fields for junction tables
    const gameGenres = gameGenresRaw.map((r) => ({
        gameId: r.game_id,
        genreId: r.genre_id,
    }));
    const gamePlatforms = gamePlatformsRaw.map((r) => ({
        gameId: r.game_id,
        platformId: r.platform_id,
    }));
    const gameThemes = gameThemesRaw.map((r) => ({
        gameId: r.game_id,
        themeId: r.theme_id,
    }));

    // FK dependency order: Member → Game → Junctions → Review → ReviewLike →
    // Wishlist → Arena → Chatting → Vote → Preferred* → ScoreRecord
    await prisma.$transaction([
        prisma.member.createMany({ data: members, skipDuplicates: true }),
        prisma.game.createMany({ data: games, skipDuplicates: true }),
        prisma.gameGenre.createMany({ data: gameGenres, skipDuplicates: true }),
        prisma.gamePlatform.createMany({
            data: gamePlatforms,
            skipDuplicates: true,
        }),
        prisma.gameTheme.createMany({
            data: gameThemes,
            skipDuplicates: true,
        }),
        prisma.review.createMany({ data: reviews, skipDuplicates: true }),
        prisma.reviewLike.createMany({
            data: reviewLikes,
            skipDuplicates: true,
        }),
        prisma.wishlist.createMany({ data: wishlists, skipDuplicates: true }),
        prisma.arena.createMany({ data: arenas, skipDuplicates: true }),
        prisma.chatting.createMany({ data: chattings, skipDuplicates: true }),
        prisma.vote.createMany({ data: votes, skipDuplicates: true }),
        prisma.preferredGenre.createMany({
            data: preferredGenres,
            skipDuplicates: true,
        }),
        prisma.preferredPlatform.createMany({
            data: preferredPlatforms,
            skipDuplicates: true,
        }),
        prisma.preferredTheme.createMany({
            data: preferredThemes,
            skipDuplicates: true,
        }),
        prisma.scoreRecord.createMany({
            data: scoreRecords,
            skipDuplicates: true,
        }),
    ]);
    console.log("Sample data inserted (skipDuplicates)");

    // --- PG Sequence Sync ---
    console.log("\n=== Syncing PG sequences ===");
    const sequenceTables = [
        "genres",
        "platforms",
        "themes",
        "score_policies",
        "notification_types",
        "game_genres",
        "game_platforms",
        "game_themes",
        "arenas",
        "chattings",
        "reviews",
        "review_likes",
        "wishlists",
        "votes",
        "preferred_genres",
        "preferred_platforms",
        "preferred_themes",
        "score_records",
        "notification_records",
    ];
    for (const table of sequenceTables) {
        await prisma.$queryRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), COALESCE((SELECT MAX(id) FROM "${table}"), 0) > 0)`
        );
    }
    console.log(`Sequences synced for ${sequenceTables.length} tables`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log("\nSeed completed successfully!");
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
