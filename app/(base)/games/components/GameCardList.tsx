import React from "react";
import GameCard from "./GameCard";

interface GameCardData {
    id: number;
    platform: string;
    title: string;
    expertRating: number;
    developer: string;
    thumbnail: string;
    reviewCount: number;
}

interface GameCardListProps {
    games: GameCardData[];
}

export default function GameCardList({ games }: GameCardListProps) {
    return (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
            {games.map((game) => (
                <GameCard key={game.id} {...game} />
            ))}
        </div>
    );
}
