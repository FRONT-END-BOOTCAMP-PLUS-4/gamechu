import React from "react";
import GameCard from "./GameCard";

interface GameCardData {
    platform: string;
    title: string;
    rating: number;
    developer: string;
    backgroundImage: string;
}

interface GameCardListProps {
    games: GameCardData[];
}

export default function GameCardList({ games }: GameCardListProps) {
    return (
        <div className="flex flex-wrap gap-[15px]">
            {games.slice(0, 12).map((game, index) => (
                <GameCard key={index} {...game} />
            ))}
        </div>
    );
}
