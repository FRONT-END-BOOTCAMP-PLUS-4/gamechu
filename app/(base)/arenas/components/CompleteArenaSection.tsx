"use client";

import useArenas from "@/hooks/useArenas";
import ArenaSectionHeader from "./ArenaSectionHeader";
import CompleteArenaCard from "./CompleteArenaCard";
import useVoteList from "@/hooks/useVoteList";
import { useEffect, useRef, useState } from "react";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";

interface Props {
    onLoaded?: () => void; // ✅ 상위 ArenaPage로 로딩 완료 알림
}

export default function CompleteArenaSection({ onLoaded }: Props) {
    const status: number = 5;

    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status,
        currentPage: 1,
        mine: false,
        pageSize: 2,
    });

    useArenaAutoStatus({
        arenaList: arenaListDto?.arenas || [],
        onStatusUpdate: (arenaId, newStatus) => {
            console.log(
                `Arena ${arenaId}가 상태 ${newStatus}로 전이되었습니다.`
            );
        },
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
    // ✅ 완료된 투표 데이터를 arena 객체에 반영
    if (arenaListDto && arenaListDto.arenas) {
        arenaListDto.arenas.forEach((arena) => {
            const vote = voteResult.find((vote) => vote.arenaId === arena.id);
            if (vote) {
                arena.voteCount = arena.voteCount;
                arena.leftPercent = arena.leftPercent;
            } else {
                arena.voteCount = 0;
            }
        });
    }

    // ✅ 로딩 완료되면 상위로 알림
    useEffect(() => {
        if (!arenaLoading && !voteLoading) {
            onLoaded?.();
        }
    }, [arenaLoading, voteLoading, onLoaded]);

    if (arenaLoading || voteLoading) {
        return (
            <div className="col-span-3 text-center text-gray-400">
                로딩중...
            </div>
        );
    }

    if (arenaError || voteError) {
        return (
            <div className="col-span-3 text-center text-red-500">
                투기장 정보를 불러오는 데 실패했습니다. 나중에 다시
                시도해주세요.
            </div>
        );
    }

    return (
        <div>
            <ArenaSectionHeader status={5} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 px-6">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto?.arenas.map((arena) => (
                        <CompleteArenaCard key={arena.id} {...arena} />
                    ))
                )}
            </div>
        </div>
    );
}
