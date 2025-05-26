"use client";

import GameCard from "@/app/(base)/game/components/GameCard";

interface Game {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
    rating: number;
}

export default function ProfileWishlistTab({ games }: { games: Game[] }) {
    if (games.length === 0) {
        return (
            <div className="text-font-200 text-sm">
                위시리스트에 등록된 게임이 없습니다.
            </div>
        );
    }

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-body mb-2">
                위시리스트 목록
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {games.map((game) => (
                    <GameCard key={game.id} {...game} />
                ))}
            </div>
        </div>
    );
}
