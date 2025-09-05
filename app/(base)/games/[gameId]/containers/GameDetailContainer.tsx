import GameTitleCardBase from "../components/GameTitleCardBase";
import GameInfoCard from "../components/GameInfoCard";
import ClientContentWrapper from "../components/ClientContentWrapper";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";

interface Props {
    gameId: number;
}

export default async function GameDetailContainer({ gameId }: Props) {
    const viewerId = await getAuthUserId();

    const gameRepository = new GamePrismaRepository();
    const reviewRepository = new PrismaReviewRepository();
    const gameDetailUsecase = new GetGameDetailUsecase(
        gameRepository,
        reviewRepository
    );
    const game = await gameDetailUsecase.execute(gameId);

    return (
        <div className="min-h-screen space-y-10 bg-background-400 pb-10 text-font-100">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-between gap-6 px-4 pt-10 lg:flex-row lg:px-0 lg:pt-20">
                <div className="flex w-full flex-col gap-6 lg:flex-row">
                    <div className="flex-[3]">
                        <GameTitleCardBase
                            image={game.thumbnail ?? ""}
                            title={game.title}
                            developer={game.developer ?? ""}
                            releaseDate={game.releaseDate ?? ""}
                            gameId={game.id}
                            rating={game.rating ?? undefined}
                            viewerId={viewerId ?? ""}
                        />
                    </div>

                    <div className="flex-[1]">
                        <GameInfoCard
                            platforms={game.platforms}
                            genres={game.genres}
                            themes={game.themes}
                            wishCount={game.wishCount}
                            reviewCount={game.reviewCount}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-black-300 w-full">
                <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-6">
                    <ClientContentWrapper gameId={gameId} viewerId={viewerId} />
                </div>
            </div>
        </div>
    );
}
