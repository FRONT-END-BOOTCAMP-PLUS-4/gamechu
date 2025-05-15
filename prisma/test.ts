import dotenv from "dotenv";
import { getTwitchAccessToken } from "@/utils/GetTwitchAccessToken";
import { PrismaClient } from "./generated";
import { getEarliestReleaseDate } from "@/utils/GetEarliestReleaseDate";
import { getDeveloperName } from "@/utils/GetDeveloperName";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
async function main() {
    const clientId = process.env.TWITCH_CLIENT_ID!;
    try {
        const accessToken = await getTwitchAccessToken();
        console.log("Access Token:", accessToken);

        const gameResponse = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "text/plain",
            },
            body: `
                fields id, cover.url, genres, involved_companies.company.name, involved_companies.developer, name, platforms, release_dates.date, themes;
                where platforms = (6, 34, 39, 48, 130, 163, 169, 390, 508);
                sort id asc;
                limit 50;
                offset 0;
                `,
        });

        if (!gameResponse.ok) {
            throw new Error("Failed to fetch games from IGDB");
        }

        const games = await gameResponse.json();

        games.forEach((game: any) => {
            game.releaseDate = getEarliestReleaseDate(game);
            game.developer = getDeveloperName(game);
        });
        // games.forEach((g) => console.log(g.release_dates));
        console.log(JSON.stringify(games, null, 2));
    } catch (error) {
        {
            console.error("Error fetching themes:", error);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
