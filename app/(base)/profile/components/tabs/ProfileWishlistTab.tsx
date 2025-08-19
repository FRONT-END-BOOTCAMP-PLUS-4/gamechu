"use client";

import GameCard from "@/app/(base)/games/components/GameCard";
import Pager from "@/app/components/Pager";

interface Game {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
    expertRating: number;
    reviewCount: number;
}

interface Props {
    games: Game[];
    pages: number[];
    currentPage: number;
    endPage: number;
    onPageChange: (page: number) => void;
}

export default function ProfileWishlistTab({
    games,
    pages,
    currentPage,
    endPage,
    onPageChange,
}: Props) {
    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-background-400 p-6 shadow">
            <h2 className="mb-2 text-body text-lg font-semibold">
                위시리스트 목록
            </h2>

            {games.length === 0 ? (
                <p className="text-sm text-font-200">
                    위시리스트에 등록된 게임이 없습니다.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 min-[820px]:grid-cols-2">
                        {games.map((game) => (
                            <GameCard key={game.id} {...game} />
                        ))}
                    </div>

                    {endPage > 1 && (
                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={onPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}
