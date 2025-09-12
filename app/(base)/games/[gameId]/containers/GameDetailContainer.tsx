import GameHeaderImageSection from "../components/GameHedaerImageSection";
import GameInfoCard from "../components/GameInfoCard";
import ClientContentWrapper from "../components/ClientContentWrapper";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";
import { PrismaReviewRepository } from "@/backend/review/infra/repositories/prisma/PrismaReviewRepository";
import GameHeaderInfoSection from "../components/GameHeaderInfoSection";

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
        <div className="min-h-screen space-y-10 bg-background-400 pb-10 pt-6 text-font-100">
            {/* lg미만 레이아웃*/}
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 rounded-3xl bg-background-100 p-8 lg:hidden">
                <GameHeaderImageSection
                    image={game.thumbnail ?? ""}
                    title={game.title}
                />
                <div className="flex">
                    <div className="flex-1">
                        <GameHeaderInfoSection
                            title={game.title}
                            developer={game.developer}
                            rating={game.rating}
                            releaseDate={game.releaseDate}
                            gameId={gameId}
                            viewerId={viewerId ?? ""}
                        />
                    </div>
                    <div className="flex-1">
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

            {/* lg이상 레이아웃 */}
            <div className="mx-auto hidden max-w-[1400px] flex-col gap-6 px-0 lg:flex">
                <div className="flex gap-6">
                    {/* flex-[3_2] = flex-grow:2, flex-shrink:2 (flex-shrink는 공간 부족 시 줄어드는 비율) */}
                    <div className="flex min-w-0 flex-[3_2] gap-6 rounded-3xl bg-background-100 p-4">
                        <div className="flex min-w-0 flex-1 items-center justify-center p-4">
                            <GameHeaderImageSection
                                image={game.thumbnail ?? ""}
                                title={game.title}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <GameHeaderInfoSection
                                title={game.title}
                                developer={game.developer}
                                rating={game.rating}
                                releaseDate={game.releaseDate}
                                gameId={gameId}
                                viewerId={viewerId ?? ""}
                            />
                        </div>
                    </div>
                    <div className="min-w-0 flex-[1_1] rounded-3xl bg-background-100 p-4">
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
