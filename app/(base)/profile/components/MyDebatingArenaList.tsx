"use client";

import { useEffect } from "react";
import useFetchArenas from "@/hooks/useArenas";
import DebatingArenaCard from "../../arenas/components/DebatingArenaCard";

export default function MyDebatingArenaList() {
    const {
        arenaListDto,
        loading,
        error,
    } = useFetchArenas({
        currentPage: 1,
        status: 3, // 토론 중인 투기장
        mine: true,
        pageSize: 10,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 진행 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-font-200 text-sm">로딩 중입니다...</p>;
    }

    if (error) {
        return (
            <p className="text-red-500 text-sm">투기장 정보를 불러오는 데 실패했습니다.</p>
        );
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return <p className="text-font-200 text-sm">진행 중인 투기장이 없습니다.</p>;
    }

    return (
        <div className="flex flex-col items-center gap-6">
            {arenaListDto.arenas.map((arena) => (
                <DebatingArenaCard
                    key={arena.id}
                    id={arena.id}
                    title={arena.title}
                    creatorNickname={arena.creatorNickname}
                    creatorScore={arena.creatorScore}
                    challengerNickname={arena.challengerNickname}
                    challengerScore={arena.challengerScore}
                    debateEndDate={new Date(arena.debateEndDate)}
                />
            ))}
        </div>
    );
}
