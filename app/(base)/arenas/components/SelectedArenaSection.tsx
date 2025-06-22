"use client";

import { GetSectionTitle } from "@/utils/GetSectionTitle";
import ArenaSectionHeader from "./ArenaSectionHeader";
import VotingArenaCard from "./VotingArenaCard";
import useArenas from "@/hooks/useArenas";
import RecruitingArenaCard from "./RecruitingArenaCard";
import WaitingArenaCard from "./WaitingArenaCard";
import DebatingArenaCard from "./DebatingArenaCard";
import CompleteArenaCard from "./CompleteArenaCard";
import Pager from "@/app/components/Pager";
import { useRouter } from "next/navigation";
import useVoteList from "@/hooks/useVoteList";
import { useEffect, useRef, useState } from "react";

type SelectedArenaSectionProps = {
    status: number;
    currentPage: number;
    onLoaded?: () => void; // ✅ 추가: 로딩 완료 콜백
};

export default function SelectedArenaSection({
    status,
    currentPage,
    onLoaded,
}: SelectedArenaSectionProps) {
    const {
        arenaListDto,
        loading: arenaLoading,
        error: arenaError,
    } = useArenas({
        status,
        currentPage,
        mine: false,
        pageSize: [1, 5].includes(status) ? 6 : 9,
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

    // ✅ 로딩 완료되면 상위 콜백 호출
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
                arena.leftPercent = arena.leftCount;
            } else {
                arena.voteCount = 0;
            }
        });
    }

    const pages: number[] = arenaListDto?.pages || [];
    const endPage: number = arenaListDto?.endPage || 1;

    const router = useRouter();
    const handleQueryChange = (newPage: number, newStatus: number | null) => {
        router.push(`?currentPage=${newPage}&status=${newStatus}`);
    };

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
            <ArenaSectionHeader status={status} />
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                    [1, 5].includes(status) ? "" : "lg:grid-cols-3"
                } gap-6 mt-4 px-6`}
            >
                {arenaListDto?.arenas.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500">
                        현재 {GetSectionTitle(status)}이 없습니다.
                    </div>
                ) : (
                    arenaListDto?.arenas.map((arena) => {
                        switch (status) {
                            case 1:
                                return (
                                    <RecruitingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        startDate={new Date(arena.startDate)}
                                    />
                                );
                            case 2:
                                return (
                                    <WaitingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        startDate={new Date(arena.startDate)}
                                    />
                                );
                            case 3:
                                return (
                                    <DebatingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        debateEndDate={
                                            new Date(arena.debateEndDate)
                                        }
                                    />
                                );
                            case 4:
                                return (
                                    <VotingArenaCard
                                        key={arena.id}
                                        {...arena}
                                        voteEndDate={
                                            new Date(arena.voteEndDate)
                                        }
                                    />
                                );
                            case 5:
                                return (
                                    <CompleteArenaCard
                                        key={arena.id}
                                        {...arena}
                                    />
                                );
                            default:
                                return null;
                        }
                    })
                )}
            </div>

            {arenaListDto?.arenas.length !== 0 && (
                <div className="w-full flex justify-center mt-12">
                    <Pager
                        currentPage={currentPage}
                        pages={pages}
                        endPage={endPage}
                        onPageChange={(newPage: number) => {
                            handleQueryChange(newPage, status);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
