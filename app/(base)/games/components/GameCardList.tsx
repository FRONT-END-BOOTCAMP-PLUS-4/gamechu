import React from "react";
import GameCard from "./GameCard";
import Image from "next/image";

export type GameCardData = {
    id: number;
    platform: string;
    title: string;
    expertRating: number;
    developer: string;
    thumbnail: string;
    reviewCount: number;
};

type GameCardListProps = {
    games: GameCardData[];
};

export default function GameCardList({ games }: GameCardListProps) {
    if (games.length === 0) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-28 text-center">
                <Image
                    src="/images/empty-game.svg"
                    width={120}
                    height={120}
                    alt="No data image"
                />

                <h3 className="mb-2 text-xl font-bold text-gray-300">
                    검색 결과가 없습니다
                </h3>
                <p className="text-sm text-gray-400">
                    선택한 필터 조건에 맞는 게임을 찾을 수 없어요.
                    <br />
                    다른 필터를 시도해 보세요.
                </p>
            </div>
        );
    }
    return (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
            {games.map((game) => (
                <GameCard key={game.id} {...game} />
            ))}
        </div>
    );
}
