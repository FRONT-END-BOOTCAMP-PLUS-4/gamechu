"use client";

import { useEffect  } from "react";
import useFetchArenas from "@/hooks/useArenas";
import WaitingArenaCard from "../../arenas/components/WaitingArenaCard";

export default function MyWaitingArenaList() {
    const {
        arenaListDto,
        loading,
        error,
    } = useFetchArenas({
        currentPage: 1,
        status: 2, // 대기 중인 투기장
        mine: true, // 내가 만든 또는 참여한
        pageSize: 10,
    });

    useEffect(() => {
        if (!loading && arenaListDto?.arenas) {
            console.log("✅ 대기 중 투기장 개수:", arenaListDto.arenas.length);
        }
    }, [loading, arenaListDto]);

    if (loading) {
        return <p className="text-font-200 text-sm">로딩 중입니다...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-sm">투기장 정보를 불러오는 데 실패했습니다.</p>;
    }

    if (!arenaListDto || arenaListDto.arenas.length === 0) {
        return <p className="text-font-200 text-sm">대기 중인 투기장이 없습니다.</p>;
    }

    return (
        <div className="flex flex-col items-center gap-6">
            {arenaListDto.arenas.map((arena) => (
                <WaitingArenaCard
                    key={arena.id}
                    id={arena.id}
                    title={arena.title}
                    creatorNickname={arena.creatorNickname}
                    creatorScore={arena.creatorScore}
                    challengerNickname={arena.challengerNickname}
                    challengerScore={arena.challengerScore}
                    startDate={new Date(arena.startDate)}
                />
            ))}
        </div>
    );
}
