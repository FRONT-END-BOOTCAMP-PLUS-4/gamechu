"use client";

import useVoteList from "@/hooks/useVoteList";
import ArenaSectionHeader from "./ArenaSectionHeader";
import VotingArenaCard from "./VotingArenaCard";
import useArenas from "@/hooks/useArenas";
import { useEffect, useRef, useState } from "react";
import { useArenaAutoStatus } from "@/hooks/useArenaAutoStatus";
import { GetSectionTitle } from "@/utils/GetSectionTitle";

interface Props {
    onLoaded?: () => void; // ✅ 상위 ArenaPage로 로딩 완료 신호
}

export default function VotingArenaSection({ onLoaded }: Props) {
    const status: number = 4;

    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status,
        currentPage: 1,
        mine: false,
        pageSize: 3,
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

    // ✅ 로딩 완료되면 상위에 알림
    useEffect(() => {
        if (!arenaLoading && !voteLoading) {
            onLoaded?.();
        }
    }, [arenaLoading, voteLoading, onLoaded]);

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
            <ArenaSectionHeader status={4} />
            <div className="mt-4 grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto!.arenas.map((arena) => (
                        <VotingArenaCard
                            key={arena.id}
                            {...arena}
                            voteEndDate={new Date(arena.voteEndDate)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
