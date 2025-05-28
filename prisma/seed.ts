import { getTwitchAccessToken } from "@/utils/GetTwitchAccessToken";
import { PrismaClient } from "./generated";
import { getEarliestReleaseDate } from "@/utils/GetEarliestReleaseDate";
import { getDeveloperName } from "@/utils/GetDeveloperName";
// import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
    // ... you will write your Prisma Client queries here
    // --- Arena --------------------------
    const newArenas = await prisma.arena.createMany({
        data: [
            // {
            //     creatorId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     challengerId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     title: "홓의 황족 라인은 미드다",
            //     description: "근본 미드가 짱이다. 다른 라인은 들러리일 뿐.",
            //     status: 5,
            //     startDate: "2025-05-15T02:00:00Z",
            // },
        ],
    });
    console.log({ newArenas });

    // --- Chatting -----------------------
    const newChattings = await prisma.chatting.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     arenaId: 2,
            //     content:
            //         "미드가 롤도 가장 잘하고 가장 중요하니까 황족 라인에 가장 어울려!",
            //     createdAt: "2025-05-15T02:01:00Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     arenaId: 2,
            //     content:
            //         "아니야! 맵 전반적인 영향력은 정글이 더 중요해! 그러니까 정글이야말로 백정이 아닌 황족 라인이야!",
            //     createdAt: "2025-05-15T02:02:00Z",
            // },
        ],
    });
    console.log({ newChattings });

    // IGDB API -> game*, genre, platform, theme, 받아오기
    const clientId = process.env.TWITCH_CLIENT_ID!;
    try {
        const accessToken = await getTwitchAccessToken();

        // --- Game ---------------------------
        const gameResponse = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "client-id": clientId,
                Authorization: `Bearer ${accessToken}`,
            },
            body: `
                fields id, cover.url, genres, involved_companies.company.name, involved_companies.developer, name, platforms, release_dates.date, themes;
                where platforms = (6, 34, 39, 48, 130, 163, 169, 390, 508);
                sort id asc;
                limit 50;
                offset 100;
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

        const newGames = await prisma.game.createMany({
            data: games.map((g: any) => {
                return {
                    id: g.id,
                    title: g.name,
                    developer: g.developer,
                    thumbnail: g.cover.url,
                    releaseDate: g.releaseDate,
                };
            }),
        });
        console.log({ newGames });

        // --- Genres -------------------------
        // const genreResponse = await fetch("https://api.igdb.com/v4/genres", {
        //     method: "POST",
        //     headers: {
        //         "client-id": clientId,
        //         Authorization: `Bearer ${accessToken}`,
        //     },
        //     body: `
        //     fields id, name;
        //     limit 50;
        //     `,
        // });

        // if (!genreResponse.ok) {
        //     throw new Error("Failed to fetch genres from IGDB");
        // }

        // const genres = await genreResponse.json();
        // const newGenres = await prisma.genre.createMany({
        //     data: genres.map((g: any) => {
        //         return {
        //             id: g.id,
        //             name: g.name,
        //         };
        //     }),
        // });
        // console.log({ newGenres });

        // --- Platforms ----------------------
        // const platformResponse = await fetch(
        //     "https://api.igdb.com/v4/platforms",
        //     {
        //         method: "POST",
        //         headers: {
        //             "client-id": clientId,
        //             Authorization: `Bearer ${accessToken}`,
        //         },
        //         body: `
        //             fields id, name;
        //             limit 400;
        //         `,
        //     }
        // );

        // if (!platformResponse.ok) {
        //     throw new Error("Failed to fetch platforms from IGDB");
        // }

        // const platforms = await platformResponse.json();
        // console.log(platforms);

        // const newPlatforms = await prisma.platform.createMany({
        //     data: platforms.map((p: any) => {
        //         return {
        //             id: p.id,
        //             name: p.name,
        //         };
        //     }),
        // });
        // console.log({ newPlatforms });

        // --- Themes -------------------------
        // const themeResponse = await fetch("https://api.igdb.com/v4/themes", {
        //     method: "POST",
        //     headers: {
        //         "client-id": clientId,
        //         Authorization: `Bearer ${accessToken}`,
        //     },
        //     body: `
        //     fields id, name;
        //     limit 50;
        //     `,
        // });

        // if (!themeResponse.ok) {
        //     throw new Error("Failed to fetch themes from IGDB");
        // }

        // const themes = await themeResponse.json();
        // console.log(themes);

        // const newThemes = await prisma.theme.createMany({
        //     data: themes.map((t: any) => {
        //         return {
        //             id: t.id,
        //             name: t.name,
        //         };
        //     }),
        // });
        // console.log({ newThemes });

        // --- GameGenres ---------------------
        const gameGenres = [];
        for (const g of games) {
            const genreIds = g.genres ?? [];
            for (const genreId of genreIds) {
                gameGenres.push({
                    gameId: g.id,
                    genreId,
                });
            }
        }
        const newGameGenres = await prisma.gameGenre.createMany({
            data: gameGenres,
        });
        console.log({ newGameGenres });

        // --- GamePlatforms ------------------
        const allowedPlatformIds = [6, 34, 39, 48, 130, 163, 169, 390, 508];
        const gamePlatforms = [];
        for (const g of games) {
            const platformIds = g.platforms ?? [];
            for (const platformId of platformIds) {
                if (allowedPlatformIds.includes(platformId))
                    gamePlatforms.push({
                        gameId: g.id,
                        platformId,
                    });
            }
        }
        const newGamePlatforms = await prisma.gamePlatform.createMany({
            data: gamePlatforms,
        });
        console.log({ newGamePlatforms });

        // --- GameThemes ---------------------
        const gameThemes = [];
        for (const g of games) {
            const themeIds = g.themes ?? [];
            for (const themeId of themeIds) {
                gameThemes.push({
                    gameId: g.id,
                    themeId,
                });
            }
        }
        const newGameThemes = await prisma.gameTheme.createMany({
            data: gameThemes,
        });
        console.log({ newGameThemes });
    } catch (error) {
        console.error(`Error fetching game informations from IGDB: ${error}`);
    }

    // --- Member -------------------------
    const newMembers = await prisma.member.createMany({
        data: [
            // {
            //     id: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     nickname: "멋사",
            //     email: "mutsa@newlecture.com",
            //     password: "1234", // need to add encoding scheme later
            //     imageUrl: "@/public/images/default.png",
            //     birthDate: "2000-01-02T00:00:00.000Z",
            //     isMale: true,
            //     score: 1250,
            //     isAttended: true,
            //     createdAt: "2025-05-15T00:53:08.835Z",
            // },
            // {
            //     id: "e755441d-1979-4617-acd5-531f2f898b22",
            //     nickname: "겜잘알",
            //     email: "gamejalal@newlecture.com",
            //     password: "1234",
            //     imageUrl: "@/public/images/default.png",
            //     birthDate: "1999-12-31T00:00:00.000Z",
            //     isMale: false,
            //     score: 3300,
            //     isAttended: true,
            //     createdAt: "2025-05-15T01:12:34.835Z",
            // },
        ],
    });
    console.log({ newMembers });

    // --- NotificationRecord -------------
    const newNotificationRecords = await prisma.notificationRecord.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     typeId: 1,
            //     description: "실버 IV 단계로 승급하셨습니다. 축하합니다!",
            //     createdAt: "2025-05-15T00:55:08.835Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     typeId: 2,
            //     description: "플래티넘 IV 단계로 강등되셨습니다.",
            //     createdAt: "2025-05-15T01:20:30.835Z",
            // },
        ],
    });
    console.log({ newNotificationRecords });

    // --- NotificationType ---------------
    const newNotificationTypes = await prisma.notificationType.createMany({
        data: [
            // {
            //     name: "티어 승급",
            //     imageUrl: "@/public/icons/Promote.ico",
            // },
            // {
            //     name: "티어 강등",
            //     imageUrl: "@/public/icons/Relegation.ico",
            // },
            // {
            //     name: "투기장 도전자 참여 완료",
            //     imageUrl: "@/public/icons/ArenaMatching.ico",
            // },
            // {
            //     name: "투기장 토론 시작",
            //     imageUrl: "@/public/icons/AranaStart.ico",
            // },
            // {
            //     name: "투기장 투표 완료",
            //     imageUrl: "@/public/icons/ArenaFinish.ico",
            // },
        ],
    });
    console.log({ newNotificationTypes });

    // --- PreferredGenres ----------------
    const newPreferredGenres = await prisma.preferredGenre.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     genreId: 2,
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     genreId: 4,
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     genreId: 5,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     genreId: 2,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     genreId: 8,
            // },
        ],
    });
    console.log({ newPreferredGenres });

    // --- PreferredPlatforms -------------
    const newPreferredPlatforms = await prisma.preferredPlatform.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     platformId: 1,
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     platformId: 2,
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     platformId: 3,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     platformId: 1,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     platformId: 3,
            // },
        ],
    });
    console.log({ newPreferredPlatforms });

    // --- PreferredThemes ----------------
    const newPreferredThemes = await prisma.preferredTheme.createMany({
        data: [
            // {
            //     id: 0,
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     themeId: 0,
            // },
            // {
            //     id: 1,
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     themeId: 1,
            // },
            // {
            //     id: 2,
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     themeId: 2,
            // },
            // {
            //     id: 3,
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     themeId: 3,
            // },
            // {
            //     id: 4,
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     themeId: 0,
            // },
        ],
    });
    console.log({ newPreferredThemes });

    // --- ReviewLikes --------------------
    const newReviewLikes = await prisma.reviewLike.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     reviewId: 1,
            // },
        ],
    });
    console.log({ newReviewLikes });

    // --- Reviews ------------------------
    const newReviews = await prisma.review.createMany({
        data: [
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     gameId: 0,
            //     content: "완전 갓겜입니다.",
            //     rating: 10,
            //     createdAt: "2025-05-15T02:05:00.000Z",
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     gameId: 0,
            //     content: "망겜입니다.",
            //     rating: 1,
            //     createdAt: "2025-05-15T02:06:00.000Z",
            //     updatedAt: "2025-05-15T02:07:00.000Z",
            // },
        ],
    });
    console.log({ newReviews });

    // --- ScorePollicies -----------------
    const newScorePolicies = await prisma.scorePolicy.createMany({
        data: [
             {
                 name: "출석 완료",
                 description: "일퀘는 생명. 일퀘를 했으면 리워드를 받아야죠. 5포인트가 적립됩니다.",
                 score: 5,
                 imageUrl: "icons/policy-attend.svg",
             },
            {
                name: "리뷰 삭제",
                description: "마따끄 리뷰를 삭제했으면 퍼니시먼트를 받아야겠지. 리뷰에 달린 좋아요 갯수만큼의 포인트가 차감됩니다.",
                score: 0,
                imageUrl: "icons/policy-review.svg",
            },
            {
                name: "리뷰 좋아요 획득",
                description: "당신은 따봉겜추의 축복을 받으셨습니다! 5포인트가 적립됩니다.",
                score: 5,
                imageUrl: "icons/policy-likes.svg",
            },
            {
                 name: "리뷰 좋아요 삭제",
                 description: "줬다 뺐는건 좀 아닌데. 5포인트가 지불됩니다.",
                 score: -5,
                 imageUrl: "icons/policy-likes.svg",
             },
            {
                 name: "투기장 참여",
                 description: "영웅 호걸들의 시간! 투기장 참가비 100포인트 지불합니다",
                 score: -100,
                 imageUrl: "icons/arena.svg",
             },
            {
                 name: "투기장 승리",
                 description: "겜안분 척결 다섯 글자의 환호성! 투기장에서 승리하셨습니다!! 190포인트가 적립됩니다.",
                 score: 190,
                 imageUrl: "icons/arena.svg",
            },
            {
                 name: "투기장 무승부",
                 description: "무승부로 하지 않을래....? 참가비 100포인트를 회수합니다.",
                 score: 100,
                 imageUrl: "icons/arena.svg",
            },
            {
                 name: "투기장 미성립",
                 description: "놀랍게도 그 누구도 관심을 주지 않았다. 참가비 100포인트를 회수합니다.",
                 score: 100,
                 imageUrl: "icons/arena.svg",
            },
        ],
    });
    console.log({ newScorePolicies });

    // --- ScoreRecords -------------------
    const newScoreRecords = await prisma.scoreRecord.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     policyId: 1,
            //     createdAt: "2025-05-15T01:00:00.000Z",
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     policyId: 2,
            //     createdAt: "2025-05-15T01:00:01.000Z",
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     policyId: 3,
            //     createdAt: "2025-05-15T01:00:02.000Z",
            // },
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     policyId: 4,
            //     createdAt: "2025-05-15T01:00:03.000Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     policyId: 1,
            //     createdAt: "2025-05-15T01:01:00.000Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     policyId: 2,
            //     createdAt: "2025-05-15T01:01:01.000Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     policyId: 3,
            //     createdAt: "2025-05-15T01:01:02.000Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     policyId: 4,
            //     createdAt: "2025-05-15T01:01:03.000Z",
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     policyId: 5,
            //     createdAt: "2025-05-15T01:01:04.000Z",
            // },
        ],
    });
    console.log({ newScoreRecords });

    // --- Votes --------------------------
    const newVotes = await prisma.vote.createMany({
        data: [
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     arenaId: 2,
            //     votedTo: "e755441d-1979-4617-acd5-531f2f898b22",
            // },
        ],
    });
    console.log({ newVotes });

    // --- Wishlists ----------------------
    const newWishlists = await prisma.wishlist.createMany({
        data: [
            // {
            //     memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
            //     gameId: 0,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     gameId: 0,
            // },
            // {
            //     memberId: "e755441d-1979-4617-acd5-531f2f898b22",
            //     gameId: 1,
            // },
        ],
    });
    console.log({ newWishlists });
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
