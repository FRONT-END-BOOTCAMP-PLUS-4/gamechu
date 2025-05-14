import { getTwitchAccessToken } from "@/utils/GetTwitchAccessToken";
import { PrismaClient } from "./generated";

const prisma = new PrismaClient();
async function main() {
    const clientId = process.env.TWITCH_CLIENT_ID!;
    try {
        const accessToken = await getTwitchAccessToken();
        console.log("Access Token:", accessToken);

        const genreResponse = await fetch("https://api.igdb.com/v4/genres", {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "text/plain",
            },
            body: `
    fields id, name;
    limit 50;
  `,
        });

        if (!genreResponse.ok) {
            throw new Error("Failed to fetch games from IGDB");
        }

        const genres = await genreResponse.json();
        console.log(genres);
    } catch (error) {
        {
            console.error("Error fetching games:", error);
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
