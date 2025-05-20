import React from "react";
import GameCard from "./GameCard";

interface GameCardData {
    id: number;
    platform: string;
    title: string;
    rating: number;
    developer: string;
    thumbnail: string;
}

interface GameCardListProps {
    games: GameCardData[];
}

export default function GameCardList({ games }: GameCardListProps) {
    return (
        <div className="grid grid-cols-3 gap-[15px] w-[1020px]">
            {games.slice(0, 12).map((game) => (
                <GameCard key={game.id} {...game} />
            ))}
        </div>
    );
}
