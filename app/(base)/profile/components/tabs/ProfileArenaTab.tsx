"use client";

import { useEffect, useRef, useState } from "react";
import useFetchArenas from "@/hooks/useArenas";
import useVoteList from "@/hooks/useVoteList";
import CompleteArenaCard from "@/app/(base)/arenas/components/CompleteArenaCard";

export default function ProfileArenaTab() {
    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useFetchArenas({
        currentPage: 1,
        status: 5, // 종료된 투기장
        mine: false, // 내가 만든 또는 참여한
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
    } = useVoteList({
        arenaIds: arenaIdsToFetch,
    });

    useEffect(() => {
        if (!arenaLoading && arenaListDto?.arenas) {
            console.log("✅ 디버깅: 가져온 arena 개수:", arenaListDto.arenas.length);
            console.table(
                arenaListDto.arenas.map((a) => ({
                    id: a.id,
                    title: a.title,
                    creatorId: a.creatorId,
                    challengerId: a.challengerId,
                    status: a.status,
                }))
            );
        }
    }, [arenaLoading, arenaListDto]);

    if (arenaListDto && arenaListDto.arenas) {
        arenaListDto.arenas.forEach((arena) => {
            const vote = voteResult.find((v) => v.arenaId === arena.id);
            arena.leftPercent = vote ? vote.leftPercent : 50;
        });
    }

    return (
        <div className="w-full bg-background-300 p-6 rounded-xl shadow flex flex-col gap-8">
            <h2 className="text-lg font-semibold text-body">투기장</h2>

            {arenaLoading || voteLoading ? (
                <p className="text-font-200 text-sm">로딩 중입니다...</p>
            ) : arenaError || voteError ? (
                <p className="text-red-500 text-sm">
                    투기장 정보를 불러오는 데 실패했습니다.
                </p>
            ) : arenaListDto?.arenas.length === 0 ? (
                <p className="text-font-200 text-sm">
                    참여한 종료된 투기장이 없습니다.
                </p>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    {arenaListDto?.arenas.map((arena) => (
                        <CompleteArenaCard key={arena.id} {...arena} />
                    ))}
                </div>
            )}
        </div>
    );
}
