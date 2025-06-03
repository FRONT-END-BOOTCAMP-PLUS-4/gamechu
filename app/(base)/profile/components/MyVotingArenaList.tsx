"use client";

import { useEffect, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import VotingArenaCard from "../../arenas/components/VotingArenaCard";
import Pager from "@/app/components/Pager";

export default function MyVotingArenaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const {
        arenaListDto,
        loading,
        error,
    } = useFetchArenas({
        currentPage,
        status: 4,     // 상태 4 = 투표 중
        mine: true,    // 내가 생성하거나 참여한 투기장만
        pageSize,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 투표 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-font-200 text-sm">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-red-500 text-sm">
                투기장 정보를 불러오는 데 실패했습니다.
            </p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return (
            <p className="text-font-200 text-sm">투표 중인 투기장이 없습니다.</p>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            {/* 투표 중인 투기장 카드 리스트 */}
            {arenaListDto.arenas.map((arena) => (
                <VotingArenaCard
                    key={arena.id}
                    id={arena.id}
                    title={arena.title}
                    creatorNickname={arena.creatorNickname}
                    creatorScore={arena.creatorScore}
                    challengerNickname={arena.challengerNickname}
                    challengerScore={arena.challengerScore}
                    voteEndDate={new Date(arena.voteEndDate)}
                    voteCount={arena.voteCount}
                />
            ))}

            {/* 페이지네이션 */}
            <Pager
                currentPage={arenaListDto.currentPage}
                endPage={arenaListDto.endPage}
                pages={arenaListDto.pages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}
