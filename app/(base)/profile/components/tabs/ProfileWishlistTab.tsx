"use client";

import { useState } from "react";
import GameCard from "@/app/(base)/games/components/GameCard";
import Pager from "@/app/components/Pager";

interface Game {
    id: number;
    title: string;
    developer: string;
    thumbnail: string;
    platform: string;
    expertRating: number;
}

export default function ProfileWishlistTab({ games }: { games: Game[] }) {
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = games.length;
    const endPage = Math.ceil(totalItems / itemsPerPage);
    const pages = Array.from({ length: endPage }, (_, i) => i + 1);

    const currentGames = games.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-body mb-2">
                위시리스트 목록
            </h2>

            {games.length === 0 ? (
                    <p className="text-font-200 text-sm">
                        위시리스트에 등록된 게임이 없습니다.
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-6">
                            {currentGames.map((game) => (
                                <GameCard key={game.id} {...game} />
                            ))}
                        </div>

                        <Pager
                            currentPage={currentPage}
                            pages={pages}
                            endPage={endPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
        </div>
    );
}
