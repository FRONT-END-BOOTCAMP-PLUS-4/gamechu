import { PrismaClient } from "../prisma/generated";
import { getTwitchAccessToken } from "../utils/GetTwitchAccessToken";
import { getEarliestReleaseDate } from "../utils/GetEarliestReleaseDate";
import { getDeveloperName } from "../utils/GetDeveloperName";

const prisma = new PrismaClient();

interface IGDBGame {
    id: number;
    name: string;
    cover?: { url: string };
    genres?: number[];
    platforms?: number[];
    themes?: number[];
    involved_companies?: {
        developer: boolean;
        company: { name: string } | null;
    }[];
    release_dates?: { date: number }[];
}

const ALLOWED_PLATFORMS = [6, 34, 39, 48, 130, 163, 169, 390, 508];
const PAGE_SIZE = 500;
const RATE_LIMIT_DELAY = 350;
const TX_TIMEOUT = 30000;

function parseArgs() {
    const args = process.argv.slice(2);
    let startId: number | null = null;
    let limit: number | null = null;
    let full = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--start-id" && args[i + 1]) {
            startId = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === "--limit" && args[i + 1]) {
            limit = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === "--full") {
            full = true;
        }
    }

    return { startId, limit, full };
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGamesPage(
    accessToken: string,
    clientId: string,
    lastId: number
): Promise<IGDBGame[]> {
    const body = `
        fields id, cover.url, genres, involved_companies.company.name, involved_companies.developer, name, platforms, release_dates.date, themes;
        where id > ${lastId} & platforms = (${ALLOWED_PLATFORMS.join(",")});
        sort id asc;
        limit ${PAGE_SIZE};
    `;

    const response = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
            "client-id": clientId,
            Authorization: `Bearer ${accessToken}`,
        },
        body,
    });

    if (response.status === 429) {
        throw new Error("RATE_LIMITED");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IGDB API error ${response.status}: ${errorText}`);
    }

    return response.json();
}

async function importBatch(games: IGDBGame[]) {
    const gameData = games.map((g) => {
        const thumbnail = g.cover?.url
            ? g.cover.url.replace("t_thumb", "t_cover_big")
            : null;
        return {
            id: g.id,
            title: g.name,
            developer: getDeveloperName(g),
            thumbnail,
            releaseDate: getEarliestReleaseDate(g),
        };
    });

    const gameGenres: { gameId: number; genreId: number }[] = [];
    const gamePlatforms: { gameId: number; platformId: number }[] = [];
    const gameThemes: { gameId: number; themeId: number }[] = [];

    for (const g of games) {
        for (const genreId of g.genres ?? []) {
            gameGenres.push({ gameId: g.id, genreId });
        }
        for (const platformId of g.platforms ?? []) {
            if (ALLOWED_PLATFORMS.includes(platformId)) {
                gamePlatforms.push({ gameId: g.id, platformId });
            }
        }
        for (const themeId of g.themes ?? []) {
            gameThemes.push({ gameId: g.id, themeId });
        }
    }

    await prisma.$transaction(
        async (tx) => {
            await tx.game.createMany({ data: gameData, skipDuplicates: true });
            if (gameGenres.length > 0) {
                await tx.gameGenre.createMany({
                    data: gameGenres,
                    skipDuplicates: true,
                });
            }
            if (gamePlatforms.length > 0) {
                await tx.gamePlatform.createMany({
                    data: gamePlatforms,
                    skipDuplicates: true,
                });
            }
            if (gameThemes.length > 0) {
                await tx.gameTheme.createMany({
                    data: gameThemes,
                    skipDuplicates: true,
                });
            }
        },
        { timeout: TX_TIMEOUT }
    );
}

async function main() {
    const { startId, limit: maxGames, full } = parseArgs();
    const clientId = process.env.TWITCH_CLIENT_ID!;
    const accessToken = await getTwitchAccessToken();

    let lastId: number;
    if (startId !== null) {
        lastId = startId;
    } else {
        const result = await prisma.game.aggregate({ _max: { id: true } });
        lastId = result._max.id ?? 0;
    }

    console.log(`Starting import from id > ${lastId} (pageSize: ${PAGE_SIZE})`);
    if (maxGames) console.log(`Limit: ${maxGames} games`);
    if (full) console.log("Mode: full import (no limit)");

    let totalImported = 0;
    let backoffMs = RATE_LIMIT_DELAY;

    while (true) {
        if (!full && maxGames && totalImported >= maxGames) {
            console.log(`Reached limit of ${maxGames} games`);
            break;
        }

        try {
            const games = await fetchGamesPage(accessToken, clientId, lastId);

            if (games.length === 0) {
                console.log("No more games found");
                break;
            }

            await importBatch(games);

            const maxId = Math.max(...games.map((g) => g.id));
            lastId = maxId;
            totalImported += games.length;
            backoffMs = RATE_LIMIT_DELAY;

            console.log(
                `Imported ${games.length} games (total: ${totalImported}, lastId: ${lastId})`
            );
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === "RATE_LIMITED"
            ) {
                backoffMs = Math.min(backoffMs * 2, 30000);
                console.warn(`Rate limited, waiting ${backoffMs}ms...`);
                await sleep(backoffMs);
                continue;
            }
            throw error;
        }

        await sleep(RATE_LIMIT_DELAY);
    }

    console.log(`\nImport complete: ${totalImported} games imported`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("Import failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
