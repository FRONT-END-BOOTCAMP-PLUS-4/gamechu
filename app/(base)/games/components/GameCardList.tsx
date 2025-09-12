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
        <div className="mb-4 grid grid-cols-1 justify-center gap-6 sm:sm:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {games.map((game) => (
                <GameCard key={game.id} {...game} />
            ))}
        </div>
    );
}
