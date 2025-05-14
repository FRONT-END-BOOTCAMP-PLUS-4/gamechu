import { getTwitchAccessToken } from "@/utils/GetTwitchAccessToken";
import { PrismaClient } from "./generated";

// import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    // ... you will write your Prisma Client queries here
    // --- Arena --------------------------
    const newArenas = await prisma.arena.createMany({
        data: [
            {
                id: 0,
                creatorId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                challengerId: "e755441d-1979-4617-acd5-531f2f898b22",
                title: "홓의 황족 라인은 미드다",
                description: "근본 미드가 짱이다. 다른 라인은 들러리일 뿐.",
                status: 5,
                startDate: "",
            },
        ],
    });
    console.log({ newArenas });

    // --- Chatting -----------------------
    const newChattings = await prisma.chatting.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                arenaId: 0,
                content:
                    "미드가 롤도 가장 잘하고 가장 중요하니까 황족 라인에 가장 어울려!",
                createdAt: "",
            },
            {
                id: 1,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                arenaId: 0,
                content:
                    "아니야! 맵 전반적인 영향력은 정글이 더 중요해! 그러니까 정글이야말로 백정이 아닌 황족 라인이야!",
                createdAt: "",
            },
        ],
    });
    console.log({ newChattings });

    // IGDB API -> game*, genre, platform, theme, 받아오기
    const clientId = process.env.TWITCH_CLIENT_ID!;
    try {
        const accessToken = await getTwitchAccessToken();
        // --- Game ---------------------------
        const newGames = await prisma.game.createMany({
            data: [],
        });
        console.log({ newGames });

        // --- Genres -------------------------
        const newGenres = await prisma.genre.createMany({
            data: [],
        });
        console.log({ newGenres });

        // --- Platforms ----------------------
        const newPlatforms = await prisma.platform.createMany({
            data: [],
        });
        console.log({ newPlatforms });

        // --- Themes -------------------------
        const newThemes = await prisma.theme.createMany({
            data: [],
        });
        console.log({ newThemes });

        // --- GameGenres ---------------------
        const newGameGenres = await prisma.gameGenre.createMany({
            data: [],
        });
        console.log({ newGameGenres });

        // --- GamePlatforms ------------------
        const newGamePlatforms = await prisma.gamePlatform.createMany({
            data: [],
        });
        console.log({ newGamePlatforms });

        // --- GameThemes ---------------------
        const newGameThemes = await prisma.gameTheme.createMany({
            data: [],
        });
        console.log({ newGameThemes });
    } catch {}

    // --- Member -------------------------
    const newMembers = await prisma.member.createMany({
        data: [
            {
                id: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                nickname: "멋사",
                email: "mutsa@newlecture.com",
                password: "1234", // need to add encoding scheme later
                imageUrl: "",
                birthDate: "",
                isMale: true,
                score: 1250,
                isAttended: true,
                createdAt: "",
            },
            {
                id: "e755441d-1979-4617-acd5-531f2f898b22",
                nickname: "겜잘알",
                email: "gamejalal@newlecture.com",
                password: "1234",
                imageUrl: "",
                birthDate: "",
                isMale: false,
                score: 3300,
                isAttended: true,
                createdAt: "",
            },
        ],
    });
    console.log({ newMembers });

    // --- NotificationRecord -------------
    const newNotificationRecords = await prisma.notificationRecord.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                typeId: 0,
                description: "실버 IV 단계로 승급하셨습니다. 축하합니다!",
                createdAt: "",
            },
            {
                id: 1,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                typeId: 1,
                description: "플래티넘 IV 단계로 강등되셨습니다.",
                createdAt: "",
            },
        ],
    });
    console.log({ newNotificationRecords });

    // --- NotificationType ---------------
    const newNotificationTypes = await prisma.notificationType.createMany({
        data: [
            {
                id: 0,
                name: "티어 승급",
                imageUrl: "",
            },
            {
                id: 1,
                name: "티어 강등",
                imageUrl: "",
            },
            {
                id: 2,
                name: "투기장 도전자 참여 완료",
                imageUrl: "",
            },
            {
                id: 3,
                name: "투기장 토론 시작",
                imageUrl: "",
            },
            {
                id: 4,
                name: "투기장 투표 완료",
                imageUrl: "",
            },
        ],
    });
    console.log({ newNotificationTypes });

    // --- PreferredGenres ----------------
    const newPreferredGenres = await prisma.preferredGenre.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                genreId: 0,
            },
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                genreId: 1,
            },
            {
                id: 2,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                genreId: 2,
            },
            {
                id: 3,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                genreId: 3,
            },
            {
                id: 4,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                genreId: 4,
            },
        ],
    });
    console.log({ newPreferredGenres });

    // --- PreferredPlatforms -------------
    const newPreferredPlatforms = await prisma.preferredPlatform.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                platformId: 0,
            },
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                platformId: 1,
            },
            {
                id: 2,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                platformId: 2,
            },
            {
                id: 3,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                platformId: 0,
            },
            {
                id: 4,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                platformId: 3,
            },
        ],
    });
    console.log({ newPreferredPlatforms });

    // --- PreferredThemes ----------------
    const newPreferredThemes = await prisma.preferredTheme.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                themeId: 0,
            },
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                themeId: 1,
            },
            {
                id: 2,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                themeId: 2,
            },
            {
                id: 3,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                themeId: 3,
            },
            {
                id: 4,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                themeId: 0,
            },
        ],
    });
    console.log({ newPreferredThemes });

    // --- ReviewLikes --------------------
    const newReviewLikes = await prisma.reviewLike.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                reviewId: 0,
            },
        ],
    });
    console.log({ newReviewLikes });

    // --- Reviews ------------------------
    const newReviews = await prisma.review.createMany({
        data: [
            {
                id: 0,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                gameId: 0,
                content: "완전 갓겜입니다.",
                rating: 10,
                createdAt: "",
            },
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                gameId: 0,
                content: "망겜입니다.",
                rating: 1,
                createdAt: "",
                updatedAt: "",
            },
        ],
    });
    console.log({ newReviews });

    // --- ScorePollicies -----------------
    const newScorePolicies = await prisma.scorePolicy.createMany({
        data: [
            {
                id: 0,
                name: "출석",
                description: "하루 1회 로그인 시 받는 점수입니다.",
                score: 5,
                imageUrl: "",
            },
            {
                id: 1,
                name: "리뷰 등록",
                description: "게임 리뷰를 등록하면 받는 점수입니다.",
                score: 10,
                imageUrl: "",
            },
            {
                id: 2,
                name: "리뷰 좋아요 받음",
                description: "하루 1회 로그인 시 받는 점수입니다.",
                score: 5,
                imageUrl: "",
            },
            {
                id: 3,
                name: "막고라 참여",
                description: "막고라에 참여하여 차감된 점수입니다.",
                score: -100,
                imageUrl: "",
            },
            {
                id: 4,
                name: "막고라 승리",
                description: "막고라에 승리하셔서 얻은 점수입니다.",
                score: 190,
                imageUrl: "",
            },
        ],
    });
    console.log({ newScorePolicies });

    // --- ScoreRecords -------------------
    const newScoreRecords = await prisma.scoreRecord.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                policyId: 0,
                createdAt: "",
            },
            {
                id: 1,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                policyId: 1,
                createdAt: "",
            },
            {
                id: 2,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                policyId: 2,
                createdAt: "",
            },
            {
                id: 3,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                policyId: 3,
                createdAt: "",
            },
            {
                id: 4,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                policyId: 0,
                createdAt: "",
            },
            {
                id: 5,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                policyId: 1,
                createdAt: "",
            },
            {
                id: 6,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                policyId: 2,
                createdAt: "",
            },
            {
                id: 7,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                policyId: 3,
                createdAt: "",
            },
            {
                id: 8,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                policyId: 4,
                createdAt: "",
            },
        ],
    });
    console.log({ newScoreRecords });

    // --- Votes --------------------------
    const newVotes = await prisma.vote.createMany({
        data: [
            {
                id: 0,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                arenaId: 0,
                votedTo: "e755441d-1979-4617-acd5-531f2f898b22",
            },
        ],
    });
    console.log({ newVotes });

    // --- Wishlists ----------------------
    const newWishlists = await prisma.wishlist.createMany({
        data: [
            {
                id: 0,
                memberId: "7ae5e5c9-0c28-426f-952f-85bdfdcfc522",
                gameId: 0,
            },
            {
                id: 1,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                gameId: 0,
            },
            {
                id: 2,
                memberId: "e755441d-1979-4617-acd5-531f2f898b22",
                gameId: 1,
            },
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
