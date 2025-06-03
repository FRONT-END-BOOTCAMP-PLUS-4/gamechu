"use client";

import { useEffect, useRef, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import useVoteList from "@/hooks/useVoteList";
import CompleteArenaCard from "@/app/(base)/arenas/components/CompleteArenaCard";

export default function MyCompletedArenaList() {
    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useFetchArenas({
        currentPage: 1,
        status: 5, // 종료된 투기장
        mine: true,
        pageSize: 10,
    });

    const [arenaIdsToFetch, setArenaIdsToFetch] = useState<number[]>([]);
    const fetchedIdsRef = useRef<string>("");

    useEffect(() => {
        if (!arenaListDto?.arenas) return;

        const ids = arenaListDto.arenas.map((arena) => arena.id).sort();
        const idsString = ids.join(",");

        if (fetchedIdsRef.current === idsString) return;

        setArenaIdsToFetch(ids);
        fetchedIdsRef.current = idsString;
    }, [arenaListDto?.arenas]);

    const {
        voteResult,
        loading: voteLoading,
        error: voteError,
    } = useVoteList({ arenaIds: arenaIdsToFetch });

    useEffect(() => {
        if (!arenaLoading && arenaListDto?.arenas) {
            console.log("✅ 디버깅: 가져온 arena 개수:", arenaListDto.arenas.length);
        }
    }, [arenaLoading, arenaListDto]);

    if (arenaListDto && arenaListDto.arenas) {
        arenaListDto.arenas.forEach((arena) => {
            const vote = voteResult.find((v) => v.arenaId === arena.id);
            arena.leftPercent = vote ? vote.leftPercent : 50;
        });
    }

    if (arenaLoading || voteLoading) {
        return <p className="text-font-200 text-sm">로딩 중입니다...</p>;
    }

    if (arenaError || voteError) {
        return <p className="text-red-500 text-sm">투기장 정보를 불러오는 데 실패했습니다.</p>;
    }

    if (arenaListDto?.arenas.length === 0) {
        return <p className="text-font-200 text-sm">참여한 종료된 투기장이 없습니다.</p>;
    }

    return (
        <div className="flex flex-col items-center gap-6">
            {arenaListDto?.arenas.map((arena) => (
                <CompleteArenaCard key={arena.id} {...arena} />
            ))}
        </div>
    );
}
