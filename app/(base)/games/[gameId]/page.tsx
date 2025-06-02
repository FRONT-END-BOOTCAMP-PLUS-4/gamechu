import GameDetailContainer from "./containers/GameDetailContainer";

interface PageProps {
    params: Promise<{ gameId: string }>;
}

export default async function GameDetailPage(props: PageProps) {
    const resolvedParams = await props.params;
    const gameId = parseInt(resolvedParams.gameId, 10);

    return <GameDetailContainer gameId={gameId} />;
}
