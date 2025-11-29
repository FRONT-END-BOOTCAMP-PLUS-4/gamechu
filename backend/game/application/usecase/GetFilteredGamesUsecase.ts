import { GameRepository } from "@/backend/game/domain/repositories/GameRepository";
import { GameFilter } from "@/backend/game/domain/repositories/filters/GameFilter";
import { ReviewRepository } from "@/backend/review/domain/repositories/ReviewRepository";
import { GameCardDto } from "./dto/GameCardDto";

import { GetFilteredGamesRequestDto } from "./dto/GetFilteredGamesRequestDto";
import { GetFilteredGamesResponseDto } from "./dto/GetFilteredGamesResponseDto";

export class GetFilteredGamesUsecase {
    constructor(
        private readonly gameRepository: GameRepository,
        private readonly reviewRepository: ReviewRepository
    ) {}

    async execute(
        dto: GetFilteredGamesRequestDto
    ): Promise<GetFilteredGamesResponseDto> {
        const isLatest = dto.sort === "latest";

        const filter = new GameFilter(
            dto.genreId,
            dto.themeId,
            dto.platformId,
            dto.keyword,
            dto.sort,
            false,
            isLatest ? dto.offset : 0,
            isLatest ? dto.limit : undefined
        );

        const games = await this.gameRepository.findAll(filter);
        const gameIds = games.map((g) => g.id);

        const gamesTotalCount = await this.gameRepository.count(
            new GameFilter(
                dto.genreId,
                dto.themeId,
                dto.platformId,
                dto.keyword,
                dto.sort,
                false,
                0,
                undefined
            )
        );

        // 모든 리뷰 가져오기
        const allReviews =
            await this.reviewRepository.findAllByGameIds(gameIds);

        // 리뷰 통계 계산
        const stats: Record<
            number,
            { reviewCount: number; expertRating: number }
        > = {};
        const expertRatingSum: Record<number, number> = {};
        const expertCount: Record<number, number> = {};

        for (const review of allReviews) {
            const { gameId, rating, memberScore } = review;

            if (!stats[gameId]) {
                stats[gameId] = { reviewCount: 0, expertRating: 0 };
                expertRatingSum[gameId] = 0;
                expertCount[gameId] = 0;
            }

            stats[gameId].reviewCount += 1;

            if (memberScore >= 3000) {
                expertRatingSum[gameId] += rating;
                expertCount[gameId] += 1;
            }
        }

        for (const gameId of gameIds) {
            if (!stats[gameId]) {
                stats[gameId] = { reviewCount: 0, expertRating: 0 };
            }

            const count = expertCount[gameId] ?? 0;
            stats[gameId].expertRating =
                count > 0 ? expertRatingSum[gameId]! / count / 2 : 0;
        }

        const enrichedGames: GameCardDto[] = games.map((game) => {
            const stat = stats[game.id] ?? {
                reviewCount: 0,
                expertRating: 0,
            };

            return {
                id: game.id,
                title: game.title,
                thumbnail: game.thumbnail ?? "",
                developer: game.developer ?? "알 수 없음",
                platform: game.gamePlatforms?.[0]?.platform.name ?? "기타",
                expertRating: stat.expertRating,
                reviewCount: stat.reviewCount,
                releaseDate: game.releaseDate ?? new Date(0),
            };
        });
        if (!isLatest) {
            switch (dto.sort) {
                case "popular":
                    enrichedGames.sort((a, b) => b.reviewCount - a.reviewCount);
                    break;
                case "rating":
                    enrichedGames.sort(
                        (a, b) => b.expertRating - a.expertRating
                    );
                    break;
            }
        }

        const paged = isLatest
            ? enrichedGames
            : enrichedGames.slice(dto.offset, dto.offset + dto.limit);

        return {
            data: paged,
            totalCount: gamesTotalCount,
        };
    }
}
