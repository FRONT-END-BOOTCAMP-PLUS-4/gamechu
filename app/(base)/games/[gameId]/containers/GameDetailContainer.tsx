import GameTitleCardBase from "../components/GameTitleCardBase";
import GameInfoCard from "../components/GameInfoCard";
import ClientContentWrapper from "../components/ClientContentWrapper";
import { GetGameDetailUsecase } from "@/backend/game/application/usecase/GetGameDetailUsecase";
import { GamePrismaRepository } from "@/backend/game/infra/repositories/prisma/GamePrismaRepository";
import { getAuthUserId } from "@/utils/GetAuthUserId.server";

interface Props {
    gameId: number;
}

export default async function GameDetailContainer({ gameId }: Props) {
    const viewerId = await getAuthUserId();

    const gameRepository = new GamePrismaRepository();
    const gameDetailUsecase = new GetGameDetailUsecase(gameRepository);
    const game = await gameDetailUsecase.execute(gameId);

    return (
        <div className="min-h-screen bg-background-400 text-font-100 space-y-20 pb-10">
            <div className="flex w-[1400px] mx-auto justify-between gap-6 pt-20">
                <GameTitleCardBase
                    image={game.thumbnail ?? ""}
                    title={game.title}
                    developer={game.developer ?? ""}
                    releaseDate={game.releaseDate ?? ""}
                    gameId={game.id}
                    rating={game.rating ?? undefined}
                    viewerId={viewerId ?? ""}
                />
                <GameInfoCard
                    platforms={game.platforms}
                    genres={game.genres}
                    themes={game.themes}
                    wishCount={game.wishCount}
                    reviewCount={game.reviewCount}
                />
            </div>

            <div className="w-full bg-black-300">
                <div className="flex w-[1400px] mx-auto gap-6 items-start">
                    <ClientContentWrapper gameId={gameId} viewerId={viewerId} />
                </div>
            </div>
        </div>
    );
}
